---
title: "CTF初心者がNSA Codebreakerに参加した感想"
date: 2022-12-27T01:16:36+09:00
draft: false
type: "post"
tags: ["ctf", "nsa cbc"]
share: true
---

- [3行まとめ](#3行まとめ)
- [NSA Codebreaker Challenge とは？](#nsa-codebreaker-challenge-とは)
- [なぜ参加をしたのか？](#なぜ参加をしたのか)
- [解けた問題の簡単な解説](#解けた問題の簡単な解説)
  - [Task 0](#task-0)
  - [Task A1](#task-a1)
  - [Task A2](#task-a2)
  - [Task B1](#task-b1)
  - [Task B2](#task-b2)
  - [Task 5](#task-5)
  - [Task 6](#task-6)
  - [総括](#総括)
- [謝辞](#謝辞)

![badge](/images/badgea1.png)

## 3行まとめ

1. NSAはアメリカの大学(院)生を対象にCTFコンテストを開いている
2. 大学院の授業の一環で参加した
3. 今回自分が解いた問題を簡単に解説

## NSA Codebreaker Challenge とは？

アメリカと聞いたら何を思い浮かべるでしょうか？やはりNSA、CIA、FBIのような諜報機関ですよね。その中でもNSAは大規模な個人情報収集をしているとスノーデンが暴露したことで有名ですね。そんなゲキヤバストーカー集団NSAが開いたCTFコンテストにCTF初心者であるワテクシ＝漏れが参加した記録です。

???「"NSA Codebreaker Challenge"よ...これは名前。」

URL: <https://nsa-codebreaker.org/home>

このコンテストは学生にセキュリティ関連の問題を解く機会とされています。同時に学生が10問中9問以上解くとNSAから採用の連絡が来ることも告げられており、採用活動の一環でもあるようです。

以下はその原文です。

> The NSA Codebreaker Challenge provides students with a hands-on opportunity to develop their reverse-engineering / low-level code analysis skills while working on a realistic problem set centered around the NSA's mission.
> While the challenge is intended for students, professors are encouraged to participate as well. Furthermore, the site was designed to make it easy for those professors interested in incorporating the challenge into their courses to do so (see the additional FAQ entries below.)

実際にはバイナリ解析のような問題ばかりではなく、Webに関する知識など広くセキュリティに関連する知識を要求されます。

## なぜ参加をしたのか？

今回僕が参加したのは授業の一環です。先学期取ったバイナリ解析の授業で参加が要求され、成績の20%を占めていました。
授業ではバイナリ解析については扱ったがその他の知識は完全にググった程度だったので初心者でもある程度は解けるように設計されているらしい。

## 解けた問題の簡単な解説

では、ようやくNSAの作った問題をざっくり紹介しながら解説していきます。

このコンテストにはFBIの捜査員としてランサムウェアの被害を受けた会社と連携してその犯人を探すという設定があり、設定に従って問題を解いていく。

### Task 0

Discordに参加すればフラグがもらえます。こういうタスクってほぼアクティブな参加者数を特定するためだけに使われていますよね。

### Task A1

侵入された会社のVPNのログから怪しいユーザーを割り出すというもの。同じ時間に2つのIPアドレスからアクセスしているユーザーが怪しいのでそのユーザー名がフラグです。エクセルなどでログをソートすれば見つかるはずです。

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/a1.ipynb)

### Task A2

次は`.pcap`ファイルと`.pem`ファイルの入ったフォルダのデータが与えられるので、Wiresharkを使ってTLSセッションを復号しユーザー名っぽいものを探します。適当に入力したものが答えでした()

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/a2.ipynb)

### Task B1

ランサムサイトから関連するサイトを見つけるという問題で、ブラウザの`Developer Tools`の`Network`からヘッダーにある別のドメインのサイトを見つけました。

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/b1.ipynb)

### Task B2

今度は[Task B1](#task-b1)で見つけたサイトから「ログインページを見つけろ」という問題です。[このリスト](https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/common.txt)を使ってブルートフォースをし、`.git`が露出していたので[gitdumper.sh](https://github.com/internetwache/GitTools/blob/master/Dumper/gitdumper.sh)というツールを使いソースコード全体を取り出しソースコードからログインページを割り出しました。

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/b2.ipynb)

### Task 5

この問題はようやくバイナリ解析します。`ssh-agent`と`core`と暗号化されたデータ`data.enc`が与えられるので、`gdb`を使って起動します。`core`があるので、メモリ上にあったデータを見ることができます。そして、その中からopensslのハッシュの元となるデータを見つけ、再度生成します。生成した`.pem`ファイルを使って`data.enc`を複合すれば答えが得られました。

この問題が一番難しいと同時に面白かったです。

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/task5.ipynb)

### Task 6

この問題は一番簡単でした。[Task 5](#task-5)の答えはJWTのトークンであり、JWTから元となるデータを手に入れ、パスワードを[Task B2](#task-b2)で手に入れたソースコードから見つけそれらを組み合わせることで新しくJWTのトークンを生成します。それが答えです。

[詳しいwrite-up](https://github.com/diohabara/nsa-codebreaker-challenge2022/blob/main/task6.ipynb)

### 総括

write-upを書くとなぜ手こずっていたのかよくわからなくなりますね。あと、投稿完全に遅れてすみません...

## 謝辞

授業を提供し、このコンテストに参加するきっかけをくれた教授に感謝。
コンテストを開催してくれたNSAにも感謝。
