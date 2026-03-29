import type { AvatarPartConfig } from "../types/tracking.js";

/**
 * アバターのパーツ構成定義。
 * ここを編集するだけで Scene Graph が変わる（コード変更不要）。
 *
 * pivot は 0〜1 の正規化値。RendererImpl がテクスチャサイズを掛けて実ピクセルに変換する。
 * - pivot.y = 0.0 → パーツ上端が回転軸（肩・付け根に相当）
 * - pivot.y = 0.5 → パーツ中央が回転軸
 * - pivot.y = 0.8 → パーツ下端近くが回転軸（首の付け根に相当）
 */
export const AVATAR_PARTS: AvatarPartConfig[] = [
  // ルートパーツ（胴体）。Stage 中央に配置される
  {
    id: "root",
    defaultPosition: { x: 0, y: 0 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 0,
  },

  // 頭。pivot を下端寄りにして首の付け根で回転させる
  {
    id: "head",
    parentId: "root",
    defaultPosition: { x: 0, y: -130 },
    pivot: { x: 0.5, y: 0.8 },
    zIndex: 1,
  },

  // 左目（頭の子）
  {
    id: "eye_l",
    parentId: "head",
    defaultPosition: { x: -22, y: -15 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 2,
  },

  // 右目（頭の子）
  {
    id: "eye_r",
    parentId: "head",
    defaultPosition: { x: 22, y: -15 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 2,
  },

  // 口（頭の子）
  {
    id: "mouth",
    parentId: "head",
    defaultPosition: { x: 0, y: 18 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 2,
  },

  // 左腕。pivot を上端にして肩で回転させる
  {
    id: "arm_l",
    parentId: "root",
    defaultPosition: { x: -60, y: -20 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: 0,
  },

  // 右腕
  {
    id: "arm_r",
    parentId: "root",
    defaultPosition: { x: 60, y: -20 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: 0,
  },

  // 尻尾。pivot を上端にして付け根で揺れる
  {
    id: "tail",
    parentId: "root",
    defaultPosition: { x: 0, y: 80 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: -1,
  },
];
