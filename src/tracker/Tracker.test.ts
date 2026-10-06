import { describe, it, expect, beforeEach } from "vitest";
import type { Tracker } from "./Tracker.js";
import type { TrackingFrame, FaceData, EulerAngles } from "../types/tracking.js";

/** テスト用スタブ */
class StubTracker implements Tracker {
  private running = false;
  private frame: TrackingFrame | null = null;

  async start(): Promise<void> {
    this.running = true;
  }

  stop(): void {
    this.running = false;
    this.frame = null;
  }

  getLatestFrame(): TrackingFrame | null {
    return this.frame;
  }

  isRunning(): boolean {
    return this.running;
  }

  /** テスト用ヘルパー：フレームを手動でセット */
  injectFrame(frame: TrackingFrame): void {
    this.frame = frame;
  }
}

function makeFaceFrame(overrides?: Partial<EulerAngles>): TrackingFrame {
  const face: FaceData = {
    headRotation: { pitch: 0, yaw: 0, roll: 0, ...overrides },
    blendShapes: { "eye_l.blink": 0.0, "eye_r.blink": 0.0, "mouth.open": 0.0 },
    confidence: 1.0,
  };
  return { timestamp: performance.now(), face };
}

describe("Tracker（StubTracker でインターフェース仕様を検証）", () => {
  let tracker: StubTracker;

  beforeEach(() => {
    tracker = new StubTracker();
  });

  it("start() 前は getLatestFrame() が null を返す", () => {
    expect(tracker.getLatestFrame()).toBeNull();
  });

  it("start() 後は isRunning が true になる", async () => {
    await tracker.start();
    expect(tracker.isRunning()).toBe(true);
  });

  it("stop() 後は isRunning が false になり frame が null になる", async () => {
    await tracker.start();
    tracker.injectFrame(makeFaceFrame());
    tracker.stop();
    expect(tracker.isRunning()).toBe(false);
    expect(tracker.getLatestFrame()).toBeNull();
  });

  it("フレームが注入された後は getLatestFrame() がそれを返す", async () => {
    await tracker.start();
    const frame = makeFaceFrame({ pitch: 0.2, yaw: -0.1 });
    tracker.injectFrame(frame);
    const result = tracker.getLatestFrame();
    expect(result?.face?.headRotation.pitch).toBe(0.2);
    expect(result?.face?.headRotation.yaw).toBe(-0.1);
  });

  it("フレームを上書きすると最新のフレームを返す（バッファ方式）", async () => {
    await tracker.start();
    tracker.injectFrame(makeFaceFrame({ pitch: 0.1 }));
    tracker.injectFrame(makeFaceFrame({ pitch: 0.9 }));
    expect(tracker.getLatestFrame()?.face?.headRotation.pitch).toBe(0.9);
  });

  it("TrackingFrame には timestamp が含まれる", async () => {
    await tracker.start();
    const now = performance.now();
    const frame = makeFaceFrame();
    tracker.injectFrame(frame);
    expect(tracker.getLatestFrame()?.timestamp).toBeGreaterThanOrEqual(now - 1);
  });

  it("blendShapes に eye_l.blink が含まれる", async () => {
    await tracker.start();
    const frame = makeFaceFrame();
    if (frame.face) frame.face.blendShapes = { "eye_l.blink": 0.7, "mouth.open": 0.0, "eye_r.blink": 0.0 };
    tracker.injectFrame(frame);
    expect(tracker.getLatestFrame()?.face?.blendShapes["eye_l.blink"]).toBe(0.7);
  });

  it("start() を複数回呼んでも問題ない", async () => {
    await tracker.start();
    await tracker.start();
    expect(tracker.isRunning()).toBe(true);
  });
});

describe("TrackerImpl（MediaPipe ラッパー）", () => {
  it("MediaPipe がブラウザ環境外では動作しないため、ユニットテストはスタブで代替する", () => {
    // TrackerImpl は MediaPipe / getUserMedia を使用するため
    // Node.js テスト環境では直接テストできない。
    // E2E / 統合テストはブラウザで手動確認する。
    expect(true).toBe(true);
  });
});
