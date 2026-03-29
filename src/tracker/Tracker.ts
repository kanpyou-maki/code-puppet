import type { TrackingFrame } from "../types/tracking.js";

export interface Tracker {
  /** カメラと MediaPipe を初期化してトラッキングを開始する */
  start(): Promise<void>;
  /** トラッキングを停止してリソースを解放する */
  stop(): void;
  /** 最新フレームを同期的に取得する（rAF ループからポーリングする） */
  getLatestFrame(): TrackingFrame | null;
}
