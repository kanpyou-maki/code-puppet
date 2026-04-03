import { Application, Container, Graphics } from "pixi.js";
import type { Renderer } from "./Renderer.js";
import type { AvatarPartConfig, PartTransform } from "../types/tracking.js";

/**
 * モックアップ用の仮パーツ描画設定。
 * TODO: PNG素材実装後に削除し、AvatarPartConfig.texturePath でテクスチャを読み込む形に移行する。
 */
const MOCK_SHAPES: Record<string, { color: number; width: number; height: number }> = {
  body:    { color: 0xf0f0ee, width: 130, height: 130 },
  leaf:    { color: 0x6abf69, width: 70,  height: 80  },
  eye_l:   { color: 0x1a1a1a, width: 14,  height: 14  },
  eye_r:   { color: 0x1a1a1a, width: 14,  height: 14  },
  mouth:   { color: 0x333333, width: 28,  height: 8   },
  cheek_l: { color: 0xf4a0b0, width: 22,  height: 16  },
  cheek_r: { color: 0xf4a0b0, width: 22,  height: 16  },
  arm_l:   { color: 0x1a1a1a, width: 12,  height: 60  },
  arm_r:   { color: 0x1a1a1a, width: 12,  height: 60  },
  leg_l:   { color: 0x1a1a1a, width: 12,  height: 50  },
  leg_r:   { color: 0x1a1a1a, width: 12,  height: 50  },
};

const DEFAULT_SHAPE = { color: 0x888888, width: 30, height: 30 };

export class RendererImpl implements Renderer {
  private app: Application | null = null;
  private parts = new Map<string, Container>();

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.app = new Application();
    await this.app.init({
      canvas,
      backgroundAlpha: 0,
      background: 0x000000,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio ?? 1,
      resizeTo: canvas.parentElement ?? window,
    });

    // リサイズ時にルートパーツの位置を再計算するためイベントをリッスンする
    this.app.renderer.on("resize", () => this.repositionRoots());
  }

  async loadParts(configs: AvatarPartConfig[]): Promise<void> {
    if (!this.app) throw new Error("init() must be called before loadParts()");

    // 再ロード時に既存のパーツをクリアする（多重呼び出し対策）
    this.parts.forEach((c) => c.destroy({ children: true }));
    this.parts.clear();
    this.app.stage.removeChildren();

    const containers = new Map<string, Container>();

    // 全パーツの Container を生成
    for (const config of configs) {
      const container = new Container();
      container.label = config.id;
      container.position.set(config.defaultPosition.x, config.defaultPosition.y);
      if (config.zIndex !== undefined) container.zIndex = config.zIndex;

      // 仮パーツ描画（PNG素材がない段階はGraphicsで代替）
      const shape = MOCK_SHAPES[config.id] ?? DEFAULT_SHAPE;
      const g = new Graphics();
      g.roundRect(
        -shape.width / 2,
        -shape.height / 2,
        shape.width,
        shape.height,
        6
      );
      g.fill(shape.color);
      g.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });

      // pivot は正規化値 → ピクセルに変換
      container.pivot.set(
        (config.pivot.x - 0.5) * shape.width,
        (config.pivot.y - 0.5) * shape.height
      );

      container.addChild(g);
      containers.set(config.id, container);
    }

    // 親子関係を構築
    for (const config of configs) {
      const container = containers.get(config.id);
      if (!container) continue;

      if (config.parentId) {
        const parent = containers.get(config.parentId);
        if (!parent) throw new Error(`Parent not found: ${config.parentId}`);
        parent.addChild(container);
      } else {
        this.app.stage.addChild(container);
      }
    }

    this.parts = containers;

    // ルートパーツをステージ中央に配置（init 後のサイズ確定を待って実行）
    this.repositionRoots();
  }

  updatePart(id: string, transform: PartTransform): void {
    const container = this.parts.get(id);
    if (!container) throw new Error(`Part not found: ${id}`);

    if (transform.rotation !== undefined) container.rotation = transform.rotation;
    if (transform.x !== undefined) container.x = transform.x;
    if (transform.y !== undefined) container.y = transform.y;
    if (transform.scaleX !== undefined) container.scale.x = transform.scaleX;
    if (transform.scaleY !== undefined) container.scale.y = transform.scaleY;
    if (transform.visible !== undefined) container.visible = transform.visible;
  }

  getPartCount(): number {
    return this.parts.size;
  }

  destroy(): void {
    this.app?.destroy(false, { children: true });
    this.app = null;
    this.parts.clear();
  }

  // -----------------------------------------------------------------------
  // private

  /** parentId を持たないルートパーツをステージ中央に再配置する */
  private repositionRoots(): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;
    if (width === 0 || height === 0) return;

    for (const container of this.app.stage.children) {
      if (container instanceof Container) {
        container.position.set(width / 2, height / 2);
      }
    }
  }
}
