---
title: "picoCTF 2021: Obedient Cat"
date: 2023-06-28T00:09:10-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
language: "en"
aiReview:
  reviewedAt: "2026-05-07T04:41:15+09:00"
  contentHash: "sha256:2ff1d66aff5a09f83d034b7e3e0098ad255aa9aef7adc15d7bea9bbc467fe06b"
  results:
    - model: "llama3.1:8b@46e0c10c039e"
      verdict: "APPROVED"
      comment: "バールは安了した、参照を試いる、正当に安了した、バールは本場合を私ないる、正当に安了した」"
    - model: "qwen3:latest@500a1f067a9f"
      verdict: "APPROVED"
      comment: "記事はAI倫理憲法と矛盾せず、事実誤認もなければ不自然な表現も個人情報も含まれていない。"
    - model: "hf.co/mmnga/llm-jp-3.1-1.8b-instruct4-gguf:Q4_K_M@8f80dcfa7c40"
      verdict: "APPROVED"
      comment: "The provided article meets all the requirements of a valid blog post in terms of content, structure, formatting, language, tags, and other relevant criteria."
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

Download the attached file and run `cat` on it. You'll find the flag.

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.
