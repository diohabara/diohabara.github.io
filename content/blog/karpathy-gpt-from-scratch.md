---
title: Karpathyの「GPTを200行で実装する」を読み解く
date: 2026-02-22T00:00:00+09:00
draft: false
type: post
tags:
  - machine-learning
  - python
  - transformer
  - gpt
language: ja
description: Andrej Karpathyが公開した200行のPure Python GPT実装を、コンポーネントごとに分解して解説する。
---

## はじめに

Andrej Karpathyが2025年6月に公開したGistは、GPT（Generative Pre-trained Transformer）の訓練と推論を**依存なしのPure Python 200行**で実装したものだ。PyTorchもNumPyも使わない。すべてが`math`と`random`だけで動く。

https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95

冒頭のコメントが本質を突いている。「This file is the complete algorithm. Everything else is just efficiency.」つまり、普段我々がPyTorchやJAXで書いている何千行ものコードの中で、**アルゴリズムそのもの**はたったこれだけだということだ。

この記事では、このGistを上から順に追いながら、各コンポーネントが何をしているのかを解説する。

## データセットとトークナイザー

コードはまず`names.txt`（人名のリスト）をダウンロードし、文字単位のトークナイザーを構築する。

```python
uchars = sorted(set(''.join(docs)))  # 全ユニーク文字がトークンになる
BOS = len(uchars)  # BOS (Beginning of Sequence) トークン
vocab_size = len(uchars) + 1
```

ここでのポイントは、BPE[^bpe]のような複雑なトークナイザーを使わず、**1文字 = 1トークン**という最小構成にしていることだ。アルファベット26文字 + 特殊文字で `vocab_size` は27程度になる。

[^bpe]: Byte Pair Encoding。GPT-2以降で標準的に使われるサブワードトークナイゼーション手法。

## Autograd: 自動微分エンジン

次に登場する`Value`クラスが、このコード全体の土台となる自動微分エンジンだ。

```python
class Value:
    def __init__(self, data, children=(), local_grads=()):
        self.data = data          # スカラー値
        self.grad = 0             # 損失に対するこのノードの勾配
        self._children = children # 計算グラフ上の子ノード
        self._local_grads = local_grads  # 局所勾配
```

`Value`は四則演算をオーバーロードしており、普通のPython式を書くだけで計算グラフが構築される。例えば `a * b + c` と書くと、`__mul__`と`__add__`が呼ばれて、裏で木構造が作られる。

`backward()`メソッドはトポロジカルソートで計算グラフを逆順に辿り、連鎖律（chain rule）で各パラメータの勾配を計算する。PyTorchの`loss.backward()`と同じことを、50行ほどで実現している。

## Transformerアーキテクチャ

パラメータの初期化部分を見てみる。

```python
n_layer = 1       # Transformer の層数
n_embd = 16       # 埋め込み次元
block_size = 16   # 最大コンテキスト長
n_head = 4        # アテンションヘッド数
head_dim = n_embd // n_head  # ヘッドあたりの次元 = 4
```

GPT-2は `n_layer=12, n_embd=768, n_head=12` だが、ここではミニチュア版として`16次元、1層、4ヘッド`で構成されている。人名生成というタスクには十分なサイズだ。

`state_dict`にはトークン埋め込み（`wte`）、位置埋め込み（`wpe`）、各層のAttentionとMLPの重み、そして最終出力層（`lm_head`）が格納される。

## GPTのフォワードパス

`gpt()`関数がモデルの本体だ。入力は1つのトークンIDと位置IDで、出力は次トークンの確率分布（logits）。

処理の流れ:

1. **埋め込み**: トークン埋め込みと位置埋め込みを足し合わせる
2. **RMSNorm**: 正規化（LayerNormの代わりにRMSNorm[^rmsnorm]を使用）
3. **Multi-Head Attention**: Q, K, Vを計算し、ドット積アテンションを実行
4. **残差結合**: アテンション出力を入力に足す
5. **MLP**: 2層のフィードフォワードネットワーク（ReLU活性化）
6. **残差結合**: MLP出力を入力に足す
7. **出力**: `lm_head`で語彙サイズのlogitsに変換

[^rmsnorm]: Root Mean Square Normalization。LayerNormから平均の引き算を省略した簡略版で、LLaMAなど最近のモデルで採用されている。

```python
def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]
```

このRMSNormは実質3行だ。ベクトルの二乗平均を取って、その逆数をスケールとして掛けるだけ。

## アテンション機構

Multi-Head Attentionの核心部分を見てみよう。

```python
attn_logits = [
    sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5
    for t in range(len(k_h))
]
attn_weights = softmax(attn_logits)
head_out = [
    sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h)))
    for j in range(head_dim)
]
```

行列演算ライブラリなしでやっているため、ドット積もsoftmaxもforループで書かれている。`head_dim**0.5`で割るのは「Scaled Dot-Product Attention」のスケーリングで、これがないとアテンションのlogitsが大きくなりすぎてsoftmaxが飽和する。

KV Cache[^kvcache]の仕組みもここに見える。`keys`と`values`のリストに過去のK, Vを蓄積していくことで、推論時に再計算を避けている。

[^kvcache]: Key-Value Cache。推論時に過去のトークンのKey, Valueを保存しておくことで、各ステップで全トークンを再計算せずに済む最適化手法。

## 訓練ループとAdamオプティマイザ

```python
learning_rate, beta1, beta2, eps_adam = 0.01, 0.85, 0.99, 1e-8
```

訓練ループは1000ステップで、各ステップで1つの名前（ドキュメント）を処理する。損失関数はクロスエントロピー（`-log(prob[target])`）の平均だ。

Adamオプティマイザの更新式も明示的に書かれている。一次モーメント（移動平均）と二次モーメント（二乗勾配の移動平均）を使ってパラメータを更新し、学習率は線形に減衰させている。

## 推論

最後に、訓練済みモデルで新しい名前を生成する。

```python
temperature = 0.5
```

`temperature`は生成の「創造性」を制御するパラメータだ。logitsを`temperature`で割ってからsoftmaxを取ることで、低い値ほど確率分布が尖り（高確率トークンが選ばれやすくなり）、高い値ほど平坦になる（ランダム性が増す）。

## このコードから学べること

1. **Transformerは本質的にシンプル**: 埋め込み → アテンション → MLP → 出力、の繰り返しに過ぎない
2. **自動微分は連鎖律の再帰的適用**: `backward()`の実装は30行もない
3. **GPUやPyTorchは効率のためのもの**: アルゴリズム自体は標準ライブラリだけで記述できる
4. **スケーリングが全て**: 同じアーキテクチャを巨大なデータと計算資源で訓練すると、ChatGPTになる
