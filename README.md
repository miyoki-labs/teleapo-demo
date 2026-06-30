# テレアポ 切り返しAIアシスタント

引越しテレアポ特化の切り返しトーク提案デモアプリ。
断り文句を入力すると、顧客プロファイルに合わせた最適な切り返しをAIが即提示します。

## セットアップ（5分でできます）

### 1. 依存関係のインストール

```bash
npm install
```

### 2. APIキーの設定

`.env.local.example` をコピーして `.env.local` を作成し、APIキーを入力する。

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて編集：
```
ANTHROPIC_API_KEY=sk-ant-あなたのキーをここに貼る
```

### 3. 起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## 使い方

1. 左サイドバーで顧客プロファイル（年代・物件種別・エリア）を設定
2. よくある断り文句をクイック選択 or 自由入力
3. AIが切り返しトーク・状況分析・次の一手を提案

## 機能

- 顧客プロファイル（年代・物件種別・エリア）に応じたカスタマイズ提案
- よくある断り文句のクイック選択
- 状況分析 → 切り返しトーク例 → ポイント解説 → 次の一手の4段構成
- 会話履歴を保持してやり取りを深掘りできる

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API (claude-sonnet-4-6)
