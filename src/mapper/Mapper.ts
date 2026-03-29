import type { TrackingFrame, PartTransform } from "../types/tracking.js";

export interface Mapper {
  /**
   * TrackingFrame を解析し、パーツIDごとの PartTransform マップを返す。
   * Renderer への副作用を持たず、純粋な変換ロジックのみを担う。
   */
  apply(frame: TrackingFrame): Map<string, PartTransform>;
}
