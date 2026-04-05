import { describe, it, expect, beforeEach } from "vitest";
import { DefaultMapper } from "./DefaultMapper.js";
import type { TrackingFrame } from "../types/tracking.js";

function makeFrame(
  pitch = 0,
  yaw = 0,
  roll = 0,
  blendShapes: Record<string, number> = {}
): TrackingFrame {
  return {
    timestamp: 0,
    face: {
      headRotation: { pitch, yaw, roll },
      blendShapes,
      confidence: 1.0,
    },
  };
}

describe("DefaultMapper", () => {
  let mapper: DefaultMapper;

  beforeEach(() => {
    mapper = new DefaultMapper();
  });

  it("face が undefined のとき空の Map を返す", () => {
    const result = mapper.apply({ timestamp: 0 });
    expect(result.size).toBe(0);
  });

  it("body の rotation が yaw に基づいて設定される", () => {
    const result = mapper.apply(makeFrame(0, 0.5, 0));
    expect(result.get("body")?.rotation).toBeCloseTo(0.5, 5);
  });

  it("body の rotation が roll に基づいて設定される", () => {
    const result = mapper.apply(makeFrame(0, 0, 0.3));
    expect(result.get("body")?.rotation).toBeCloseTo(0.3, 5);
  });

  it("yaw と roll が合算されて body の rotation になる", () => {
    const result = mapper.apply(makeFrame(0, 0.4, 0.2));
    expect(result.get("body")?.rotation).toBeCloseTo(0.6, 5);
  });

  it("leaf の rotation が pitch に基づいて設定される", () => {
    const result = mapper.apply(makeFrame(0.4, 0, 0));
    expect(result.get("leaf")?.rotation).toBeCloseTo(0.2, 5);
  });

  it("eye_l.blink が 1.0 のとき eye_l の scaleY が 0 に近づく", () => {
    const result = mapper.apply(makeFrame(0, 0, 0, { "eye_l.blink": 1.0 }));
    expect(result.get("eye_l")?.scaleY).toBeCloseTo(0, 5);
  });

  it("eye_l.blink が 0.0 のとき eye_l の scaleY が 1.0", () => {
    const result = mapper.apply(makeFrame(0, 0, 0, { "eye_l.blink": 0.0 }));
    expect(result.get("eye_l")?.scaleY).toBeCloseTo(1.0, 5);
  });

  it("mouth.open が 1.0 のとき mouth の scaleY が最大値になる", () => {
    const result = mapper.apply(makeFrame(0, 0, 0, { "mouth.open": 1.0 }));
    const scaleY = result.get("mouth")?.scaleY ?? 0;
    expect(scaleY).toBeGreaterThan(1.0);
  });

  it("mouth.open が 0.0 のとき mouth の scaleY が 1.0", () => {
    const result = mapper.apply(makeFrame(0, 0, 0, { "mouth.open": 0.0 }));
    expect(result.get("mouth")?.scaleY).toBeCloseTo(1.0, 5);
  });

  it("cheek_l / cheek_r は Mapper から操作されない（静止パーツ）", () => {
    const result = mapper.apply(makeFrame(0.5, 0.5, 0.5));
    expect(result.has("cheek_l")).toBe(false);
    expect(result.has("cheek_r")).toBe(false);
  });

  it("roll が正のとき arm_l / arm_r が反対方向に回転する（振り子効果）", () => {
    const result = mapper.apply(makeFrame(0, 0, 0.6));
    const armL = result.get("arm_l")?.rotation ?? 0;
    const armR = result.get("arm_r")?.rotation ?? 0;
    expect(armL).toBeLessThan(0);
    expect(armR).toBeLessThan(0);
  });

  it("roll がゼロのとき arm の rotation もゼロ", () => {
    const result = mapper.apply(makeFrame(0, 0, 0));
    expect(result.get("arm_l")?.rotation).toBeCloseTo(0, 5);
    expect(result.get("arm_r")?.rotation).toBeCloseTo(0, 5);
  });

  it("pitch が正のとき leg_l と leg_r が外側に開く", () => {
    const result = mapper.apply(makeFrame(0.5, 0, 0));
    const legL = result.get("leg_l")?.rotation ?? 0;
    const legR = result.get("leg_r")?.rotation ?? 0;
    expect(legL).toBeGreaterThan(0);
    expect(legR).toBeLessThan(0);
  });

  it("pitch がゼロのとき leg の rotation もゼロ", () => {
    const result = mapper.apply(makeFrame(0, 0, 0));
    expect(result.get("leg_l")?.rotation).toBeCloseTo(0, 5);
    expect(result.get("leg_r")?.rotation).toBeCloseTo(0, 5);
  });

  it("confidence が低い（0.3 未満）場合は空の Map を返す", () => {
    const frame: TrackingFrame = {
      timestamp: 0,
      face: {
        headRotation: { pitch: 0.5, yaw: 0.5, roll: 0.5 },
        blendShapes: {},
        confidence: 0.2,
      },
    };
    const result = mapper.apply(frame);
    expect(result.size).toBe(0);
  });
});
