/** 3軸の姿勢角（ラジアン） */
export interface EulerAngles {
  /** 上下（うなずき） */
  pitch: number;
  /** 左右（首振り） */
  yaw: number;
  /** 傾き */
  roll: number;
}

/** ブレンドシェイプ値（0.0〜1.0）のマップ */
export type BlendShapeMap = Readonly<Record<string, number>>;

/** 顔トラッキングデータ */
export interface FaceData {
  headRotation: EulerAngles;
  blendShapes: BlendShapeMap;
  /** 検出信頼度（0.0〜1.0）。低い場合は前フレームの値を維持するなどの制御に使う */
  confidence: number;
}

/** 全身ポーズ（将来拡張用） */
export interface PoseData {
  landmarks: readonly Vector3[];
}

/** 手のトラッキング（将来拡張用） */
export interface HandData {
  left?: readonly Vector3[];
  right?: readonly Vector3[];
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Tracker が毎フレーム発行するスナップショット。
 * 顔のみの現フェーズでは face だけが存在する。
 * 全身拡張時は pose / hands を追加するだけで後方互換性を保てる。
 */
export interface TrackingFrame {
  timestamp: DOMHighResTimeStamp;
  face?: FaceData;
  pose?: PoseData;
  hands?: HandData;
}

/** アバターパーツの設定 */
export interface AvatarPartConfig {
  id: string;
  /**
   * テクスチャ画像のパス（public/ からの相対パス）。
   * 省略した場合は Graphics による仮パーツを描画する。
   */
  texturePath?: string;
  /** 親パーツID。undefined のときルートパーツとして扱う */
  parentId?: string;
  /** Scene Graph 内のローカル初期位置 */
  defaultPosition: { x: number; y: number };
  /**
   * 回転軸のオフセット（0〜1 の正規化値）。
   * Renderer 側でテクスチャサイズを掛けて実ピクセルに変換する。
   */
  pivot: { x: number; y: number };
  /** 描画順（zIndex）。大きいほど前面 */
  zIndex?: number;
}

/** Mapper が Renderer に渡すパーツのトランスフォーム */
export interface PartTransform {
  /** 回転量（ラジアン） */
  rotation?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  visible?: boolean;
  /** 不透明度（0.0 = 透明, 1.0 = 不透明） */
  alpha?: number;
}
