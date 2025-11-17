# blog

[![GitHub Pages](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml)

My personal blog.

## deps

- `hugo` (latest version - automatically updated in CI)
- [`lychee`](https://github.com/lycheeverse/lychee)（リンクチェッカー。CI と同じ検証をローカルで行うために使用します）

## watch

```sh
hugo server
```

## Link check (same as CI)

CI では Hugo でサイトをビルドしたあと `lychee` でリンク切れを検出しています。同じ検証を手元で再現するには、`lychee` をインストールしたうえで次を実行してください:

```bash
brew install lycheeverse/lychee/lychee # もしくは `cargo install lychee`
./scripts/link-check.sh                  # ネットワーク接続がある場合
LYCHEE_OFFLINE=1 ./scripts/link-check.sh # 外部ネットワークが使えない環境 (強制)
```

このスクリプトは CI と同じ `hugo --minify --gc --cleanDestinationDir` を実行し、生成された `public/` を `lychee --offline --root-dir <repo>/public` でチェックします（内部リンクのみ検証）。外部リンクは現在 CI では検査していません。必要なら追加の引数を渡して各自実行してください。

## how to write posts

```shell
hugo new blog/<TITLE>.md
```

### OGP 画像の設定

記事ごとに OGP 画像を設定できます。記事の front matter に以下を追加してください：

```yaml
---
title: "記事タイトル"
date: 2025-01-01
image: "/images/your-ogp-image.jpg" # OGP画像のパス
description: "記事の説明文" # OGPのdescriptionとして使用
---
```

推奨画像サイズ：1200x630px

### 画像の最適化

ブログには画像最適化機能が実装されています：

#### 自動最適化スクリプト

```bash
# 画像を自動的に最適化（要ImageMagick）
./scripts/optimize-images.sh
```

このスクリプトは：

- 大きな画像を最大幅 1200px にリサイズ
- JPEG/PNG 画像を圧縮
- WebP 形式を自動生成
- オリジナル画像をバックアップ

#### 画像ショートコード

記事内で最適化された画像を使用：

```markdown
{{< image src="/images/example.jpg" alt="説明文" caption="キャプション（任意）" >}}
```

機能：

- 遅延読み込み（lazy loading）
- WebP 対応（自動フォールバック）
- レスポンシブ画像
- SEO 最適化された alt 属性

## Theme Management

This blog uses the [Gokarna](https://github.com/526avijitgupta/gokarna) theme as a Git submodule.

### Initialize theme after cloning

```shell
git submodule update --init --recursive
```

### Update theme to latest version

```shell
git submodule update --remote themes/gokarna
```

## 言語フィルター

ブログ記事は日本語と英語が混在しています。記事一覧ページで言語別にフィルタリングできます：

- 「すべて」: すべての記事を表示
- 「日本語」: 日本語記事のみ表示
- 「English」: 英語記事のみ表示

新しい記事を作成する際は、front matter に`language: "ja"`または`language: "en"`を指定してください。

## SEO 最適化

このブログは以下の SEO 最適化が実装されています：

### 構造化データ（JSON-LD）

自動的に以下の schema.org マークアップが生成されます：

- WebSite スキーマ（トップページ）
- BlogPosting スキーマ（各記事）
- BreadcrumbList スキーマ（パンくずリスト）
- Person スキーマ（著者情報）

### Open Graph タグ

- 記事ページでは`og:type="article"`を使用
- 記事の公開日時・更新日時を自動設定
- Twitter Card 対応（large_image 形式）

### その他の SEO 機能

- sitemap.xml 自動生成
- robots.txt（悪質ボットのブロック対応）
- canonical タグ
- 適切な meta description
- 画像の遅延読み込み

## Google Analytics

このブログは Google Analytics を環境変数で管理しています。

### ローカル開発環境

1. `.env.example`を`.env`にコピー:

   ```bash
   cp .env.example .env
   ```

2. `.env`を編集して Google Analytics の Measurement ID を設定:

   ```bash
   HUGO_SERVICES_GOOGLEANALYTICS_ID=G-XXXXXXXXXX
   ```

3. 環境変数を読み込んで Hugo を実行:

   ```bash
   source .env && hugo serve
   ```

### 本番環境（GitHub Pages）

Google Analytics ID は GitHub Secret として設定されています：

- Secret 名: `GOOGLE_ANALYTICS_ID`
- 使用場所: `.github/workflows/gh-pages.yml`

ID を更新する場合:

```bash
gh secret set GOOGLE_ANALYTICS_ID --body "G-YOUR-NEW-ID"
```

## TODO

- [x] enable OGP (already implemented in Gokarna theme)
- [x] 多言語対応 - 言語フィルター機能実装済み
- [x] SEO 最適化 - JSON-LD 構造化データ、改善された OGP タグ実装済み
- [x] 画像最適化 - 遅延読み込み、WebP 対応、最適化スクリプト実装済み
