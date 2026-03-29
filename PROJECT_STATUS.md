# プロジェクト状態

> Claude Code が自律的に管理するファイル。タスク完了・フェーズ移行のたびに更新すること。
> セッション開始時は必ずこのファイルを読んで状態を復元すること。

## 現在のフェーズ

<!-- 選択肢: 議論中 | ドキュメント作成中 | 実装中 | レビュー中 | メンテナンス中 | 完了 -->

実装中

## 概要

TypeScript / PixiJS v8 / MediaPipe を使ったYouTube配信用アバター制御Webアプリ。
モックアップ（仮パーツ）でカメラトラッキングと連動するアバターが動作する状態になった。

## 完了済み

- [x] 初回の議論・要件整理
- [x] アーキテクチャ設計（architect エージェント）
- [x] PRD 作成 (`docs/prd.md`)
- [x] Design Doc 作成 (`docs/design.md`)
- [x] ADR-001: PixiJS v8 採用 (`docs/adr/ADR-001-use-pixijs-v8.md`)
- [x] ADR-002: MediaPipe/PixiJS 非同期分離 (`docs/adr/ADR-002-async-tracking-buffer.md`)
- [x] Vite + TypeScript + Vitest プロジェクト初期化
- [x] `src/types/tracking.ts` — 型定義（TrackingFrame, FaceData, AvatarPartConfig 等）
- [x] `src/renderer/` — Renderer インターフェース + RendererImpl（PixiJS v8 仮パーツ描画）
- [x] `src/tracker/` — Tracker インターフェース + TrackerImpl（MediaPipe FaceLandmarker）
- [x] `src/mapper/` — Mapper インターフェース + DefaultMapper
- [x] `src/avatar/parts.ts` — パーツ設定（体・頭・目×2・口・腕×2・尻尾）
- [x] `src/main.ts` — エントリポイント統合

## 進行中

_なし_

## 次にやること

- [ ] ブラウザで `npm run dev` を実行して動作確認
- [ ] code-reviewer エージェントによるコードレビュー
- [ ] 実際の PNG 素材に差し替え（RendererImpl のテクスチャ読み込み対応）
- [ ] UIパネル実装（感度スライダー等）

## 決定事項

| #   | 決定内容                                                | 理由                                                          | ADR     |
| --- | ------------------------------------------------------- | ------------------------------------------------------------- | ------- |
| 1   | レンダリングエンジンに PixiJS v8 を採用                 | WebGPU/WebGL2対応、Scene Graph、透明Canvas、TypeScript対応    | ADR-001 |
| 2   | MediaPipe と PixiJS を latestFrame バッファで非同期分離 | 処理サイクルが異なる2系統を疎結合にし、描画レートを安定させる | ADR-002 |

## ブロッカー

_なし_

## メモ

- モックアップ段階では実PNG不要。PixiJS Graphics（図形）で仮パーツを描画する
- パーツ構成: 体(root) > 頭(目×2, 口) / 腕×2 / 尻尾
- 将来の全身拡張: TrackingFrame の `pose?` / `hands?` を追加するだけで対応できる設計
