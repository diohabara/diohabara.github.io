---
title: "CでCコンパイラを書いた"
date: 2022-07-19T23:03:20+09:00
draft: false
type: "post"
tags: ["c", "compiler"]
share: true
---

- [3 行まとめ](#3-行まとめ)
- [何をした？](#何をした)
- [なぜやった？](#なぜやった)
- [得たもの](#得たもの)
- [次にやりたいこと](#次にやりたいこと)
- [謝辞](#謝辞)
- [参照](#参照)

![c](/images/The_C_Programming_Language_logo.svg)

## 3 行まとめ

- C で C コンパイラを書いた
- 大学で一応コンパイラを書いたが理解していなかったので確認のため
- 次は別のアセンブリ、言語で書きたい

## 何をした？

[Rui Ueyama 氏の書いたコンパイラに関する記事](https://www.sigbus.info/compilerbook)と[関連レポジトリ](https://github.com/rui314/chibicc/)を元に[C コンパイラ](https://github.com/diohabara/ccc)を書いた。正確には参照用のブランチを見て写経をした。途中までは要件から自分で書いていたのだが、途中バグって数日を無駄にしたので学習目的と割り切って写経に切り替えた。

## なぜやった？

コンパイラを書いたことがなかったから。コンパイラとは一般に「字句解析 → 構文解析 → 意味解析 → コード生成」するソフトだろう。自分は今までコード生成、つまりアセンブリのコードを出力するところをやったことがなかった。

一応大学の講義でやった...ということになっているのだが、よくわからず適当に動かしていたらテストケースが通っていたという感じである。だから理解をしながらやったのは今回が初めてとなる。

## 得たもの

C で C のコンパイラを書くという内容だったが、C で C のコンパイラが書くことも分解すれば単純なことの繰り返しだということがわかってよかった。しかし、Rui Ueyama 氏の参考コードを読むと単純なことなのに実装するまで気付かない解決策が多い。ここらへんはやはり自分で何度も手を動かしたり、他人のコードを盗むしかないのだと思う。

インターンが中心になるとコードを書く行数が減るので意識してコードを書こうと思った。

## 次にやりたいこと

次はアセンブリ(Arm、RISC-V)について勉強をするか、Rust について勉強をして Rust でコンパイラを書いてみたいと思った。

前者に関しては、この記事だと x86-64 が使われていたのですが別のアセンブリも触ってみたいから。後者に関しては、C ではなくて現代的機能を持ったシステムプログラミング言語を触ってみたいから。

## 謝辞

このような記事を書いてくれた Rui Ueyama 氏に感謝。

## 参照

- <https://www.sigbus.info/compilerbook>
- <https://github.com/rui314/chibicc/commits/reference>