---
title: "picoCTF 2021: Wave a Flag"
date: 2023-06-28T04:59:58-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:43:29+09:00"
  contentHash: "sha256:aa6db9e37018e02a0376ee8f2c8b9be1ff83fead4b936a7be79f29ae8c14738e"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "バールでからたん、家一で反前とがおますいる"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法と矛盾せず、事実誤認もなければ日本語として不自然な表現も含まれず、個人情報も含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The provided content is a well-structured blog post that describes the process of analyzing an ELF file (Executable/Linker) and interpreting its contents to reveal hidden information. The explanation "
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

You're given a file called `warm`. Run `file` on it and you'll find that it's an ELF file.

```sh
$ file resources/warm
resources/warm: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=01b148cdedfc38125cac0d87e0537466d47927b1, with debug_info, not stripped
```

Run `./warm` and  you'll get the following output.

```sh
$ ./resources/warm
Hello user! Pass me a -h to learn what I can do!
```

Run the following command to give it a right permission and run it again.

```sh
$ chmod +x resources/warm
$ ./resources/warm
Oh, help? I actually don't do much, but I do have this flag here: picoCTF{b1scu1ts_4nd_gr4vy_f0668f62}
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.
