import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { Tracker } from "./Tracker.js";
import type { TrackingFrame, FaceData, EulerAngles, BlendShapeMap } from "../types/tracking.js";

/**
 * MediaPipe のブレンドシェイプ名を独自名にマッピングするテーブル。
 * 将来別のトラッカーに切り替えても Mapper 側のコードを変えなくて済む。
 */
const BLEND_SHAPE_MAP: Record<string, string> = {
  eyeBlinkLeft:      "eye_l.blink",
  eyeBlinkRight:     "eye_r.blink",
  jawOpen:           "mouth.open",
  browDownLeft:      "brow_l.down",
  browDownRight:     "brow_r.down",
  browInnerUp:       "brow.inner_up",
  mouthSmileLeft:    "mouth.smile_l",
  mouthSmileRight:   "mouth.smile_r",
};

/** MediaPipe FaceLandmarker の wasm/model ファイル配置場所 */
const VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

export class TrackerImpl implements Tracker {
  private landmarker: FaceLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private latestFrame: TrackingFrame | null = null;
  private animFrameId: number | null = null;

  async start(): Promise<void> {
    // MediaPipe 初期化
    const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

    // カメラ取得
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    });

    this.video = document.createElement("video");
    this.video.srcObject = this.stream;
    this.video.playsInline = true;
    await this.video.play();

    // 推論ループ開始
    this.scheduleDetection();
  }

  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video = null;
    this.landmarker?.close();
    this.landmarker = null;
    this.latestFrame = null;
  }

  getLatestFrame(): TrackingFrame | null {
    return this.latestFrame;
  }

  // -----------------------------------------------------------------------
  // private

  private scheduleDetection(): void {
    this.animFrameId = requestAnimationFrame(() => {
      this.detect();
      this.scheduleDetection();
    });
  }

  private detect(): void {
    if (!this.landmarker || !this.video || this.video.readyState < 2) return;

    const timestamp = performance.now();
    const result = this.landmarker.detectForVideo(this.video, timestamp);
    this.latestFrame = this.parseResult(result, timestamp);
  }

  private parseResult(
    result: FaceLandmarkerResult,
    timestamp: number
  ): TrackingFrame {
    if (!result.faceLandmarks?.length) {
      return { timestamp };
    }

    const matrix = result.facialTransformationMatrixes?.[0]?.data;
    const headRotation = matrix
      ? this.matrixToEuler(matrix)
      : { pitch: 0, yaw: 0, roll: 0 };

    const blendShapes = this.parseBlendShapes(result);
    const confidence = result.faceLandmarks[0] ? 1.0 : 0.0;

    const face: FaceData = { headRotation, blendShapes, confidence };
    return { timestamp, face };
  }

  /**
   * 顔変換行列（4x4 列優先）からオイラー角を計算する。
   * MediaPipe の FacialTransformationMatrix は OpenCV 座標系。
   */
  private matrixToEuler(m: Float32Array): EulerAngles {
    // 列優先 4x4 行列から回転成分を取り出す
    // pitch = arcsin(-m[6])  (X軸回転)
    // yaw   = arctan2(m[2], m[10]) (Y軸回転)
    // roll  = arctan2(m[4], m[5])  (Z軸回転)
    const pitch = Math.asin(Math.max(-1, Math.min(1, -m[6])));
    const yaw = Math.atan2(m[2], m[10]);
    const roll = Math.atan2(m[4], m[5]);
    return { pitch, yaw, roll };
  }

  private parseBlendShapes(result: FaceLandmarkerResult): BlendShapeMap {
    const raw = result.faceBlendshapes?.[0]?.categories ?? [];
    const out: Record<string, number> = {};
    for (const cat of raw) {
      const mappedName = BLEND_SHAPE_MAP[cat.categoryName];
      if (mappedName) {
        out[mappedName] = cat.score;
      }
    }
    return out;
  }
}
