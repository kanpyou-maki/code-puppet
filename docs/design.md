# Design Doc: code-puppet

## 概要

TypeScript + PixiJS v8 + MediaPipe を組み合わせ、Webブラウザ上でリアルタイムに顔トラッキングとアバターレンダリングを行うWebアプリケーション。完全コード駆動・GUI非依存で、Vite によるビルドで単一のブラウザアプリとして動作する。

---

## アーキテクチャ

### ディレクトリ構成

```
src/
├── main.ts               # 起動・初期化エントリポイント
├── tracker/
│   ├── Tracker.ts        # Trackerインターフェース定義
│   └── TrackerImpl.ts    # MediaPipe実装
├── renderer/
│   ├── Renderer.ts       # Rendererインターフェース定義
│   └── RendererImpl.ts   # PixiJS v8実装
├── mapper/
│   ├── Mapper.ts         # Mapperインターフェース定義
│   └── DefaultMapper.ts  # TrackingFrame → PartTransform 変換実装
├── avatar/
│   └── parts.ts          # アバターパーツ設定定数
└── types/
    └── tracking.ts       # TrackingFrame等の型定義
```

### データフロー

```
カメラ → [TrackerImpl] → latestFrame バッファ（非同期書き込み）
                                ↓
                    PixiJS Ticker（rAF、毎フレームポーリング）
                                ↓
                         [DefaultMapper]
                      TrackingFrame → PartTransform[]
                                ↓
                         [RendererImpl]
                      updatePart() でPixiJS Container更新
                                ↓
                         <canvas>（マゼンタ背景・OBS でクロマキー合成）
```

### 主要設計判断

| 事項          | 決定                                               | 理由                                                                        |
| ------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| ループ駆動    | PixiJS Ticker（rAF）に一本化                       | MediaPipeの非同期コールバックとレンダリングを分離し、描画レートを安定させる |
| 非同期分離    | latestFrame バッファ方式                           | MediaPipeが返すタイミングとrAFが異なるため、最新値を保持してポーリング      |
| Scene Graph   | PixiJS Container を直接更新                        | 仮想SG層は不要な複雑さを増すため排除                                        |
| Mapper        | 単一クラス（DefaultMapper）                        | 現状のパーツ数であれば1クラスで十分                                         |
| テクスチャ    | 個別PNG                                            | 初期段階はシンプルさを優先。将来スプライトシートへ移行可能                  |
| MediaPipe隠蔽 | Trackerインターフェースの外にMediaPipeを露出しない | Tracker差し替え時の影響範囲を最小化                                         |
| 背景          | マゼンタ単色のクロマキー（[ADR-003](./adr/ADR-003-chroma-key-background.md)） | OBS のクロマキーフィルタで合成する。グリーンは葉っぱが抜けるため不可 |

---

## コンポーネント設計

### Tracker

**責務**: カメラ映像からトラッキングデータを取得し、`latestFrame` バッファを更新する。

```typescript
interface Tracker {
  start(): Promise<void>;
  stop(): void;
  getLatestFrame(): TrackingFrame | null;
}
```

- `TrackerImpl`: MediaPipe FaceLandmarker を使用。コールバックで得たデータを `latestFrame` に書き込む。

### Renderer

**責務**: アバターパーツをPixiJS v8 で描画・管理する。

```typescript
interface Renderer {
  init(canvas: HTMLCanvasElement): Promise<void>;
  loadParts(configs: AvatarPartConfig[]): Promise<void>;
  updatePart(id: string, transform: PartTransform): void;
  getPartCount(): number;
  destroy(): void;
}
```

- `RendererImpl`: PixiJS `Application` を保持。`init()` で canvas にアタッチし、`loadParts()` でSprite/Containerを生成し、`updatePart()` でプロパティを更新する。背景は `backgroundAlpha: 1`・`background: 0xff00ff` の不透明なマゼンタ（`index.html` の `body` も同色）。テクスチャの読み込みに失敗したパーツは図形で代用する。

### Mapper

**責務**: `TrackingFrame` を受け取り、各パーツの `PartTransform` に変換する。

```typescript
interface Mapper {
  apply(frame: TrackingFrame): Map<string, PartTransform>;
}
```

- `DefaultMapper`: 各パーツへの変換ロジック。
  - `body`: (yaw + roll) × 0.5 → rotation（2D近似）
  - `leaf`: pitch × 0.5 → rotation（うなずきで揺れる）
  - `eye_l/r`: `eye_*.blink` → scaleY（瞬き）
  - `mouth_closed` / `mouth_open`: `mouth.open` が 0.1 以上なら `mouth_open` を、未満なら `mouth_closed` を表示（`visible` の排他切替）
  - `arm_l/r`: −roll × 0.4 → rotation（振り子効果）
  - `leg_l/r`: ±pitch × 0.3 → rotation（左右逆方向に開く）
  - `confidence` が 0.3 未満のフレームは無視する（空の Map を返す）

### main.ts

初期化フロー:

1. `RendererImpl.init(canvas)` でPixiJS起動、`loadParts(AVATAR_PARTS)` でパーツロード
2. `TrackerImpl.start()` でMediaPipe起動・カメラ開始
3. PixiJS Ticker に毎フレーム処理を登録:
   - `tracker.getLatestFrame()` で最新フレームを取得
   - `mapper.apply(frame)` でTransform群を生成
   - 各Transformを `renderer.updatePart()` で適用

---

## データモデル

```typescript
// 姿勢角
interface EulerAngles {
  pitch: number; // 上下（うなずき）
  yaw: number; // 左右（首振り）
  roll: number; // 傾き
}

// ブレンドシェイプ（0.0〜1.0）
type BlendShapeMap = Readonly<Record<string, number>>;

// 顔トラッキングデータ
interface FaceData {
  headRotation: EulerAngles;
  blendShapes: BlendShapeMap;
  confidence: number; // 0.0〜1.0
}

// トラッキングフレーム（将来拡張を考慮）
interface TrackingFrame {
  timestamp: DOMHighResTimeStamp;
  face?: FaceData;
  pose?: PoseData; // 将来拡張: 全身ポーズ
  hands?: HandData; // 将来拡張: 手
}

// アバターパーツ設定
interface AvatarPartConfig {
  id: string;
  texturePath?: string; // 省略時は図形の仮パーツで代用
  parentId?: string; // 親パーツID（Scene Graph用）
  defaultPosition: { x: number; y: number };
  pivot: { x: number; y: number };
  zIndex?: number;
}

// パーツの変換パラメータ
interface PartTransform {
  rotation?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  visible?: boolean;
}
```

### アバターパーツ階層（初期）

```
body（大根本体・頭胴一体）← root
├── leaf（葉っぱ3枚を1パーツ）
├── eye_l（左目）
├── eye_r（右目）
├── mouth_closed（口・閉じ。既定で表示）
├── mouth_open（口・開き。mouth_closed と排他表示）
├── arm_l（左腕・手を含む）
├── arm_r（右腕・手を含む）
├── leg_l（左脚・足を含む）
└── leg_r（右脚・足を含む）
```

左右の方向はアバター目線（`_l` = アバターの左 = ユーザーから見て右）。
ほっぺは `body.png` に描き込み、独立パーツとしては管理しない。

---

## トレードオフ

### latestFrame バッファ方式 vs コールバック直接レンダリング

- **採用**: latestFrame バッファ
- **理由**: MediaPipeのコールバック頻度とrAFが必ずしも一致しないため、バッファ経由でポーリングすることで描画レートを安定させる
- **デメリット**: 最大1フレーム分のラグが発生する可能性があるが、実用上は問題ない

### 個別PNG vs スプライトシート

- **採用**: 個別PNG（初期）
- **理由**: 開発初期段階ではパーツ変更頻度が高く、個別ファイルの方が差し替えが容易
- **デメリット**: テクスチャ数が増えるとロード回数が増える。将来的にスプライトシートへ移行する

### DefaultMapper 単一クラス vs 複数Strategyクラス

- **採用**: 単一クラス
- **理由**: 現状のパーツ数・変換ロジックの複雑さでは単一クラスで十分
- **デメリット**: 将来的にロジックが複雑化した場合はStrategy分割が必要になる

---

## 未解決の問題

- MediaPipe FaceLandmarker の blendShapes APIがブラウザ版でどの程度の精度・パフォーマンスを出すか未検証
- headRotation の EulerAngles 単位（ラジアン/度）と MediaPipe 出力値の対応付け
- 全身トラッキング追加時の `PoseData` / `HandData` の具体的な型定義
