---
title: "picoCTF 2021: Wave a Flag"
date: 2023-06-28T04:59:58-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
language: "en"
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
