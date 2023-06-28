---
title: "picoCTF 2021: Python Wrangling"
date: 2023-06-28T04:46:22-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
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
