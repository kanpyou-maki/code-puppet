# 品質スコア (Quality Score)

**最終更新:** 2026-10-07（テスト・型エラー修正後の実測。スコアは測ったものだけ記入）

## スコアサマリー

| 領域 | スコア | 主なギャップ |
|------|--------|------------|
| ドキュメント整合性 | —/100 | structure-test は通過（リンク切れなし） |
| テストカバレッジ | —/100 | テスト 36 件・`tsc --noEmit` とも通過。カバレッジ 100% は `DefaultMapper.ts` だけの値で、`RendererImpl.ts`・`TrackerImpl.ts`・`main.ts` はテストから読み込まれず計測対象外 |
| アーキテクチャ規則遵守 | —/100 | arch-lint は違反なし |

詳細は [docs/golden-rules.md](./golden-rules.md) を参照。
