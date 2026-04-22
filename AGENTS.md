# AGENTS.md

このリポジトリで作業する AI エージェント(Claude Code / Codex / Cursor / Copilot 等)向けの共通ガイド。

## Project

個人ブログ。Astro v6 + GitHub Pages + Pagefind(全文検索)。記事は `content/blog/*.md`、画像は `content/img/`、ページは `src/pages/`。

## 憲法 (MUST READ)

このリポジトリには [`src/pages/constitution.astro`](src/pages/constitution.astro) として公開される **AI 倫理憲法** が存在する。これは記事執筆・編集における最上位の規範であり、検閲スクリプトが機械的に参照する。

- **記事を書く・編集する前に必ず `src/pages/constitution.astro` を読むこと**
- 憲法の要旨: 本ブログは「AI 開発者の考える同時代の倫理観」に完全に準拠する。普遍倫理ではなく、現在の AI 開発者集団がそのモデルに埋め込んでいる価値観を唯一の基準とする
- 3 原則: (I) 事実への謙虚さ / (II) 表現の去私性 / (III) 開示の禁域

## 検閲フロー

`content/blog/*.md` をステージしてコミットする時、`.githooks/pre-commit` が 3 つのローカル LLM に記事を投げて判定する。

- Reviewer A: `llama3.1:8b` (米)
- Reviewer B: `qwen3:8b` (中)
- Reviewer C: `llm-jp-3` (日)
- ランタイム: Ollama (`http://127.0.0.1:11434/v1`)
- 合格ルール: 3 モデル中 2 つ以上が APPROVED を返すこと
- 判定軸: (1) 憲法との整合 (2) 事実確認 (3) 日本語の自然さ (4) 個人情報・機密情報漏洩

検閲に落ちた場合は記事を修正して再コミットする。AI が指摘した理由は stdout に出力される。

## Rules

1. **`git commit --no-verify` を使わない**
   - 検閲を迂回するためにローカルで通っても、GitHub Actions の `censor-guard` ジョブが `Reviewed-By:` trailer の欠落を検知して CI が fail する
   - trailer を手書きで偽造してもいけない。それは憲法違反の能動的行為とみなす

2. **コミットメッセージの `Reviewed-By:` trailer は自動生成される**
   - `.githooks/prepare-commit-msg` が検閲通過後に自動で追記する
   - エージェントはコミットメッセージに trailer を手動で書かない

3. **個人情報を記事に含めない**
   - メールアドレス、電話番号、API 鍵、社外秘情報は censor.mjs の正規表現でも検出するが、そもそも含めない
   - 作者自身の個人情報であっても同様

4. **下書き (`draft: true`) も検閲対象**
   - 3 モデルすべてローカル実行なので外部送信ゼロ
   - draft 記事も同じ 3 AI で検閲される

## Commands

```sh
# 開発サーバ
pnpm run dev

# ビルド (Pagefind インデックス含む)
pnpm run build

# 単発で記事を検閲 (Ollama + 3 モデル必須)
pnpm run review content/blog/<article>.md

# ステージ済みの記事を検閲 (pre-commit と同じ挙動)
pnpm run review
```

## 初回セットアップ(検閲を動かすため)

```sh
pnpm install
brew install ollama
ollama serve &
ollama pull llama3.1:8b
ollama pull qwen3:8b
# llm-jp-3 は Modelfile で登録(詳細は README.md)
```

## Structure

- `content/blog/` — 記事 (Markdown)。frontmatter の schema は `src/content.config.ts`
- `content/img/` — 記事で参照する画像
- `src/pages/` — Astro ページ。`constitution.astro` は改変前に CODEOWNERS 相当の配慮をすること
- `src/components/` — Astro コンポーネント
- `src/layouts/` — ページレイアウト
- `scripts/censor.mjs` — 3-AI 検閲本体
- `scripts/llm-jp-3.Modelfile` — 日本語モデルの Ollama 登録定義
- `.githooks/pre-commit` — 検閲 (exit 1 でコミット中止)
- `.githooks/prepare-commit-msg` — 検閲通過時に trailer 付与
- `.github/workflows/gh-pages.yml` — `censor-guard` + `build` + `deploy` の 3 ジョブ
- `dist/` — ビルド成果物(触らない)

## Language

ユーザとのやり取りは日本語を優先する。コード内の識別子・英語コメントはそのままで構わない。

## Commit / PR

- コミットメッセージの先頭は動詞の命令形(例: `fix:`, `feat:`, `chore:` などの conventional commits も許容)
- 記事を変更したコミットには `Reviewed-By: 3-AI-Censor (...) APPROVED YYYY-MM-DD` trailer が自動で付く
- PR はデフォルトで main へ向けて作る
