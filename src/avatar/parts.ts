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
 *   ├── arm_l / arm_r（手を含む）
 *   └── leg_l / leg_r（足を含む）
 */
export const AVATAR_PARTS: AvatarPartConfig[] = [
  // 大根本体（頭胴一体）。Stage 中央に配置されるルートパーツ
  {
    id: "body",
    texturePath: "/assets/avatar/body.png",
    defaultPosition: { x: 0, y: 0 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 0,
  },

  // 葉っぱ（3枚を1パーツ）。body 上端から生える。根元で揺れる
  {
    id: "leaf",
    texturePath: "/assets/avatar/leaf.png",
    parentId: "body",
    defaultPosition: { x: 0, y: -100 },
    pivot: { x: 0.5, y: 1.0 },
    zIndex: 2,
  },

  // 左目（アバター目線の左 = ユーザーから見て右 = 正の x）
  {
    id: "eye_l",
    texturePath: "/assets/avatar/eye_l.png",
    parentId: "body",
    defaultPosition: { x: 40, y: -40 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 右目（アバター目線の右 = ユーザーから見て左 = 負の x）
  {
    id: "eye_r",
    texturePath: "/assets/avatar/eye_r.png",
    parentId: "body",
    defaultPosition: { x: -40, y: -40 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 口
  {
    id: "mouth",
    texturePath: "/assets/avatar/mouth.png",
    parentId: "body",
    defaultPosition: { x: 0, y: -10 },
    pivot: { x: 0.5, y: 0.5 },
    zIndex: 1,
  },

  // 左腕（アバター目線の左 = ユーザーから見て右 = 正の x）
  // pivot.x: 0.0 = 画像左端が肩の接続点
  {
    id: "arm_l",
    texturePath: "/assets/avatar/arm_l.png",
    parentId: "body",
    defaultPosition: { x: 110, y: -20 },
    pivot: { x: 0.0, y: 0.1 },
    zIndex: -1,
  },

  // 右腕（アバター目線の右 = ユーザーから見て左 = 負の x）
  // pivot.x: 1.0 = 画像右端が肩の接続点
  {
    id: "arm_r",
    texturePath: "/assets/avatar/arm_r.png",
    parentId: "body",
    defaultPosition: { x: -110, y: -10 },
    pivot: { x: 1.0, y: 0.1 },
    zIndex: -1,
  },

  // 左脚（アバター目線の左 = ユーザーから見て右 = 正の x）
  {
    id: "leg_l",
    texturePath: "/assets/avatar/leg_l.png",
    parentId: "body",
    defaultPosition: { x: 30, y: 95 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: -1,
  },

  // 右脚（アバター目線の右 = ユーザーから見て左 = 負の x）
  {
    id: "leg_r",
    texturePath: "/assets/avatar/leg_r.png",
    parentId: "body",
    defaultPosition: { x: -30, y: 95 },
    pivot: { x: 0.5, y: 0.0 },
    zIndex: -1,
  },
];
