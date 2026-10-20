# ADR-0005 Grift を CLI（OSS）＋紹介会社向けテスト導入として打ち出す

## ステータス: Proposed (2026-10-20)

## 背景
- Grift は 2026-02 に受託開発向けの Web見積アプリとして着手し、2026-08 に計測部分を CLI（`grift-cli`、MIT）に切り出した。2026-09 に旧Webアプリを停止し、人材紹介会社・SES の営業支援へ方針を変えた。
- LP には「AI見積支援ツール」、Team Beta / Paid Trial / Estimate Audit の価格、インテークワークスペースの画面、「ローカルLLM + クラウドAI」など、実態と逆の記述が残っていた（CLI は LLM を使わない決定論的な計測で、手元で完結する）。
- 代表の判断（2026-10-20）: 旧プランは取り下げて「個別案内」、正式版の価格は決まってから載せる。/team-beta・/estimate-audit はトップへ 301。GMO のコラムは納品分を反映して残す。売上は載せない。

## 決定
1. LP の正本メッセージを「経歴は盛れる。証拠は盛れない。」とし、Grift を「エンジニアのgit履歴から確かめられる事実を取り出すOSSのツール」と説明する。3つの約束（点数にしない／毎回同じ結果／どこにも送らない）を柱にする。
2. 対象は (a) 人材紹介会社・SES の営業、(b) エンジニア本人。CTA は「自社でテストしてみる」（Cor の AI 受付。ヘッダーは短く「テストしてみる」）と「GitHubでGrift CLIを見る」の2つ。
   - 紹介会社さま向けの取り組みは「テスト導入（PoC）」と呼ぶ。「試行」「試行を相談」は硬く、何をするのかが伝わりにくいので使わない（代表の指摘、2026-10-20）。
3. 料金: CLI は無償（MIT）。紹介会社さま向けのテスト導入（PoC）は個別案内。正式版は「2027年の提供開始を目指す」とだけ書き、金額は載せない。構造化データの Offer は CLI の無償（price 0）だけにする。
4. `/team-beta`・`/estimate-audit` は削除し、`public/_redirects` でトップへ 301。sitemap からも外す。
5. intent キーは契約（corsweb ADR-0014）どおり `grift-team-beta` を使い続け、意味を「Grift（CLI・テスト導入）の相談」に読み替える。`corCta` の別名は `griftTrial` だけにする（`grift-paid-trial` / `estimate-audit` は送らない）。
6. GMO のコラムは残す。Grift を見積ツールとして説明していた文は、Cor.株式会社の AI 受託開発・導入支援としての相談に書き換える（ツールを提供しているとは書かない）。社名は「Cor.株式会社」にそろえる。
7. LP に載せる CLI の事実（版・公開日・ライセンス・コマンド・指標名・117 リポジトリでの検証）は Cor-Incorporated/grift-cli の README・docs と PyPI に合わせ、`src/config/site.ts` の `griftCli` を唯一の出典にする。
8. Grift の思想を書いた記事（Qiita・note）へのリンクは `src/config/site.ts` の `griftArticles` にまとめ、トップ（3つの約束の下・「思想とコラム」・最後の CTA）・フッター・llms.txt から張る。
9. トップからの回遊のため、思想の記事と注目コラムをカード全体がリンクの「思想とコラム」（`#reading`）として開発の背景の直後（料金より前）に置き、ヘッダーにも「コラム」を置く。ヘッダーのリンクは 1024px 未満ではメニューにまとめる（768〜1023px で文字が折り返して崩れていたため）。
10. トップの「課題」の4枚のカードは、それぞれの場面を描いた「Griftのストーリー（架空の物語）」（`src/content/stories/*.md` → `/column/<id>/`）へカード全体でリンクする。物語であることは本文の前に必ず表示し（登場する人物・会社は実在しない、数値は説明のための例）、成果を保証する書き方や実在の利用者の声に見える書き方はしない。Grift の機能の説明は公開中の grift-cli の README・docs・norms に合わせる。
11. 1つの行き先しか持たないカード（料金・運営会社の選出と OSS 実績・ストーリー）は、カード全体を押せるようにする（代表の指摘「リンク範囲が狭い」、2026-10-20）。

## 影響
- ADR-0001（Team Beta / Paid Trial / Estimate Audit）と ADR-0003（/team-beta・/estimate-audit の分離）を Superseded にする。
- e2e smoke は新しい構成（CLI の使い方の例・旧プランが出ないこと）を検査する。`_redirects` は astro preview では効かないため、ルールを unit test で検査する。
- プライバシーポリシー・利用規約は旧サービス（見積支援・GitHub 実績分析・ベータ版）を前提にした記述が残っている。法務の確認を経て別途改訂する。

## 参照
- corsweb ADR-0022（HP 側の同日の更新）、ADR-0014（intent 契約）
- https://github.com/Cor-Incorporated/grift-cli ・ https://pypi.org/project/grift-cli/
