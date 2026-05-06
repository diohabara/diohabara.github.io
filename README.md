# blog

[![GitHub Pages](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml)

My personal blog built with [Astro](https://astro.build/).

## deps

- Node.js 22+
- [pnpm](https://pnpm.io/)
- [`lychee`](https://github.com/lycheeverse/lychee)（リンクチェッカー。CI と同じ検証をローカルで行うために使用します）
- [Ollama](https://ollama.com/)（記事コミット時の3AI検閲で使用。下記「AI検閲のセットアップ」参照）

## セットアップ

```sh
pnpm install
```

## 開発サーバー

```sh
pnpm dev
```

## ビルド

```sh
pnpm run build
```

`astro build` を実行後、[Pagefind](https://pagefind.app/) で全文検索インデックスを生成します。成果物は `dist/` に出力されます。

## Link check (same as CI)

CI ではサイトをビルドしたあと `lychee` でリンク切れを検出しています（内部リンクのみ、offline モード）。ローカルで同じ検証を行うには：

```bash
brew install lycheeverse/lychee/lychee  # もしくは `cargo install lychee`
pnpm run build
lychee --config lychee.toml --verbose --root-dir dist --offline ./dist
```

## 記事の書き方

`content/blog/` に Markdown ファイルを作成します。

```sh
touch content/blog/<TITLE>.md
```

### Front matter

```yaml
---
title: "記事タイトル"
date: 2025-01-01
draft: false
tags: ["tag1", "tag2"]
language: "ja"           # "ja" または "en"
image: "../img/ogp.jpg"  # OGP画像（任意）
description: "記事の説明" # OGP description（任意）
aiReview:                # pnpm run review:write または pre-commit が自動更新
  reviewedAt: "2026-05-07T00:30:00+09:00"
  contentHash: "sha256:..."
  results:
    - model: "llama3.1:8b@..."
      verdict: "APPROVED"
      comment: "..."
---
```

### 画像

記事で使用する画像は `content/img/` に配置し、記事からは相対パスで参照します。

```markdown
![alt text](../img/example.png)
```

### Markdown の拡張機能

- **数式**: KaTeX による LaTeX 数式レンダリング（`$...$` / `$$...$$`）
- **Mermaid**: コードブロックの言語に `mermaid` を指定するとダイアグラムを描画
- **見出しリンク**: 見出しに自動でアンカーリンクを付与

## AI検閲のセットアップ

このリポジトリでは、`content/blog/*.md` をコミットしようとするたびに 3 つのローカル LLM が記事を自動検閲します。詳細は [`/constitution`](https://diohabara.github.io/constitution/) を参照。

### 1. Ollama をインストール・起動

```sh
brew install ollama
ollama serve   # バックグラウンドで常駐させる
```

### 2. 3つのモデルを取得

```sh
ollama pull llama3.1:8b   # 米
ollama pull qwen3         # 中
ollama pull hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M
```

日本語レビュー担当は LLM-jp-3.1 1.8B instruct4 の GGUF を Hugging Face から直接取得して使います。

### 3. 動作確認

```sh
# 単発で記事を検閲
pnpm run review content/blog/1st-month-at-utd.md

# 記事の aiReview frontmatter を更新
pnpm run review:write content/blog/1st-month-at-utd.md

# git commit 時には .githooks/pre-commit + prepare-commit-msg が自動で走る
```

### バイパス禁止

`git commit --no-verify` はローカルでは技術的に動作しますが、コミットメッセージに `Reviewed-By: 3-AI-Censor ...` trailer が付かず、GitHub Actions の `censor-guard` ジョブで弾かれてデプロイが止まります。

## Google Analytics

Google Analytics ID は環境変数 `PUBLIC_GOOGLE_ANALYTICS_ID` で管理しています。

本番環境では GitHub Secret `GOOGLE_ANALYTICS_ID` として設定済みです。

```bash
gh secret set GOOGLE_ANALYTICS_ID --body "G-YOUR-NEW-ID"
```
