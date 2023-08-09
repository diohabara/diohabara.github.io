---
title: "picoCTF 2021: Nice netcat..."
date: 2023-07-07T00:00:47-05:00
draft: false
type: "post"
tags: ["CTF", "General Skills"]
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
