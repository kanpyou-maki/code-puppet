import type { AvatarPartConfig } from "../types/tracking.js";

/**
 * アバターのパーツ構成定義。
 * ここを編集するだけで Scene Graph が変わる（コード変更不要）。
 *
 * pivot は 0〜1 の正規化値。RendererImpl がテクスチャサイズを掛けて実ピクセルに変換する。
 * - pivot.y = 0.0 → パーツ上端が回転軸（肩・付け根に相当）
 * - pivot.y = 0.5 → パーツ中央が回転軸
 * - pivot.y = 1.0 → パーツ下端が回転軸（葉の根元に相当）
 *
 * キャラクター構成:
 *   body（大根本体・頭胴一体）← root
 *   ├── leaf（葉っぱ3枚を1パーツ）
 *   ├── eye_l / eye_r
 *   ├── mouth
 *   ├── cheek_l / cheek_r（静止）
 *   ├── arm_l / arm_r（手を含む）
 *   └── leg_l / leg_r（足を含む）
 */
export const AVATAR_PARTS: AvatarPartConfig[] = [
  // 大根本体（頭胴一体）。Stage 中央に配置されるルートパーツ
  {
    id: "body",
    defaultPosition: { x: 0, y: 0 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 0,
  },

  // 葉っぱ（3枚を1パーツ）。body 上端から生える。根元で揺れる
  {
    id: "leaf",
    parentId: "body",
    defaultPosition: { x: 0, y: -100 },
    pivot: { x: 0.5, y: 1.0 },
    zIndex: 2,
  },

  // 左目
  {
    id: "eye_l",
    parentId: "body",
    defaultPosition: { x: -25, y: -10 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 右目
  {
    id: "eye_r",
    parentId: "body",
    defaultPosition: { x: 25, y: -10 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 口
  {
    id: "mouth",
    parentId: "body",
    defaultPosition: { x: 0, y: 20 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // ほっぺ左（静止パーツ。トラッキングでは動かさない）
  {
    id: "cheek_l",
    parentId: "body",
    defaultPosition: { x: -45, y: 5 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // ほっぺ右（静止パーツ）
  {
    id: "cheek_r",
    parentId: "body",
    defaultPosition: { x: 45, y: 5 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 左腕（手を含む）。体の左側面・肩位置から生える
  {
    id: "arm_l",
    parentId: "body",
    defaultPosition: { x: -80, y: 10 },
    pivot: { x: 1.0, y: 0.1 },
    zIndex: -1,
  },

  // 右腕（手を含む）
  {
    id: "arm_r",
    parentId: "body",
    defaultPosition: { x: 80, y: 10 },
    pivot: { x: 0.0, y: 0.1 },
    zIndex: -1,
  },

  // 左脚（足を含む）。体下部から生える
  {
    id: "leg_l",
    parentId: "body",
    defaultPosition: { x: -30, y: 95 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: -1,
  },

  // 右脚（足を含む）
  {
    id: "leg_r",
    parentId: "body",
    defaultPosition: { x: 30, y: 95 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: -1,
  },
];
