# blog

[![GitHub Pages](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml)

My personal blog built with [Astro](https://astro.build/).

## deps

- Node.js 22+
- [pnpm](https://pnpm.io/)
- [`lychee`](https://github.com/lycheeverse/lychee)（リンクチェッカー。CI と同じ検証をローカルで行うために使用します）

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

## Google Analytics

Google Analytics ID は環境変数 `PUBLIC_GOOGLE_ANALYTICS_ID` で管理しています。

本番環境では GitHub Secret `GOOGLE_ANALYTICS_ID` として設定済みです。

```bash
gh secret set GOOGLE_ANALYTICS_ID --body "G-YOUR-NEW-ID"
```
