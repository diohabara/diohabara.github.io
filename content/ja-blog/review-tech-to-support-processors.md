---
title: "｢プロセッサを支える技術｣を読んだ"
date: 2022-05-17T01:24:42+09:00
draft: false
type: "post"
tags: ["review", "processor"]
---

- [感想](#感想)
- [次に読みたい･したい](#次に読みたいしたい)
- [謝辞](#謝辞)
- [参照](#参照)

<!-- ここに変な画像 -->

![nvidia](/images/nvidia_black_jacket.jpeg)

## 感想

読んで良かったとは思いましたが、人におすすめはしないでしょう。コンピュータ・アーキテクチャの教科書と最新のサーベイ論文を読んだ方が良いと思うからです。

本書では学部の授業･教科書で勉強するようなコンピュータ･アーキテクチャに関することを復習できました。
忘れていることや、教科書と比べて説明がわかりにくいと思うことが多々ありました。特にメモリに関連した部分です。理解が浅いと読みにくいので、ある程度理解している人が読むべき本なのでしょう。本書を読んで改めてコンピュータ・アーキテクチャに関する理解が浅いことを感じたので後で復習をしようと思います。

コンピュータ・アーキテクチャの授業･教科書では学ばないけれども本書で取り上げられていたこととして仮想化や、マルチプロセッサ、GPGPU が上げられます。
[OpenCL](https://www.khronos.org/opencl/)も単語を聞いただけでしたが、本書を読み OpenCL とは業界の標準的な GPGPU のプログラミングシステムだということが学べてよかったです。
ただ、発展的な内容は出版当時の 2011 年の情報であり古いものも多い印象です。そのためわざわざ本書を買って学ぶべきだとは思いませんでした。

## 次に読みたい･したい

理論的な部分はパタヘネを再度読みたいと思います。余力があれば読み終えていないヘネパタも読みたいです。
実践的な部分は、プロセッサに関して実装レベルで理解していないことが多いので、また CPU の実装をしたいと思います。ちょうど RISC-V と Arm の違いについて学ぼうと思っていたので良い機会です。

## 謝辞

著者の Hisa Ando さん、面白い本をありがとうございます。

## 参照

[プロセッサを支える技術](https://gihyo.jp/book/2011/978-4-7741-4521-1)

<a href="https://b.hatena.ne.jp/entry/" class="hatena-bookmark-button" data-hatena-bookmark-layout="vertical-normal" data-hatena-bookmark-lang="ja" title="このエントリーをはてなブックマークに追加"><img src="https://b.st-hatena.com/images/v4/public/entry-button/button-only@2x.png" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="https://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>
