import { describe, it, expect, beforeEach } from "vitest";
import type { Renderer } from "./Renderer.js";
import type { AvatarPartConfig, PartTransform } from "../types/tracking.js";

/** テスト用スタブ（インターフェースの仕様を検証する） */
class StubRenderer implements Renderer {
  private parts = new Map<string, PartTransform & { config: AvatarPartConfig }>();
  private initialized = false;

  async init(_canvas: HTMLCanvasElement): Promise<void> {
    this.initialized = true;
  }

  async loadParts(configs: AvatarPartConfig[]): Promise<void> {
    if (!this.initialized) throw new Error("init() before loadParts()");
    for (const config of configs) {
      this.parts.set(config.id, { config, rotation: 0, x: config.defaultPosition.x, y: config.defaultPosition.y });
    }
  }

  updatePart(id: string, transform: PartTransform): void {
    const part = this.parts.get(id);
    if (!part) throw new Error(`Part not found: ${id}`);
    Object.assign(part, transform);
  }

  getPartCount(): number {
    return this.parts.size;
  }

  destroy(): void {
    this.parts.clear();
    this.initialized = false;
  }

  // テスト用ヘルパー
  getPartTransform(id: string): (PartTransform & { config: AvatarPartConfig }) | undefined {
    return this.parts.get(id);
  }
}

const MOCK_CANVAS = {} as HTMLCanvasElement;

const SAMPLE_PARTS: AvatarPartConfig[] = [
  { id: "root", defaultPosition: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
  { id: "head", parentId: "root", defaultPosition: { x: 0, y: -150 }, pivot: { x: 0.5, y: 0.8 } },
  { id: "eye_l", parentId: "head", defaultPosition: { x: -30, y: -20 }, pivot: { x: 0.5, y: 0.5 } },
  { id: "eye_r", parentId: "head", defaultPosition: { x: 30, y: -20 }, pivot: { x: 0.5, y: 0.5 } },
  { id: "mouth", parentId: "head", defaultPosition: { x: 0, y: 20 }, pivot: { x: 0.5, y: 0.5 } },
  { id: "arm_l", parentId: "root", defaultPosition: { x: -80, y: 0 }, pivot: { x: 0.5, y: 0.0 } },
  { id: "arm_r", parentId: "root", defaultPosition: { x: 80, y: 0 }, pivot: { x: 0.5, y: 0.0 } },
  { id: "tail", parentId: "root", defaultPosition: { x: 0, y: 100 }, pivot: { x: 0.5, y: 0.0 } },
];

describe("Renderer（StubRenderer でインターフェース仕様を検証）", () => {
  let renderer: StubRenderer;

  beforeEach(() => {
    renderer = new StubRenderer();
  });

  it("init → loadParts でパーツ数が正しく登録される", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    expect(renderer.getPartCount()).toBe(SAMPLE_PARTS.length);
  });

  it("init せずに loadParts を呼ぶとエラーになる", async () => {
    await expect(renderer.loadParts(SAMPLE_PARTS)).rejects.toThrow("init()");
  });

  it("updatePart で rotation が更新される", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    renderer.updatePart("head", { rotation: 0.5 });
    expect(renderer.getPartTransform("head")?.rotation).toBe(0.5);
  });

  it("updatePart で存在しないパーツIDを指定するとエラーになる", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    expect(() => renderer.updatePart("nonexistent", { rotation: 0 })).toThrow("Part not found");
  });

  it("destroy 後は getPartCount が 0 になる", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    renderer.destroy();
    expect(renderer.getPartCount()).toBe(0);
  });

  it("parentId のないパーツはルートとして登録される", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    const root = renderer.getPartTransform("root");
    expect(root?.config.parentId).toBeUndefined();
  });

  it("visible: false を updatePart で設定できる", async () => {
    await renderer.init(MOCK_CANVAS);
    await renderer.loadParts(SAMPLE_PARTS);
    renderer.updatePart("eye_l", { visible: false });
    expect(renderer.getPartTransform("eye_l")?.visible).toBe(false);
  });
});
