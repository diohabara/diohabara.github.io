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

## TODO

- [x] enable OGP (already implemented in Gokarna theme)
- [x] 多言語対応 - 言語フィルター機能実装済み
- [ ] SEO最適化の余地あり
- [ ] 画像最適化が未実施
