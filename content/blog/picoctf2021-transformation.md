---
title: "picoCTF 2021: Transformation"
date: 2023-08-09T14:11:01-05:00
draft: false
type: "post"
tags: ["CTF", "Reverse Engineering"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:42:52+09:00"
  contentHash: "sha256:a2053fcbfe44242a363b51b4b3b5a5c5118cf2b0b1b95097006626939d3bc87a"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "アラビントでたるんざい、害反にたるいますいださいしい、ヒールエテストを反前にらう。"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法の原則に合致し、事実誤認なし、日本語として自然で個人情報・機密情報は含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The provided solution is correct as it correctly decrypts the flag using the given algorithm."
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)
- [References](#references)

## Solution

You will be given the following file, `enc`.

```sh
$ bat resources/enc -p
灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸彤㔲挶戹㍽
```

The problem description says

```markdown
I wonder what this really is...
''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
```

The `enc` file should contain the encrypted flag. The flag is encrypted by the following algorithm.

```python
def encrypt(flag):
    return "".join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
```

Thus, we need to decrypt the flag. The following script decrypts the flag.

```python
def decrypt(flag):
    return "".join([chr((ord(flag[i]) >> 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
```

Yeah, we've got the flag.

```txt
$ python scripts/transformation.py
picoCTF{16_bits_inst34d_of_8_d52c6b93}
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.

## References
