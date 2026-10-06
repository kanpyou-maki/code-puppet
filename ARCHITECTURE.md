# ARCHITECTURE.md

リポジトリのドメイン・パッケージ階層を示すトップレベルマップ。
エージェントはこのファイルを参照してリポジトリ構造を把握すること。

## ディレクトリ責務

| パス | 責務 | 主な変更者 |
|-----|------|----------|
| `src/main.ts` | 起動・初期化。Tracker・Mapper・Renderer を組み立て、PixiJS Ticker でループを回す | TDD で追加 |
| `src/tracker/` | 顔トラッキング。`Tracker` インターフェースと MediaPipe 実装（`TrackerImpl`） | TDD で追加 |
| `src/mapper/` | `TrackingFrame` を `PartTransform` に変換する。`Mapper` インターフェースと `DefaultMapper` | TDD で追加 |
| `src/renderer/` | 描画。`Renderer` インターフェースと PixiJS v8 実装（`RendererImpl`） | TDD で追加 |
| `src/avatar/` | アバターのパーツ設定の定数（`parts.ts`） | TDD で追加 |
| `src/types/` | モジュール間で共有する型（`tracking.ts`） | TDD で追加 |
| `public/assets/avatar/` | アバターのテクスチャ素材（PNG） | 人間 |
| `sample/` | 参考用の素材置き場（git 管理外） | 人間 |
| `docs/prd.md` | 要件定義 | `doc-updater` |
| `docs/design.md` | 設計書 | `doc-updater` |
| `CLAUDE.md` | エージェントへのナビゲーション地図（≤100行） | 人間 / Claude |
| `ARCHITECTURE.md` | このファイル。構造マップ | 人間 / Claude |
| `PROJECT_STATUS.md` | 次のセッションへの引き継ぎメモ（現在地・次の一手・人間待ち。6KB 以内） | Claude / 人間 |
| `.claude/agents/` | サブエージェント定義 (`.md`、frontmatter 必須) | improve-harness |
| `.claude/hooks/` | Claude Code フック実装 (`.js`) | master から配布 |
| `.claude/rules/` | コーディングルール (`{lang}/{category}.md`) | master から配布 |
| `.claude/skills/` | 再利用スキル (`{name}/SKILL.md`) | master から配布 |
| `.claude/harness.json` | ハーネスコマンド定義（test 等） | bootstrap / 人間 |
| `.claude/settings.json` | Claude Code フック・パーミッション設定 | 人間 |
| `.claude/master-path` | claude-config-master の場所（同期用） | install.sh |
| `docs/` | 知識ベース全体 | Claude / 人間 |
| `docs/adr/` | アーキテクチャ決定レコード | `doc-updater` |
| `docs/exec-plans/` | 実行プラン（active/ / completed/） | `planner` |
| `docs/design-docs/` | コンポーネント別詳細設計・中核的信念 | `doc-updater` |
| `docs/friction-log.md` | 摩擦ログ（ハーネス改善の入力） | 全エージェント |

## 依存方向ルール

テストは実装と同じディレクトリに `*.test.ts` として置く。詳細は [docs/design.md](./docs/design.md) を参照。

```
src/main.ts      →  tracker / mapper / renderer / avatar を組み立てる唯一の場所
src/tracker/     →  types のみ。MediaPipe に触れてよいのは TrackerImpl だけ（インターフェースの外に露出しない）
src/mapper/      →  types のみ。tracker・renderer の実装に依存しない
src/renderer/    →  types のみ。PixiJS に触れてよいのは RendererImpl だけ
src/avatar/      →  types のみ
src/types/       →  どこにも依存しない

.claude/agents/   →  tools のみ利用。agents/ 間の相互依存禁止
.claude/hooks/    →  Node.js 標準ライブラリのみ（外部 npm 依存禁止）
.claude/rules/    →  独立。他ファイルへの依存は Markdown リンクのみ
.claude/skills/   →  独立。他ファイルへの依存は Markdown リンクのみ
docs/             →  自由にリンク可。docs/ 外への参照は相対パスで
.claude/settings.json  →  .claude/hooks/*.js のみ参照（ARCH-004 で整合性検証）
```

## アーキテクチャ規則（`.claude/hooks/arch-lint.js` が機械的に強制）

| 規則 ID | 検査内容 |
|---------|---------|
| ARCH-001 | エージェント定義 (`.md` with `name:` frontmatter) は `.claude/agents/` 以外に配置しない |
| ARCH-002 | `.claude/` 配下のフック実装 (`.js`) は `.claude/hooks/` 以外に配置しない |
| ARCH-003 | `.claude/rules/` 配下のファイルは `{lang}/{category}.md` の命名規則に従う |
| ARCH-004 | `.claude/settings.json` のフックコマンドは `$CLAUDE_PROJECT_DIR` 起点で書かれ、参照先のファイルが実在する |
| ARCH-005 | `CLAUDE.md` は常に 100行以内 |
| ARCH-006 | `.md` ファイル内の相対リンクが実在するファイルを指している（コードブロック内は除外）|
| ARCH-007 | `PROJECT_STATUS.md` は 6KB（6,144 バイト）以内 |

## 知識グラフ

ドキュメントは CLAUDE.md を根とする有向グラフを構成する（ノード = `.md`、エッジ = 相対リンク）。

- エッジの有効性は ARCH-006 が強制する（リンク切れ = 違反）
- ノードの到達可能性は `structure-test.js` が検証する（孤立ドキュメント = 警告）
- エージェントのコンテキストから辿れないドキュメントは存在しないのと同じ。新しいドキュメントは必ずグラフに接続すること

## ADR 一覧

| ADR | 決定 |
|-----|------|
| [ADR-001](./docs/adr/ADR-001-use-pixijs-v8.md) | レンダリングエンジンとして PixiJS v8 を採用する |
| [ADR-002](./docs/adr/ADR-002-async-tracking-buffer.md) | MediaPipe と PixiJS の非同期分離（latestFrame バッファ方式） |
| [ADR-003](./docs/adr/ADR-003-chroma-key-background.md) | 背景は透過ではなくマゼンタのクロマキーにする |
