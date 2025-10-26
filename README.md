# blog

[![GitHub Pages](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/diohabara/diohabara.github.io/actions/workflows/gh-pages.yml)

My personal blog.

## deps

- `hugo` (latest version - automatically updated in CI)

## watch

```sh
hugo server
```

## how to write posts

```shell
hugo new blog/<TITLE>.md
```

### OGP画像の設定

記事ごとにOGP画像を設定できます。記事のfront matterに以下を追加してください：

```yaml
---
title: "記事タイトル"
date: 2025-01-01
image: "/images/your-ogp-image.jpg"  # OGP画像のパス
description: "記事の説明文"  # OGPのdescriptionとして使用
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
- 大きな画像を最大幅1200pxにリサイズ
- JPEG/PNG画像を圧縮
- WebP形式を自動生成
- オリジナル画像をバックアップ

#### 画像ショートコード

記事内で最適化された画像を使用：

```markdown
{{< image src="/images/example.jpg" alt="説明文" caption="キャプション（任意）" >}}
```

機能：
- 遅延読み込み（lazy loading）
- WebP対応（自動フォールバック）
- レスポンシブ画像
- SEO最適化されたalt属性

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

新しい記事を作成する際は、front matterに`language: "ja"`または`language: "en"`を指定してください。

## SEO最適化

このブログは以下のSEO最適化が実装されています：

### 構造化データ（JSON-LD）

自動的に以下のschema.orgマークアップが生成されます：
- WebSiteスキーマ（トップページ）
- BlogPostingスキーマ（各記事）
- BreadcrumbListスキーマ（パンくずリスト）
- Personスキーマ（著者情報）

### Open Graphタグ

- 記事ページでは`og:type="article"`を使用
- 記事の公開日時・更新日時を自動設定
- Twitter Card対応（large_image形式）

### その他のSEO機能

- sitemap.xml自動生成
- robots.txt（悪質ボットのブロック対応）
- canonicalタグ
- 適切なmeta description
- 画像の遅延読み込み

## Google Analytics

このブログはGoogle Analyticsを環境変数で管理しています。

### ローカル開発環境

1. `.env.example`を`.env`にコピー:

   ```bash
   cp .env.example .env
   ```

2. `.env`を編集してGoogle AnalyticsのMeasurement IDを設定:

   ```
   HUGO_SERVICES_GOOGLEANALYTICS_ID=G-XXXXXXXXXX
   ```

3. 環境変数を読み込んでHugoを実行:

   ```bash
   source .env && hugo serve
   ```

### 本番環境（GitHub Pages）

Google Analytics IDはGitHub Secretとして設定されています：

- Secret名: `GOOGLE_ANALYTICS_ID`
- 使用場所: `.github/workflows/gh-pages.yml`

IDを更新する場合:

```bash
gh secret set GOOGLE_ANALYTICS_ID --body "G-YOUR-NEW-ID"
```

## TODO

- [x] enable OGP (already implemented in Gokarna theme)
- [x] 多言語対応 - 言語フィルター機能実装済み
- [x] SEO最適化 - JSON-LD構造化データ、改善されたOGPタグ実装済み
- [x] 画像最適化 - 遅延読み込み、WebP対応、最適化スクリプト実装済み
