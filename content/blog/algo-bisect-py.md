---
title: "Pythonのbisectについて"  # 記事のタイトルを入力 / Enter your article title (日本語OK)
date: 2026-01-18T17:17:17+09:00
draft: false
type: "post"
tags: ["memo", "python", "algorithm", "bisect"]  # タグをカンマ区切りで追加 / Add tags (e.g. ["tech", "hugo"])
language: "ja"  # 言語を指定 / Language: "ja" or "en"
---

## TL;DR

- `bisect`はソート済み配列に対する二分探索を手軽に使える標準ライブラリ
- `bisect_left`と`bisect_right`で挿入位置の基準を使い分ける
- `insort`でソートを保ったままの挿入も簡単にできる

## bisectとは

`bisect`はソート済みリストに対して二分探索を行い、要素を挿入すべき位置を返すモジュール。自前で二分探索を書く手間を省ける。基本は以下の2つを覚えるだけで十分。

- `bisect_left(a, x)`はx以上が初めて出現する位置を返す
- `bisect_right(a, x)`はxより大きい値が初めて出現する位置を返す

同じ値が並ぶ場合の違いはここで決まる。`a = [1, 3, 3, 6]`なら、`x = 3`のときに`bisect_left`は1、`bisect_right`は3になる。

アルゴリズムとしてはどちらも二分探索で、比較条件だけが違う。`bisect_left`は「`a[mid] < x`なら右へ、そうでなければ左へ」を繰り返して`a[i] >= x`となる最小のiを探す。`bisect_right`は「`a[mid] <= x`なら右へ、そうでなければ左へ」を繰り返して`a[i] > x`となる最小のiを探す。

[ソースコード](https://github.com/python/cpython/blob/63cc1257db468a368d64c0b968d203a0f4c7303a/Lib/bisect.py)は次の通り。

<details>
<summary>bisect_leftの実装(標準ライブラリ)</summary>

```python
def bisect_left(a, x, lo=0, hi=None, *, key=None):
    """Return the index where to insert item x in list a, assuming a is sorted.

    The return value i is such that all e in a[:i] have e < x, and all e in
    a[i:] have e >= x.  So if x already appears in the list, a.insert(i, x) will
    insert just before the leftmost x already there.

    Optional args lo (default 0) and hi (default len(a)) bound the
    slice of a to be searched.

    A custom key function can be supplied to customize the sort order.
    """

    if lo < 0:
        raise ValueError('lo must be non-negative')
    if hi is None:
        hi = len(a)
    # Note, the comparison uses "<" to match the
    # __lt__() logic in list.sort() and in heapq.
    if key is None:
        while lo < hi:
            mid = (lo + hi) // 2
            if a[mid] < x:
                lo = mid + 1
            else:
                hi = mid
    else:
        while lo < hi:
            mid = (lo + hi) // 2
            if key(a[mid]) < x:
                lo = mid + 1
            else:
                hi = mid
    return lo


# Overwrite above definitions with a fast C implementation
try:
    from _bisect import *
except ImportError:
    pass
```

</details>

<details>
<summary>bisect_rightの実装(標準ライブラリ)</summary>

```python
def bisect_right(a, x, lo=0, hi=None, *, key=None):
    """Return the index where to insert item x in list a, assuming a is sorted.

    The return value i is such that all e in a[:i] have e <= x, and all e in
    a[i:] have e > x.  So if x already appears in the list, a.insert(i, x) will
    insert just after the rightmost x already there.

    Optional args lo (default 0) and hi (default len(a)) bound the
    slice of a to be searched.

    A custom key function can be supplied to customize the sort order.
    """

    if lo < 0:
        raise ValueError('lo must be non-negative')
    if hi is None:
        hi = len(a)
    # Note, the comparison uses "<" to match the
    # __lt__() logic in list.sort() and in heapq.
    if key is None:
        while lo < hi:
            mid = (lo + hi) // 2
            if x < a[mid]:
                hi = mid
            else:
                lo = mid + 1
    else:
        while lo < hi:
            mid = (lo + hi) // 2
            if x < key(a[mid]):
                hi = mid
            else:
                lo = mid + 1
    return lo
```

</details>

## 使い方の基本

まずはインデックスが返ってくる挙動を把握する。

```python
import bisect

a = [1, 3, 3, 6, 9]

# 二分探索で挿入位置を探す。
# bisect_left(a, x) は区間の中央の index を mid として「a[mid] < x なら右、
# そうでなければ左」を繰り返し、a[i] >= x となる最小の i を返す。
# bisect_right(a, x) は同様に「a[mid] <= x なら右、そうでなければ左」を繰り返し、
# a[i] > x となる最小の i を返す。
# 返る i は0始まりのインデックスで、a[i]の前に挿入する位置を表す
# 例えば i=1 は a[1] の前(つまり a[0] と a[1] の間)。

# x=3 のとき
# index: 0  1  2  3  4
# value: 1  3  3  6  9
# left :    ^ (i=1, 最初の 3 の前)
# right:          ^ (i=3, 2つの 3 の後)
print(bisect.bisect_left(a, 3))   # 挿入位置のインデックス(左端): 1
print(bisect.bisect_right(a, 3))  # 挿入位置のインデックス(右端): 3

# x=2 のとき
# index: 0  1  2  3  4
# value: 1  3  3  6  9
# left :    ^ (i=1, 1 と最初の 3 の間)
# right:    ^ (i=1, 1 と最初の 3 の間)
print(bisect.bisect_left(a, 2))   # 挿入位置のインデックス(左端): 1
print(bisect.bisect_right(a, 2))  # 挿入位置のインデックス(右端): 1
```

ここで返ってくるインデックスは「xを挿入したときに昇順が保たれる位置」を意味する。例えば`a[1]`の前に挿入すべきなら1が返る。

`3`はすでに2つあるので、左端の位置が1、右端の位置が3になる。`2`は存在しないので、入れられる場所はどちらも1。

## コーナーケース: 最小より小さい/最大より大きい

対象の値がリストの最小より小さい場合は0、最大より大きい場合は`len(a)`が返る。

```python
import bisect

a = [1, 3, 3, 6, 9]

print(bisect.bisect_left(a, 0))   # 0
print(bisect.bisect_right(a, 0))  # 0
print(bisect.bisect_left(a, 10))  # 5
print(bisect.bisect_right(a, 10)) # 5
```

どちらも「挿入して昇順が保たれる位置」なので、先頭なら0、末尾の次なら`len(a)`になる。

## 具体例1: 値が存在するかを高速に調べる

`bisect_left`で位置を求め、そこが範囲内かつ値が一致すれば存在すると判定できる。

```python
import bisect

def contains(a, x):
    i = bisect.bisect_left(a, x)
    return i < len(a) and a[i] == x

a = [2, 4, 6, 8, 10]
print(contains(a, 6))   # True
print(contains(a, 7))   # False
```

## 具体例2: スコアのランク分け

閾値の配列を用意して、`bisect_right`で区分を求める。

```python
import bisect

def grade(score, thresholds, labels):
    idx = bisect.bisect_right(thresholds, score)
    return labels[idx]

thresholds = [60, 70, 80, 90]  # 0-59, 60-69, 70-79, 80-89, 90-100
labels = ["F", "D", "C", "B", "A"]

print(grade(58, thresholds, labels))  # F
print(grade(70, thresholds, labels))  # C
print(grade(95, thresholds, labels))  # A
```

## 具体例3: ソート済みを保って挿入

`insort_left`や`insort_right`を使うと、挿入位置の探索と挿入をまとめて行える。

```python
import bisect

a = [1, 4, 7]
bisect.insort(a, 5)
print(a)  # [1, 4, 5, 7]
```

注意点として、`insort`は挿入時にリストの要素をずらすので、1回あたりO(n)のコストがかかる。大量挿入があるなら別のデータ構造も検討したい。

## 注意点

次に書かれているように`bisect_right`と`insort_right`はそれぞれ`bisect`、`insort`という別名が付いている。

```python
# Create aliases
bisect = bisect_right
insort = insort_right
```

つまり`insort`は「右端に挿入する`insort_right`の別名」で、同じ値がある場合は右側に追加される。

## まとめ

- `bisect_left`と`bisect_right`は挿入位置の境界を選べる
- 存在判定や区分の判定にそのまま使える
- `insort`で手軽にソート済みを維持できるがコストはO(n)

## References

- https://docs.python.org/ja/3/library/bisect.html
