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

## TODO

- [ ] enable OGP
