import { describe, it, expect } from "vitest";
import type {
  EulerAngles,
  FaceData,
  TrackingFrame,
  AvatarPartConfig,
  PartTransform,
} from "./tracking.js";

describe("TrackingFrame", () => {
  it("face のみ持つフレームを構築できる", () => {
    const angles: EulerAngles = { pitch: 0.1, yaw: -0.2, roll: 0.0 };
    const face: FaceData = {
      headRotation: angles,
      blendShapes: { "eye_l.blink": 0.8, "mouth.open": 0.3 },
      confidence: 0.95,
    };
    const frame: TrackingFrame = { timestamp: performance.now(), face };

    expect(frame.face?.headRotation.pitch).toBe(0.1);
    expect(frame.pose).toBeUndefined();
    expect(frame.hands).toBeUndefined();
  });

  it("pose / hands を省略した場合も型エラーにならない", () => {
    const frame: TrackingFrame = { timestamp: 0 };
    expect(frame.face).toBeUndefined();
  });
});

describe("AvatarPartConfig", () => {
  it("parentId を省略してルートパーツを定義できる", () => {
    const config: AvatarPartConfig = {
      id: "root",
      defaultPosition: { x: 0, y: 0 },
      pivot: { x: 0.5, y: 0.5 },
    };
    expect(config.parentId).toBeUndefined();
  });
});

describe("PartTransform", () => {
  it("すべてのプロパティを省略できる（空のオブジェクトを許容）", () => {
    const transform: PartTransform = {};
    expect(transform.rotation).toBeUndefined();
  });
});
