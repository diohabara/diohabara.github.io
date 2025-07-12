---
title: "picoCTF 2021: Transformation"
date: 2023-08-09T14:11:01-05:00
draft: false
type: "post"
tags: ["CTF", "Reverse Engineering"]
language: "en"
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
