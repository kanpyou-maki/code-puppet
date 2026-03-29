import type { Mapper } from "./Mapper.js";
import type { TrackingFrame, PartTransform } from "../types/tracking.js";

/** confidence がこの値未満のフレームは無視する */
const CONFIDENCE_THRESHOLD = 0.3;

/** 口の最大スケール（mouth.open = 1.0 のとき） */
const MOUTH_MAX_SCALE_Y = 2.5;

/** 尻尾の揺れ感度（pitch に対する回転倍率） */
const TAIL_PITCH_MULTIPLIER = 1.0;

export class DefaultMapper implements Mapper {
  apply(frame: TrackingFrame): Map<string, PartTransform> {
    const result = new Map<string, PartTransform>();

    const face = frame.face;
    if (!face) return result;
    if (face.confidence < CONFIDENCE_THRESHOLD) return result;

    const { pitch, yaw, roll } = face.headRotation;
    const bs = face.blendShapes;

    // 頭: yaw（左右首振り）と roll（傾き）を合算して 2D 平面上の回転に近似する。
    // 本来 yaw は Y 軸・roll は Z 軸の異なる回転だが、2D スプライトでは
    // 1 軸のみ表現できるため加算で近似している。3D 移行時は要見直し。
    result.set("head", {
      rotation: yaw + roll,
    });

    // 左目: blink → scaleY（1.0 = 全開, 0.0 = 全閉）
    const eyeLBlink = bs["eye_l.blink"] ?? 0;
    result.set("eye_l", {
      scaleY: 1.0 - eyeLBlink,
    });

    // 右目
    const eyeRBlink = bs["eye_r.blink"] ?? 0;
    result.set("eye_r", {
      scaleY: 1.0 - eyeRBlink,
    });

    // 口: mouth.open → scaleY（1.0〜MOUTH_MAX_SCALE_Y）
    const mouthOpen = bs["mouth.open"] ?? 0;
    result.set("mouth", {
      scaleY: 1.0 + mouthOpen * (MOUTH_MAX_SCALE_Y - 1.0),
    });

    // 尻尾: pitch（うなずき）で揺れる
    result.set("tail", {
      rotation: pitch * TAIL_PITCH_MULTIPLIER,
    });

    return result;
  }
}
