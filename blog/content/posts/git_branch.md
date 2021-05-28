---
title: gitのdefault branchの名前をmainに変えました
template: "post"
date: "2021-05-27"
draft: false
slug: "git-branch"
category: "tech"
description: "中身だけじゃなくて名前も大事です"
tags:
- "tech"
- "git"
---

## *GitHub*と`git`の*default branch*の名前が変わった

かなり以前のニュースなのですが、*GitHub*の*default branch*の名前が`master`から`main`に変わりました。

<https://github.com/github/renaming>

自分で設定を変えることができる(変えていた)ので気にしていませんでしたが、`git`コマンドの方もそれに合わせて*default branch*の名前を変えたようです。

下の*warning*は`git init`をしたときに出てきたものです。

```sh

hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint: 	git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint: 	git branch -m <name>
```

ちなみに`git`のバージョンは以下の通りです(*macOS*)。

```sh
❯ git --version
git version 2.30.1 (Apple Git-130)
```

この*warning*を見たとき、自分は｢勝ち馬に乗る｣をモットーとしているので、どうせ名前を設定しろと言われるのなら勝ち馬となった`main`に変えることを決意しました。

## *GitHub*と*git*の設定の変更方法

### *GitHub*

[これ](https://docs.github.com/en/github/administering-a-repository/managing-branches-in-your-repository/changing-the-default-branch)を参考にしましょう。

## *git*

[これ](https://git-scm.com/docs/git-config)を参考にしましょう。詳しく言うとコマンドでぱぱっと設定するなら、

```sh
git config --global init.defaultBranch main
```

ファイルで管理するなら`$XDG_CONFIG_HOME/git/config`に以下のように書けば良いです。

```yaml
[init]
    defaultBranch = "main"
```

