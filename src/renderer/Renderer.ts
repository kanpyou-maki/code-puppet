import type { AvatarPartConfig, PartTransform } from "../types/tracking.js";

export interface Renderer {
  /** PixiJS Application を初期化して canvas にアタッチする */
  init(canvas: HTMLCanvasElement): Promise<void>;
  /** パーツ設定を受け取り Scene Graph を構築する */
  loadParts(configs: AvatarPartConfig[]): Promise<void>;
  /** 指定パーツのトランスフォームを更新する */
  updatePart(id: string, transform: PartTransform): void;
  /** 現在のパーツ数を返す */
  getPartCount(): number;
  /** 後処理（テスト・アンマウント時に使用） */
  destroy(): void;
}
