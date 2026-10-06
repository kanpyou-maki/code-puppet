# プロジェクト状態

> 次のセッションへの引き継ぎメモ。セッションの最初に読み、PR を作る前とセッションを閉じる前に書き換える。
> 載せるのは下の 4 節だけ。追記せず、終わった項目は消す。上限は 6KB（ARCH-007）。
> 決定は `docs/adr/` か設計書、知見は `docs/` の該当文書、繰り返すハマりどころは `docs/friction-log.md`、
> タスク分解は `docs/exec-plans/active/` に書く。終わった作業は git log と PR が記録している。
> API キー・トークン・パスワード・個人情報は書かない（git に残り、毎セッション読まれる）。必要なら変数名か取得場所だけを書く。

## 現在のフェーズ

実装中。PNG 素材のアバター（全 10 パーツ）が、カメラトラッキングに連動して動く段階。図形での代用（`RendererImpl.ts` の `MOCK_SHAPES`）は、読み込み失敗時のフォールバックとして残っている（コード上は削除予定の TODO）。

## 進行中

- ブランチ `chore/harness-migrate-2026-10-07`: claude-config-master の現行レイアウトへの移行。PR のレビュー待ち

## 次にやること

- [ ] 既存の失敗を直す（2026-10-07 のハーネス移行時に確認。移行前から）: `src/mapper/Mapper.test.ts` の 5 件（body の rotation と mouth の scaleY が期待値の半分）、`npx tsc --noEmit` の 6 件（`import.meta.env` が 4 件、`TrackerImpl.ts` の `Float32Array` が 1 件、`Tracker.test.ts` の未使用 import が 1 件。このため `npm run build` も通らない）
- [ ] ブラウザで `npm run dev` を実行して動作確認
- [ ] code-reviewer エージェントによるコードレビュー
- [ ] UI パネル実装（感度スライダー等）。`docs/prd.md` は GUI 設定画面・スライダーをスコープ外としているので、着手前に要件を見直す

## 人間待ち

_なし_
