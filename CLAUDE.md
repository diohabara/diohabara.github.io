@AGENTS.md

## Claude Code 固有メモ

- 記事を新規作成・編集する前に `src/pages/constitution.astro` を `Read` で必ず確認すること(検閲の判定基準がそのまま書かれている)
- 記事内の事実を WebFetch / WebSearch で裏取りしてから書くこと。AI が検閲で事実誤認を検出した場合は根拠付きで修正する
- 既存記事の文体は `Grep`/`Read` で参照し、文体の連続性を保つこと
- `scripts/censor.mjs` を変更する際は、出力 JSON スキーマ `{"verdict": "APPROVED"|"REJECTED", "reason": "..."}` を壊さないこと。壊すと 3 モデル中複数が ABSTAIN 扱いになり検閲が通らなくなる
- `.githooks/*` は実行ビットが必要。新規作成したら `chmod +x` を忘れない
