#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$REPO_ROOT/public"

if ! command -v hugo >/dev/null 2>&1; then
  echo "[link-check] hugo が見つかりません。https://gohugo.io/installation/ を参考にインストールしてください。" >&2
  exit 127
fi

if ! command -v lychee >/dev/null 2>&1; then
  cat >&2 <<'EOF'
[link-check] lychee が見つかりません。
Homebrew を使用している場合は `brew install lycheeverse/lychee/lychee`、
または `cargo install lychee` で導入できます。
EOF
  exit 127
fi

cd "$REPO_ROOT"

BASE_LYCHEE_FLAGS=("--config" "lychee.toml" "--verbose")

echo "[link-check] Building Hugo site (production flags match CI)..."
HUGO_ENV=production hugo --minify --gc --cleanDestinationDir

echo "[link-check] Running lychee (offline/internal only) against ./public ..."
lychee "${BASE_LYCHEE_FLAGS[@]}" --root-dir "$PUBLIC_DIR" --offline "$PUBLIC_DIR" "$@"

echo "[link-check] ✅ Completed link check"
