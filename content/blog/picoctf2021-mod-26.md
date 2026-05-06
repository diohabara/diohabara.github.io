---
title: "picoCTF 2021: Mod 26"
date: 2023-06-28T00:21:24-05:00
draft: false
type: "post"
tags: ["CTF", "Cryptography"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:39:38+09:00"
  contentHash: "sha256:749bb8fdc4404732a109532b6d96adfa5a115d7d842b37936317cd88ee56ed7a"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "フレストラインターですを反安、注册るいますを苹斈だたきです。"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法に矛盾せず、事実誤認もなければ日本語として不自然な表現も含まれず、個人情報も含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The provided code is a valid Python script that implements the rot13 encryption algorithm to encrypt a given string using ROTI13 function and then prints it out."
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

You will be given this string, `cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_hyLicInt}`.
Apply ROT13 to it and you'll get the flag.

```python
def rot13(s):
    ret = []
    for c in s:
        if ord("a") <= ord(c) <= ord("z"):
            ret.append(chr((ord(c) - ord("a") + 13) % 26 + ord("a")))
        elif ord("A") <= ord(c) <= ord("Z"):
            ret.append(chr((ord(c) - ord("A") + 13) % 26 + ord("A")))
        else:
            ret.append(c)
    return "".join(ret)


def main():
    flag = "cvpbPGS{arkg_gvzr_V'yy_gel_2_ebhaqf_bs_ebg13_hyLicInt}"
    decoded_flag = rot13(flag)
    print(decoded_flag)


if __name__ == "__main__":
    main()
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.
