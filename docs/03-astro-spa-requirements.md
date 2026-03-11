# Astro SPA Requirements

## 1. 目的

Astro ベースの LP を 1 ページ SPA として設計し、Grift の価値を以下の順で理解させる。

1. AI 開発の価格はブラックボックス化している
2. Grift はその価格決定を実績と市場証拠で透明化する
3. 小規模チームでも GitHub 実績を武器に提案できる
4. ヒアリングから仕様、見積、handoff まで一気通貫で扱える
5. 将来的に benchmark と学習ループを持つ intelligence product である

## 2. 成果指標

LP の成功条件は見た目ではなく、次の行動を増やせるかで測る。

- ベータ登録
- 問い合わせ送信
- デモ依頼
- CTA クリック率
- ヒーローから 50% スクロール到達率
- 「GitHub 実績」「市場 evidence」「Three-Way Proposal」セクションの滞在率

## 3. ターゲットユーザー

### Primary

- 日本の小規模 AI 受託チーム
- ソロ開発者
- 1-10 人規模の開発会社

### Secondary

- 発注側 PM
- CTO

## 4. ページの基本方針

### 4.1 SPA 方針

この LP は「Astro 製の 1 ページアプリケーション」とする。  
ただし、重いクライアントルーターを使う SPA ではなく、Astro の静的配信を基本とし、必要な箇所だけ islands 化する。

理由:

- LP は表示速度が最優先
- 情報取得中心であり、全体をクライアントレンダリングする合理性が薄い
- Astro の強みである低 JS 配信を維持したい

### 4.2 情報設計方針

ページ構造は「問題提起 → 解決方法 → 根拠 → 信頼 → CTA」の順にする。  
機能一覧から入らない。

### 4.3 デザイン方針

`ui-skills` に沿って、以下を守る。

- グラデーションを主役にしない
- 紫を使わない
- アクセントカラーは 1 つに絞る
- 見出しは強く、本文は読みやすく
- アニメーションは初期要件に含めない
- 情報量は多くても、理解の順序は単純にする

## 5. 推奨技術構成

- Astro
- TypeScript
- Tailwind CSS
- 必要最小限の island component
- フォーム計測用の analytics
- OGP / metadata / structured data

初期段階では、CMS やヘッドレス化は要件に含めない。  
コピーの変更頻度が上がるまで、静的コンテンツ管理で十分。

## 6. 必須ページ構成

初期リリースは 1 ページでよい。  
ただし、法務・信頼補完のために別ページは追加可能とする。

### 必須

- `/`

### 追加推奨

- `/privacy`
- `/terms`

## 7. `/` の必須セクション

### 7.1 Hero

目的:

- 価格の不透明さに対する怒りと共感を一文で掴む
- Grift が何をするシステムかを即理解させる

必須要素:

- 強いヘッドライン
- 1-2 文の説明
- Primary CTA
- Secondary CTA
- 補助コピー

### 7.2 Problem

目的:

- 現行の見積業務の歪みを可視化する

必須要素:

- 見積が営業トークと属人経験に依存していること
- 発注側にも受託側にも不利益があること
- AI 開発案件で特に価格ぶれが大きいこと

### 7.3 Solution

目的:

- Grift の仕組みを概念レベルで理解させる

必須要素:

- AI ヒアリング
- 要件整理
- GitHub 実績分析
- 市場 evidence
- 提案生成

### 7.4 Three-Way Proposal

目的:

- Grift の独自性を最も分かりやすく見せる

必須要素:

- 自社実績
- 市場相場
- 最終提案

視覚要件:

- 3 カラム比較
- 数字または帯グラフ表現
- 「なぜこの提案額になるか」が一目で分かる構成

### 7.5 GitHub Intelligence

目的:

- 小規模チームが最も反応する「実績で証明する」を見せる

必須要素:

- Velocity
- Repository analysis
- 類似案件の裏づけ
- 営業資料化のニュアンス

### 7.6 Market Evidence

目的:

- 相場根拠の説得力を見せる

必須要素:

- 複数ソース cross-validation
- citation / source-backed の表現
- 1 ソース依存ではないこと

### 7.7 Workflow

目的:

- 相談から handoff までを 1 本で見せる

順序:

1. ヒアリング
2. 仕様化
3. 見積
4. 承認
5. Handoff

### 7.8 Intelligence Loop

目的:

- Operational Intelligence の価値を非技術者にも伝える

必須要素:

- 見積と実績の差を記録する
- 次回見積に補正を返す
- 使うほど精度が上がる

### 7.9 Trust And Governance

目的:

- データ利用への不安を下げる

必須要素:

- tenant 分離
- raw text を横断利用しない
- 匿名 benchmark は opt-in 前提

### 7.10 CTA

目的:

- デモ or ベータ登録に収束させる

必須要素:

- 明確な 1 次 CTA
- 比較用の 2 次 CTA
- 抵抗の低い補助文

## 8. コンポーネント要件

### 必須コンポーネント

- Header
- Hero
- Section intro block
- Proof card
- 3-column comparison block
- Timeline block
- FAQ
- CTA form or CTA panel
- Footer

### 任意コンポーネント

- Sticky section nav
- Persona switcher
- Benchmark mock panel
- GitHub insight mock card

## 9. コンテンツ要件

### 9.1 必須メッセージ

- AI 開発の価格決定は不透明
- Grift は実績と市場証拠で適正価格を出す
- GitHub 実績を提案力に変える
- 見積だけでなく仕様化と handoff までつながる
- 学習ループで精度が上がる

### 9.2 使うべき証拠

- README の primary / secondary persona
- README の機能一覧
- `architecture-overview.md` の対象業務
- `adr-0002` の複数ソース evidence
- `adr-0004` のフィードバックループ
- `adr-0012` の匿名 benchmark と opt-in

### 9.3 抑えるべき技術表現

- Qwen3.5
- vLLM
- Pub/Sub
- BigQuery
- Cloud SQL

これらはセクション後半や FAQ に留める。  
ヒーローや直下で主役にしない。

## 10. UX 要件

- 3 秒以内に主張が理解できること
- スクロールだけで全体像が分かること
- 主要 CTA が常に見失われないこと
- モバイルでも Three-Way Proposal の意味が崩れないこと
- 文章量が多くても視線の迷子を作らないこと

## 11. SEO 要件

- タイトルに `AI開発 見積` または `AI受託 見積` を含める
- メタ description に `GitHub実績`, `市場相場`, `適正価格` を含める
- OGP は「価格の透明化」を一目で伝える
- FAQ schema を実装可能にする

## 12. 計測要件

- CTA click
- Form submit
- Section depth
- Hero impression
- Scroll depth
- Outbound click

イベント命名は後から分析しやすい粒度で固定する。

例:

- `cta_primary_clicked`
- `cta_secondary_clicked`
- `section_three_way_viewed`
- `faq_opened`
- `beta_form_submitted`

## 13. 非機能要件

- Lighthouse Performance 90+
- モバイルファースト
- アクセシブルな見出し構造
- 画像は最小限
- JS は islands 以外で極小化
- CLS を抑える

## 14. 実装前に決めるべき未確定事項

- CTA の最終目的地
- 実名の顧客事例を載せられるか
- GitHub 分析 UI のモックか実データか
- ベータ登録フォームの保存先
- LP を日本語単独で出すか、英語展開前提にするか

## 15. 推奨リリース順

1. Hero, Problem, Solution, Three-Way Proposal, CTA
2. GitHub Intelligence, Market Evidence, Workflow
3. Intelligence Loop, Trust, FAQ
4. 事例、実データ、比較表

最初から全部盛りにせず、価値提案の核を先に出す。
