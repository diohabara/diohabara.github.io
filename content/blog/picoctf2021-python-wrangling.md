---
title: "picoCTF 2021: Python Wrangling"
date: 2023-06-28T04:46:22-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:41:54+09:00"
  contentHash: "sha256:646c4fbb745f3c46e40e36652d4b31f1194af4dbde862ac2348e8a9e44d77c43"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "フイゲールです、ユントレストを反安でいる"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法と矛盾せず、事実誤認もなければ日本語として不自然な表現も含まれず、個人情報や機密情報も含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The provided content is a well-structured blog post on 'picocTF 2021: Python Wrangling', which includes the title, date, draft status, and tags. It also contains information about the solution (`ende."
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

You will be given the following files.

- `ende.py`
- `flag.txt.en`
- `pw.txt`

The `ende.py` is a simple encryption/decryption script.

```sh
$ python scripts/ende.py
Usage: scripts/ende.py (-e/-d) [file]
```

The `flag.txt.en` is an encrypted flag. I used the string in `pw.txt` as a password.

```sh
$ python scripts/ende.py -d scripts/flag.txt.en
Please enter the password:ac9bd0ffac9bd0ffac9bd0ffac9bd0ff
picoCTF{4p0110_1n_7h3_h0us3_ac9bd0ff}
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.
