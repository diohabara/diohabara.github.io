---
title: "picoCTF 2021: Mod 26"
date: 2023-06-28T00:21:24-05:00
draft: false
type: "post"
tags: ["CTF", "Cryptography"]
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
