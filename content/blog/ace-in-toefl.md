---
title: "2025年夏最新版 TOEFL対策にAIをフル活用する方法" # 記事のタイトルを入力 / Enter your article title (日本語OK)
date: 2025-07-26T00:00:00+09:00
draft: false
type: "post"
tags: ["toefl", "test", "ai", "programming"] # タグをカンマ区切りで追加 / Add tags (e.g. ["tech", "hugo"])
language: "ja" # 言語を指定 / Language: "ja" or "en"
---

## TL;DR

<!-- 3行以内で記事の要点をまとめる / Summarize in 3 lines or less -->

- 会社は辞めないが研究がしたくなったので TOEFL を受けた
- AI をフル活用して対策をした
- 2025 年夏現在、無料で使えるサービスだと[Google AI Studio](https://aistudio.google.com/)がおすすめ

## Background

<!-- なぜこの記事を書いたか、背景や動機 / Why you wrote this, background and motivation -->

以前は[会社員に関する記事 1](../kaishain-is-boring)と[記事 2](../kaishain-is-exciting)を軽いトーンで書いたが、今回は真剣に TOEFL 対策について共有したい。

仕事をするのに突然飽きた際に退職後に研究をするというオプションがほしいと思った。日本の大学ならば金さえ出せば誰でも研究ができる。ただし、院試さえ突破できればだが。最近の院試では TOEFL のスコアの提出が求められるので、TOEFL の対策をすることにした。

ただ、正直言って日本の大学院の入試(not 大学院教育)で求められる英語のレベルは低い。開示の点数などを勘案すると某大学の某研究科は英語ではなく専門と数学しか見ていないので TOEFL は 50 点台でも受かる人はいる。私の場合は留学をしていたのでおそらく適当に受けても受かる。ただ半分留学していた証明として 100 点という 1 つの目標を定めた。(「いや低くない？」というツッコミありがとうございます)

## 最新の TOEFL 動向

<!-- メインコンテンツ、詳細な説明 / Main content and detailed explanation -->

まず TOEFL は純粋な英語力を測る試験ではなく、特定の形式で点数が取れるかを測る試験である。そのため、最近の傾向を把握することが重要だ。

### 形式

直近では Duolingo など安価でオンラインで受けられる他の英語試験に対応するために TOEFL も大きく形式を変えた。[^suisoku]昔はダミー問題と呼ばれる、回答結果が得点に関わらない問題が紛れ込んでいたが、現在(2025-07-28)は異なりすべての問題が得点に影響を与える。

[^suisoku]: ただの推測。集団カンニング問題が消えず、Home Edition もパンデミック以降定着したので、Duolingo のような安価でカジュアルに受けられるテストをより意識するように変化している。

#### 2025 年現在の TOEFL iBT 形式

| セクション | 問題数                        | 時間          | 内容                                     | 筆者の得点  |
| ---------- | ----------------------------- | ------------- | ---------------------------------------- | ----------- |
| Reading    | 20 問（2 パッセージ ×10 問）  | 36 分         | 学術的な長文読解                         | 30/30       |
| Listening  | 28 問（対話 2 題、講義 3 題） | 41 分         | 対話と講義の聴解                         | 27/30       |
| Speaking   | 4 問                          | 16 分         | 意見述べ、統合問題                       | 22/30       |
| Writing    | 2 問                          | 29 分         | 統合問題、アカデミック・ディスカッション | 21/30       |
| **合計**   | **54 問**                     | **約 2 時間** | -                                        | **100/120** |

#### 各セクションの詳細

**Reading（読解）**  
長文を 2 つ読まされる。それぞれ同じ形式で 10 問ずつ、計 20 問。対策してわかったが、普段から英文を読んでいれば特別な対策は不要だった。

**Listening（聴解）**  
対話形式が 2 題、講義形式が 3 題の計 5 題が出題される。対話形式の方が短い。集中力の維持が最大の課題で、気を抜くと話が終わっていることが多い。メモを取るとメモに集中してしまい、聞き逃すジレンマがある。今回は折衷案として、キーワードのみを書き留める方法を採用した。

**Speaking（口述）**  
4 題構成：

1. 独立問題：ある意見に対する自分の立場を述べる
2. 統合問題 1：提案文を読み、学生の会話を聞いて要約
3. 統合問題 2：概念説明を読み、具体例の講義を聞いて統合
4. 統合問題 3：講義を聞いて内容をまとめる

どれも形式が明確に決まっており自己採点が難しいため、練習を重ねれば慣れていく。ここの採点・添削に AI が活用できる。

**Writing（作文）**  
2 題構成：

1. 統合問題：文章を読み、それに関する講義（反論または賛成）を聞いて要約
2. アカデミック・ディスカッション：教授の質問に対する 2 人の学生の意見を踏まえて、自分の意見を述べる

![toefl](/images/toefl-w2.png)[^yt-toefl]

[^yt-toefl]: <https://www.youtube.com/watch?v=tEHmx27RgFE>からスクショ

これも形式が明確に決まっており自己採点が難しい。添削・採点に AI を活用した。

### 今後の形式変更について

<!-- 結論、学んだこと、次のステップ / Conclusion, lessons learned, next steps -->

前述した通り、今後はTOEFLの形式が大きく変更される。2025年5月から段階的に変更が始まり、2026年1月に全面改定される予定だ。

#### 2025年5月からの変更点

| 変更項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| Home Edition改善   | 訓練を受けた専門監督官による試験監督   |
| 本人確認システム   | AI技術（ENTRUST）による本人確認        |
| 登録・チェックイン | 手続きの簡素化                         |
| 試験会場の音響機器 | 高品質なヘッドセットへのアップグレード |

#### 2026年1月からの主要変更点

| 変更項目           | 現行形式          | 新形式                                                |
| ------------------ | ----------------- | ----------------------------------------------------- |
| **適応型テスト**   | 固定難易度        | Reading/Listeningで受験者の正答率に応じて難易度が変化 |
| **スコアシステム** | 0-120点（各30点） | 1-6段階評価（CEFRに準拠）+ 従来の0-120点も併記        |
| **スコア発表**     | 4-8日後           | 72時間以内                                            |
| **問題内容**       | アカデミック中心  | より現代的で文化的に公平なトピック                    |

#### 各セクションの変更詳細

**Reading セクション**
- アカデミックパッセージ：2つ（各700語）→1つ（200語）に短縮
- 問題数：20問（各10問）→5問に削減
- 新問題形式の追加：
  - "Complete the Words"：学術的な文章（70-100語）で10個の単語の一部を補完
  - "Read in Daily Life"：日常的な短文（15-150語）を読んで2-3問に回答

**Listening セクション**
- 音声の長さが大幅短縮（会話：3分→20-40秒、講義：6分→2分未満）
- 1つの音声あたりの問題数減少（5-6問→2-4問）
- トピックがより日常的に（食事、社会活動、エンターテインメントなど）
- 英語圏の多様なアクセント（北米、英国、豪州、NZ）

**Speaking セクション**
- 新しい問題形式の追加（単語の発音問題など）
- より実践的なコミュニケーション能力の評価

**Writing セクション**
- 統合問題（読解＋聴解）が廃止
- 新問題形式の追加：
  - "Build a Sentence"：バラバラの単語・フレーズを正しい文に並び替え
  - "Write an Email"：特定の状況に応じたメール作成（7分間）
- "Academic Discussion"問題は継続（名称変更のみ）

参考資料：
- [ETS公式発表](https://www.toefl-ibt.jp/release/20250530/)
- [トフレ！オンラインTOEFLテスト対策](https://tofure.com/blog/35317/)
- [Best Teacher Blog](https://www.best-teacher-inc.com/blog/toefl-2025-26-updates-v2)

<iframe width="560" height="315" src="https://www.youtube.com/embed/IbFLgzPDau0?si=JqBzIAQYIuny2-CN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

問題の形式は変わるが、結局新しい形式に対策をするだけなので、この記事で紹介したAI活用の方法論は引き続き有効だろう。

## AI の活用方法

ここからが本題である。まず、**予算が限られている場合は、過去問を ETS から購入することはおすすめしない**。インターネット上で TPO（TOEFL Practice Online）として無料で利用できる問題が多数存在し、予想問題まで含まれているからだ。詳しい方法は以下のサイトを参照してほしい。

<https://note.com/english_tsukasa/n/nfddf01beda19>

<details>
<summary>
無料でTOEFLの問題を利用することについて
</summary>
賛否両論あるのはわかる。個人的には留学や進学などに必要な試験を民間団体が行っており、収入など学力以外の差で試行回数が変わってくるのはおかしいと思っている。試験自体の支払いは拒否できないが、小市民として試験準備の支払いはガンガン拒否していこう。もちろん、添削の質や内容が良ければTOEFLの模擬試験を利用するのもありだ。しかし、模擬試験を受けてみたが、生成AIを使った添削の方が安価かつ質も高いと思ったので無用だと思う。
</details>

### ブックマークレットの活用

TPO の Speaking と Writing では問題の音声は`mp3`形式、自分の録音は`wav`形式でダウンロードされる。以下のブックマークレットを使うことで、問題を解いた後に音声をダウンロードできる。

**ブックマークレットの使い方：**

1. 以下のコードをブックマークバーにドラッグ＆ドロップ、またはブックマークとして登録
2. TPO で問題を解いた後、結果ページでブックマークレットをクリック
3. 音声ファイルが自動的にダウンロードされる
4. ダウンロードした音声を Google AI Studio にドラッグ＆ドロップ

#### 問題音声ダウンロード用:

```javascript
javascript: (async function () {
  const audio = document.querySelector('audio[src*=".mp3"]');
  if (audio && audio.src) {
    try {
      const response = await fetch(audio.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = audio.src.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(
        "ダウンロードに失敗しました: " +
          e.message
      );
    }
  } else {
    alert("MP3ファイルが見つかりませんでした");
  }
})();
```

#### 解答音声ダウンロード用:

```javascript
javascript: (async function () {
  const audio = document.querySelector("audio.js-record-audio");
  if (audio && audio.src) {
    try {
      const response = await fetch(audio.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = audio.src.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(
        "ダウンロードに失敗しました: " +
          e.message
      );
    }
  } else {
    alert("WAVファイルが見つかりませんでした");
  }
})();
```

### AI プロンプトの活用

問題文と Writing の場合は自身の解答をコピペし、採点・添削をするためのプロンプトを使用する。効果的なプロンプトを GitHub 上で公開している：

<https://github.com/diohabara/toefl>

**プロンプトの特徴：**

- TOEFL 採点基準に準拠した評価
- 具体的な改善点の提示
- 添削後の模範解答の提供
- スコアアップのための実践的アドバイス

### 具体例: Speaking の 1 問目に使う

Speaking の 1 問目、ある意見に対して自分の意見を述べさせられる問題で具体的にどのように解答・採点・添削を行うかを示す。

1. まずは問題に回答する
   - ![toefl-speaking-question](/images/tpo-s1-1.png)
2. その後解答ページに行く
   - ![toefl-speaking-answer](/images/tpo-s1-2.png)
3. 解答ページから問題文をコピペする

   ```text
   Question
   Imagine you have been offered two jobs in the same field with the same pay. One requires you to work by yourself, with little direct contact with other employees. The other requires you to work closely with a group of other employees. In which work environment do you think you would be more effective? Explain why.
   ```

4. ブックマークレットで解答をダウンロードする(今回は問題の読み上げのみなので解答のみ)
5. Google AI Studio に[先程の GitHub](https://github.com/diohabara/toefl)のプロンプト・問題文・音声を貼り付ける。イメージは次の通り
   - ![toefl-speaking-prompt](/images/tpo-s1-3.png)
6. 解答を元に改善に取り組む

全体像はこんな感じ:

![toefl-prompt-answer](/images/tpo-s1-4.png)

<details>
<summary>
テキストだとこんな感じ:
</summary>
TOEFL Speaking 採点・添削
1. スコアと総評

スコア: 2/4

総評:
質問には直接答えており、意見を支えるための理由を 2 つ挙げようとしている点は評価できます。しかし、発話の途切れや文法の誤りが多く、聞き手が内容を理解するのに少し努力が必要です。また、2 つ目の理由の論理展開が弱く、説得力に欠ける点が大きな課題です。全体的に、より流暢で論理的な回答を目指す必要があります。

2. 評価項目別の点数とコメント
   評価項目 点数 コメント
1. Delivery 2/4 全体的にゆっくりで、単語を探しながら話している印象です。特に「I... that... the...」のように、途中で言葉に詰まり、文の構成を立て直している箇所が目立ちます。発音は概ね理解できますが、よりスムーズな発話が求められます。
1. Language Use 2/4 基本的な文法構造を使おうとしていますが、「it save...」のような三単現の s の抜けや、文の途中で構成が崩れてしまうなど、不正確な部分が見られます。「negligible」という高度な語彙を使えている点は良いですが、全体的には語彙や表現の幅に限界が見られます。
1. Topic Development 2/4 1 つ目の理由（時間の節約）は具体的で分かりやすいです。しかし、2 つ目の理由（騒音を無視できる）の展開に問題があります。「高価なマンションを買えば防音できる」というのは、なぜその場所を「好む」のかという理由ではなく、デメリットへの「対処法」に過ぎません。そのため、主張の説得力が弱くなっています。
1. 良かった点

明確な意見提示: 冒頭で「I prefer to live in a place which is close to...」と、どちらの選択肢を好むかをはっきりと述べている点は素晴らしいです。

具体的な理由（1 つ目）: 「時間を節約できる」という理由を「ショッピング」という具体的な例で説明できており、非常に分かりやすかったです。

4. 改善すべき点

論理の一貫性: 2 つ目の理由が「その場所を好む直接的な理由」になっていませんでした。「騒音が気にならない性格だから」や「都会の活気ある雰囲気が好きだから」など、その場所の持つ特徴を肯定的に捉える理由を述べると、より説得力が増します。

文の流暢さと構成力: 文の途中で止まってしまったり、文法的に崩れたりする箇所を減らす練習が必要です。特に「but if I...」のように接続詞で文をつなぐ際に、その後の文の構造を素早く組み立てる練習が効果的です。

5. 具体的な改善提案

15 秒の準備時間で、以下のようなシンプルな構成を考える練習をしましょう。

意見: 便利な方を選ぶ。

理由 1: 時間の節約 → 例：買い物や通勤

理由 2: 活気があるのが好き → 例：エネルギッシュな雰囲気が良い

この構成に沿って話すことで、論理が明確になり、途中で言葉に詰まることも減ります。

6. 次回への実践的アドバイス

「理由＋簡単な具体例」のセットを 2 つ、時間内に確実に言い切る練習をしましょう。
完璧な長い文章を目指すより、短くても論理的で分かりやすい文章を 2 つ重ねる方が高得点に繋がります。今回の 2 つ目の理由のように、複雑で少し無理のある論理は避け、シンプルで直接的な理由を述べることを心がけてください。

7. あなたの回答（原文）
   Generated text
   I prefer to live in a place which is close to restaurants, shopping centers and a public transportation. There are two reasons for this.

First, it save... it saves a lot of time. It saves a lot of time. I often go shopping and it takes a lot of time, but if I live close to shopping centers, I... that... the amount of time will be reduced.

Second, I can ignore noises. If I purchase an expensive apartment, the apartment is... uh... the apartment can cut down the noise. So the noise problem will be negligible.

8. 添削後の回答
   Generated text
   I would definitely prefer to live in the place that is close to restaurants, shopping centers, and public transportation. I have two reasons for this.

First, it would save me a significant amount of time. For example, I enjoy shopping, but traveling to stores can be time-consuming. Living near commercial areas would mean I could get my errands done much more quickly.

Second, I actually enjoy the energetic atmosphere of a busy area. The sounds of the city make me feel connected and part of a vibrant community. For me, that lively feeling is much more desirable than complete quiet.
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Text
IGNORE_WHEN_COPYING_END 9. 変更箇所のハイライト
変更前 変更後 変更理由
I prefer to live in a place which is close to... I would definitely prefer to live in the place that is close to... which を that に、また仮定の話なので would prefer とすることで、より自然な表現にしました。
I often go shopping and it takes a lot of time, but if I live close to shopping centers, I... that... the amount of time will be reduced. For example, I enjoy shopping, but traveling to stores can be time-consuming. Living near commercial areas would mean I could get my errands done much more quickly. 元の文は途中で構成が崩れていました。文を一度区切り、より具体的で流暢な表現（time-consuming, get my errands done）に修正し、論理を明確にしました。
Second, I can ignore noises. If I purchase an expensive apartment... the noise problem will be negligible. Second, I actually enjoy the energetic atmosphere of a busy area. The sounds of the city make me feel connected and part of a vibrant community. 元の理由は「なぜ好きか」ではなく「どう問題を解決するか」でした。これを「活気のある雰囲気が好きだから」という直接的な好みの理由に変更し、Topic Development（内容展開）のスコアを向上させました。

</details>

## まとめ

この方法により、高額な対策コースを受講せずとも効果的に TOEFL スコアを向上させることができた。特に重要なポイントは：

1. **無料リソースの活用**：TPO を使った豊富な練習問題
2. **AI による即時フィードバック**：採点基準に基づいた客観的な評価
3. **継続的な練習**：形式に慣れることで確実にスコアアップ

最終的に 100/120 点を獲得でき、目標の 100 点をちょうど達成することができた。AI を活用した学習は、従来の方法と比べて効率的かつ経済的であることが実証された。
