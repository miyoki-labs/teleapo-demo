# teleapo-demo CLAUDE.md

引越しテレアポ特化の切り返しトーク提案デモ。断り文句を入れると顧客プロファイル別に切り返しをAIが提示。
状況分析→切り返しトーク→ポイント解説→次の一手の4段構成。技術：Next.js 14 / TypeScript / Tailwind / Claude API。

## 開発ログ（必須）

- 開発したら**同じセッションで** `knowledge-log/history/main.md` に対応・知見・成果を追記する（旧CHANGELOGの役割）。
- 記事になりそうなら `knowledge-log/log.md` に1件昇格させる（🔬Miyoki Labsレーン・★評価）。
- 運用ルールの本体は `C:\Miyoki\ideas\_knowledge-log-rule.md`（マスター規約）。

## 品質チェック（Miyoki共通）

実装・修正の完了後は共通スキルを使う（正＝グローバル `~/.claude/skills/`。呼べるかは起動時の `skills-scan.sh` の一覧で見る）：
- `/pro qa` … 変更種別から該当チェックを逆引き（UI 4幅＝375/768/1280/1536・フォーム・API・デプロイ後。表＝`~/.claude/skills/pro/references/qa-web.md` §1-b。旧 `/quality-check` は 2026-09-08 に吸収）
- `/ux-review` … UX健全性の定期レビュー（汎用4軸＋固有軸。グローバルスキル）
- 薄い計画書＝ `C:\Miyoki\計画\プロジェクト別\` の同名md（目的/現在地/次の一手）
