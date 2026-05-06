---
title: "picoCTF 2021: Nice netcat..."
date: 2023-07-07T00:00:47-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:40:26+09:00"
  contentHash: "sha256:06b37f96f38d173dde6438f8942d3d77cc68bc2deba8ad327b1245307cfab64a"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "シヨアパックを保存でいるたます。"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法と矛盾せず、事実誤認もなし。日本語として自然で、個人情報も含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The article is a well-structured blog post that provides an explanation of the content related to picocTF 2021 with proper formatting and tags, as well as acknowledging the expertise from CMU security"
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

When I execute the given command, I get this output:

```sh
$ nc mercury.picoctf.net 21135
112 
105 
99 
111 
67 
84 
70 
123 
103 
48 
48 
100 
95 
107 
49 
116 
116 
121 
33 
95 
110 
49 
99 
51 
95 
107 
49 
116 
116 
121 
33 
95 
97 
102 
100 
53 
102 
100 
97 
52 
125 
10 
```

This seems to be a list of ASCII codes. I can use a converter from [here](https://onlineasciitools.com/convert-decimal-to-ascii) to convert them to ASCII characters. I get this output:

```sh
picoCTF{g00d_k1tty!_n1c3_k1tty!_afd5fda4}
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.
