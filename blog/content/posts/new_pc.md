---
title: 自作PCを組み立てて、 Ubuntu 21.04 をセットアップした
template: "post"
date: "2021-05-20"
draft: false
slug: "new_pc"
category: "tech"
description: "研究室に配属され、研究室に転がっていたPCを使っていたある日"
tags:
  - "tech"
  - "linux"
---

## <注意>題名には 21.04 と書かれていますが、実際には 20.04 をインストールしています。</注意>

## 新しいパソコンがほしい

4 月になり、大学では新学期が始まりました。大学 4 年生になると、私の大学では研究室に配属されます。

私の研究室ではデジタル回路に関する研究をすることになっているので、*Verilog*が書けるように(結局必要はなさそうですが)*Ubuntu*を入れた*PC*を用意することにしました。研究室から事前にもらった*PC*もあるのですが、スペックが低すぎるなどの問題があり使おうとはなりませんでした。そして、*GPU*だけ借用はしましたが基本的には自分で*PC*パーツを購入して組み立てました。

## 構成

構成は以下の通りです。

- *PC*ケース: Antec, DP 501
- 電源: 玄人志向, KRPW-BR550W/85+
- マザーボード: ASUS, TUF GAMING B550-PLUS
- _CPU_: AMD, Ryzen 5600X
- *CPU*クーラー: (*CPU*付属のもの)

- _RAM_: Crucial, DDR4 3200 8GB x 2
- SSD: Samsung, 970 EVO 500GB

- _GPU_: NVIDIA, GeForce GTX 660 OEM

新規購入したパーツの合計は*10*万円くらいだと思います。正確な値は心が痛くなるので忘却の彼方にふっとばしました。

## 困ったこと

### その 1...有線*LAN*

デスクトップ*PC*ですし有線接続でいいだろということで、*Wi-Fi*のついていないマザーボードを購入しました。しかし、これが大きな過ちで、*Ubuntu 20.04*はこのマザーボードの*LAN*に対するドライバーを標準で搭載していなかったのです。そのため、*Ubuntu 20.04*を使うにはドライバーをインストールする必要がありました。しかし、インターネットに接続されていないので困り果てました。ドライバーを普通にインストールすることはできませんし、インターネット上にあった*LAN*のドライバーのインストールする手順は*PC*に`make`と`gcc`がインストールされていることを前提としていました。当然`apt`を使うこともできないので、*USB*にファイルを入れたり入れなかったりを繰り返し最終的には*Ubuntu 21.04*を入れることを決意しました。

さらば、全ての*Ubuntu 20.04*。

住めば都、と言いますが実際快適です。まだそこまで困っていないのでとりあえずこのまま使っていこうと思います。

### その 2...Err:4 <https://dl.bintray.com/ether/debian> stable Release 403 Forbidden

*Bootable USB*は*macOS*で作成しました。[Etcher](https://www.balena.io/etcher/)というソフトを[公式の指示](https://ubuntu.com/tutorials/create-a-usb-stick-on-macos#1-overview)に従って使いました。このソフト自体はすんなり使えたのですが、この*USB*から*OS*をインストールすると表題のようなエラーが出て、`sudo apt update`が上手くできませんでした。

色々ググり、最終的に[このページ](https://askubuntu.com/questions/1213220/err4-https-dl-bintray-com-etcher-debian-stable-release-403-forbidden)に書かれている通りに`/etc/apt/source.list.d`というディレクトリ内にある`etcher`に関連したファイルを削除したところ正常に動くようになりました。

### 追記 やっぱり*Ubuntu 20.04*を使っています

住めば都？なんかそういうデータでもあるんですか？

そういうデータが見つかりませんでした。やはり、ビルド等でエラーが出てくることが多く、面倒なので*Ubuntu 20.04*を使うことにしました。そのためには、ネットワークを介さずに`build-essential`をインストールし、有線 LAN のドライバーをインストールする必要があります。

必要なものは

- *USB*ドライブ 2 つ(*bootable USB*ドライブと`.deb`ファイルとドライバーを入れる*USB*ドライブ)
- ネットワークに繋ぐことのできる*Ubuntu 20.04*機(仮想マシンを使えば良いです)

まず、`build-essential`のダウンロードです。最初に*Ubuntu 20.04*の入った*PC*を用意します。私は*Parallels*という仮想化ソフトを使いました。ここに入れた*Ubuntu 20.04*を使い、`build-essential`を依存しているパッケージごとダウンロードします。ちなみに、[これ](https://superuser.com/questions/1112525/ignore-apt-get-download-errors)を参照しました。

```sh
cd <path-to-your-usb-drive>
mkdir packages && cd packages
sudo apt update && sudo apt upgrade -y
sudo apt install apt-rdepends
sudo bash ./getdepends.sh build-essential
```

以下は`getdepends.sh`の中身です。

```sh
#!/bin/bash
export MAXPARAMETERS=255

function array_contains_find_index() {
  local n=$#
  local i=0
  local value=${!n}

  for (( i=1; i < n; i++ )) {
    if [ "${!i}" == "${value}" ]; then
      echo "REMOVING $i: ${!i} = ${value}"
      return $i
    fi
  }
  return $MAXPARAMETERS
}

LIST=( $( apt-rdepends $1 | grep -v "^ " ) )
echo ${LIST[*]}
read -n1 -r -p "... Packages that will be downloaded (Continue or CTRL+C) ..."

RESULTS=( $( apt-get download ${LIST[*]} |& cut -d' ' -f 8 ) )
LISTLEN=${#LIST[@]}

while [ ${#RESULTS[@]} -gt 0 ]; do
  for (( i=0; i < $LISTLEN; i++ )); do
    array_contains_find_index ${RESULTS[@]} ${LIST[$i]}
    ret=$?

    if (( $ret != $MAXPARAMETERS )); then
      unset LIST[$i]
    fi
  done

  FULLRESULTS=$( apt-get download ${LIST[*]} 2>&1  )
  RESULTS=( $( echo $FULLRESULTS |& cut -d' ' -f 11 | sed -r "s/'(.*?):(.*$)/\1/g" ) )
done

apt-get download ${LIST[*]}
```

保存先の*USB*ドライブに`packages`というディレクトリを作り、そこに依存ファイルごと`build-essential`に関連した`.deb`ファイルをダウンロードして入れておきます。

そして、新しく*PC*に*Ubuntu 20.04*をインストールし、そこに*USB*ドライブを刺し、この*USB*ドライブのディレクトリ直下ですべてのパッケージをインストールします。

```sh
sudo dpkg -i *.deb
```

こうするとドライバーをインストールするのに必要な`make`と`gcc`はインストールされたので、*REALTEK*のドライバーを[このサイト](https://www.realtek.com/ja/component/zoo/category/network-interface-controllers-10-100-1000m-gigabit-ethernet-pci-express-software)からダウンロードします。*2.5G Ethernet LINUX driver r8125 for kernel up to 5.6*というやつです。

そして、これも*USB*ドライブに入れ`README`に従ってインストールします。

```sh
sudo bash ./autorun.sh
```

これで、必要なドライバーはインストールされ無事ネットワークに繋がりました。

## 良かったこと

いやー、*Ryzen*は本当に早いです。コンパイルが爆速になりました。まぁ、前の*PC*の*CPU*が*Core i7 3700*だったり、メモリが*DDR3*というちょっと古い型だったということで比較対象に依る部分もあるでしょう。いずれにせよ快適で、このスペックで当分困らないことでしょう。*AMD*はソケットがそこまで頻繁に変わっていないという点も(間違っているかも)少し安心ですね。

## やりたいこと

冒頭では｢*Verilog*を書くためにこの*PC*を買った｣と言いましたが、それも含めていくつかこの*PC*でやりたいことはあります。

1. 自作*CPU*を作る
2. コンパイルに時間の掛かる*OSS*開発をする
3. システムプログラミング(ハードウェアへより直接的なアクセスをするプログラミング)をする

あと、この*PC*でやりたいことではないですが*dotfiles*を*macOS*と*Linux*で分けるのが面倒なので、合体させたいです。