# Beta Launch Decisions

## 1. 固定する前提

2026-03-12 時点で、Grift のベータ LP に関して以下を固定する。

- ドメイン: `griftai.org`
- 正規 URL: `https://griftai.org`
- 表記: `Beta`
- 主要 CTA: Cor.inc 既存問い合わせ導線へ接続
- 問い合わせ先: `https://cor-jp.com/contact/chat`
- 会社導線: `https://cor-jp.com/`
- LP 内フォーム: 初期リリースでは設置しない
- フォーム拡張性: 後から自前フォームを差し込める構成で設計する
- pricing 表示: `Beta pricing` のみ

この判断は、ユーザー指定の Cloudflare 取得済みドメインと、Cor.inc の既存問い合わせ導線を優先する。

### 1.1 正規 URL を apex にする理由

SEO 上、`www` と apex のどちらが本質的に有利というより、canonical と 301 リダイレクトを一貫させることが重要である。  
今回は以下の理由で apex `griftai.org` を正規 URL とする。

- ブランド名として短く覚えやすい
- 口頭や営業資料で伝えやすい
- 初期 LP では情報量より指名アクセスが中心で、短い URL の方が有利

実装時は以下を必須にする。

- `https://www.griftai.org/*` → `https://griftai.org/*` へ 301
- canonical は常に apex
- sitemap / OGP / structured data も apex に統一

## 2. ベータ版としての現実的な見せ方

現在のリポジトリを見る限り、v2 は構想と API 契約が広く、実装はまだ限定的である。

確認できる内容:

- `packages/contracts/openapi.yaml`
  - Intake, Repository Intelligence, Estimation, Proposal, Handoff, Operational Intelligence まで契約は広く定義されている
- `services/control-api/cmd/server/main.go`
  - 実際に server に配線されているのは `healthz`, repository routes, velocity route が中心
- `services/control-api/internal/handler/repository.go`
  - repository list / detail / discover request のハンドラあり
- `services/control-api/internal/handler/velocity.go`
  - repository 単位の velocity 取得ハンドラあり
- `apps/web/src/pages/Dashboard.tsx`
  - 現 UI は最小の dashboard 表示のみ

このため、LP と pricing は「フル機能の一般提供」ではなく、「Repository Intelligence と見積 intelligence のベータアクセス」という表現に留めるのが妥当。

推奨表現:

- AI開発見積インテリジェンス Beta
- 招待制または審査制のベータアクセス
- 一部機能は順次解放

避ける表現:

- 完全提供済み
- 全機能利用可能
- 業務運用で即フル移行可能

## 3. ベータ pricing の考え方

### 3.1 前提

価格は「将来価値」だけでなく、以下 3 点のバランスで決める。

1. Primary persona が実際に払える金額
2. 現時点の機能成熟度
3. 将来の本価格へ上げやすい価格設計

Primary persona は、ソロ開発者と 1-10 人規模の AI 受託チームである。  
この層は、月額数十万円のツールには慎重だが、受注率や見積精度に直結するツールには月額 1-8 万円程度なら十分払いうる。

### 3.2 外部価格帯の参考

比較カテゴリは完全一致ではないが、近い意思決定予算を持つ周辺カテゴリとして以下を参照できる。

- Proposify
  - Basic `19 USD/user/mo`
  - Team `41 USD/user/mo` 年払い、`49 USD/user/mo` 月払い
  - Business はカスタム
- PandaDoc
  - Starter `19 USD/user/mo`
  - Business `49 USD/user/mo`
  - Enterprise は問い合わせ
- Linear
  - Business `16 USD/user/month`
  - Enterprise は問い合わせ
- GitHub Copilot
  - Business / Enterprise が組織向け区分
- Ignition
  - `AI Price Insights` という価格提案系 add-on を別料金で提供

上記から読み取れること:

- 小規模事業者向け SaaS の入口は `15-50 USD/seat/mo` が多い
- 高単価価値のある機能は `Business` 以上で demo / sales に寄せる
- 価格提案や営業成果に近い機能は add-on または上位プランに置かれやすい

参考:

- [Proposify Pricing](https://www.proposify.com/pricing)
- [PandaDoc Pricing](https://www.pandadoc.com/pricing/)
- [Linear Pricing](https://linear.app/pricing)
- [GitHub Copilot Plans](https://github.com/features/copilot/plans)
- [Ignition Pricing](https://www.ignitionapp.com/pricing)

### 3.3 Grift の推奨 beta pricing

ベータ初期は seat 課金より workspace 課金の方が適している。  
理由は、Primary persona が小規模チームであり、「何人使うか」より「この案件相談に使えるか」で判断するため。

#### Plan 1: Solo Beta

- `¥9,800 / month`
- 対象:
  - 個人
  - ソロ開発者
  - 見積の型化を始めたい人
- 含める内容:
  - 1 workspace
  - 1 user
  - 月 5 件までの案件作成
  - 基本ヒアリングテンプレート
  - GitHub repository analysis の基本表示
  - ベータ機能への先行アクセス
  - メールサポート

#### Plan 2: Studio Beta

- `¥29,800 / month`
- 対象:
  - 2-5 人規模の AI / Web 受託チーム
  - GitHub 実績を営業資産にしたい小規模法人
- 含める内容:
  - 1 workspace
  - 5 users まで
  - 月 20 件までの案件作成
  - GitHub / Repository Intelligence
  - Three-Way Proposal beta
  - 価格根拠のメモ / citation 付き提案モック
  - ベータ優先フィードバック枠
  - 優先サポート

#### Plan 3: Growth Beta

- `¥79,800 / month`
- 対象:
  - 受託比率が高い小規模開発会社
  - 提案標準化や承認フローまで見据えるチーム
- 含める内容:
  - 1 workspace
  - 10 users まで
  - 月 50 件までの案件作成
  - Studio Beta の全内容
  - 提案 / approval / handoff の優先提供対象
  - 導入オンボーディング
  - 月 1 回の運用レビュー

#### Plan 4: Enterprise

- `Contact Sales`
- 対象:
  - 複数部署
  - 高いセキュリティ要件
  - カスタム導入、運用支援、独自要件あり

含める候補:

- SSO / 権限設計
- カスタムデータ取り込み
- 価格ポリシー調整
- 導入支援
- SLA / 契約対応

### 3.4 なぜこの価格か

この価格帯は、以下の理由で妥当と判断する。

- ベータで UI とフル機能がまだ成熟していないため、初期価格は低く抑えるべき
- ただし「見積の質」と「受注単価」に効くカテゴリなので、無料に近づけすぎると価値が弱く見える
- Persona A は 1 件の安売り回避や失注防止で、月額 1-8 万円は十分回収可能
- `Enterprise` は機能要件と契約条件のばらつきが大きいため sales 送客が妥当

### 3.5 LP に出すべき注意書き

- すべて `Beta price`
- アルファテスター向けの無償または特別価格提供を行う場合あり
- 価格と提供機能はベータ期間中に変更される場合あり
- 一部機能は順次提供
- `Enterprise` は個別見積

## 4. 推奨 FAQ

FAQ は Persona A と Persona B の不安を潰す目的で設計する。

### Q1. Grift はどんなチーム向けですか？

小規模 AI 開発チーム、受託開発会社、ソロ開発者向けです。  
特に、曖昧な案件相談を仕様化し、見積根拠を持って提案したいチームに向いています。

### Q2. ベータ版では何が使えますか？

ベータ版では、案件整理、GitHub 実績の可視化、見積根拠づくりに関わる機能を順次提供します。  
一部の提案・承認・handoff 機能は、対象プランや提供タイミングが限定されます。

### Q3. 見積はどこまで信用できますか？

Grift は単一の AI 推定ではなく、GitHub 実績、案件情報、市場 evidence を組み合わせて見積根拠を作る設計です。  
ただし、ベータ版では最終判断は人間のレビューを前提にしてください。

### Q4. GitHub 連携は必須ですか？

必須ではありません。  
ただし、GitHub 実績を使うことで、自社の開発力を営業資料として示しやすくなります。

### Q5. 顧客データは学習に使われますか？

無断で学習利用する前提ではありません。  
tenant 分離と opt-in を前提に設計しており、cross-tenant benchmark も匿名化と同意条件を前提とします。

### Q6. どの市場向けですか？

初期ベータは日本市場を前提にしています。

### Q7. 発注側でも使えますか？

はい。  
発注側 PM / CTO が、ベンダー見積の妥当性確認や比較材料として使うケースも想定しています。

### Q8. 支払い方法は何ですか？

ベータ期間中は個別案内、または請求書ベースでの対応を前提にするのが安全です。  
本格的なセルフサーブ課金は一般提供時に検討します。

### Q9. Enterprise では何ができますか？

権限、導入支援、セキュリティ、運用要件、契約条件を含めた個別対応を想定しています。  
詳細は Cor.inc のAI受付から相談を受け付けます。

### Q10. 問い合わせ先はどこですか？

現時点では Cor.inc のAI受付へ集約します。
`https://cor-jp.com/contact/chat`

### Q11. LP から直接申し込みできますか？

初期リリースでは、LP 内フォームは設置しません。  
すべて Cor.inc のAI受付へご案内します。将来的に、ベータ登録フォームやデモ申込フォームを追加できるよう設計します。

## 5. Privacy / Terms のベース

### 5.1 Cor.inc サイトから拾える一次情報

Cor.inc の公開サイトから、以下は確認できる。

- 会社ミッションと事業内容
- 問い合わせ窓口
- 住所 / 電話番号
- 特定商取引法に基づく表記
- スペイン語版の privacy policy

確認ソース:

- [Cor.inc Home](https://cor-jp.com/)
- [Cor.inc About](https://cor-jp.com/about/)
- [Cor.inc AI受付](https://cor-jp.com/contact/chat)
- [Cor.inc Legal Notice](https://cor-jp.com/en/legal/tokushoho/)
- [Cor.inc Privacy (es)](https://cor-jp.com/es/privacy/)

### 5.2 LP 用 privacy page の方針

`/privacy` には、Cor.inc の既存姿勢を踏まえつつ、Grift 固有の記述を追加する。

最低限必要な記載:

- 事業者情報
- 収集する情報
- 利用目的
- お問い合わせへの利用
- アクセス解析
- Cookies
- GitHub 連携情報の扱い
- 提案 / 案件データの扱い
- tenant 分離に関する説明
- 匿名化 / opt-in 方針
- 問い合わせ窓口

### 5.3 LP 用 terms page の方針

`/terms` は Cor.inc の特商法表記と整合する形で作る。  
ただし、特商法表記そのものと、SaaS 利用規約は別文書として分けるべき。

最低限必要な記載:

- サービスの目的
- ベータ版であること
- 提供機能が変更される可能性
- 禁止事項
- アカウント / 連携情報の管理責任
- 知的財産
- 免責
- 契約終了 / 提供停止
- 準拠法 / 管轄

### 5.4 特商法ページは別で持つべきか

ベータで直課金を LP 上に載せるなら、`/legal/tokushoho` 相当のページを Grift 側にも持つ方が安全。  
ただし初期は Cor.inc の contact 経由で個別案内に寄せるため、優先度は `privacy` と `terms` より下げてよい。

## 6. griftai.org で実装前に追加で決めること

### 決めるべきこと

1. 英語ページを当面作るか
2. ブログを初回リリースで同時公開するか
3. 計測基盤を何にするか
4. OGP で何を見せるか
5. Cor ブランドと Grift ブランドの距離感をどこまで出すか

### 優先度高

- CTA 遷移先
- privacy / terms の本文作成
- ベータ申込導線の運用責任者

### 優先度中

- 記事 SEO の初期テーマ
- 英語化
- フォーム自前化

## 7. いまの推奨結論

- `griftai.org` で進めてよい
- 正規 URL は `https://griftai.org`
- LP 上は `Beta` 明記
- pricing は公開してよいが、「正式版価格」ではなく「beta pricing」にする
- `Solo / Studio / Growth / Enterprise` の 4 段で出す
- CTA は当面 `cor-jp.com/contact/chat` に集約
- `/privacy` と `/terms` は Cor.inc 公開情報をベースに Grift 向けへ起こす
- LP 本文では成果実績を盛らず、「仕組みの根拠」と「目指す価値」を中心に見せる

## 8. リポジトリ運用の推奨

この段階で LP を `BenevolentDirector` 本体から切り離し、独立 GitHub repository として開発する判断は妥当である。

理由:

- LP は本体プロダクトとリリース周期が違う
- ドメイン、SEO、法務、コピー、分析タグなど、Web マーケティング特有の変更が多い
- 本体 monorepo に混ぜると、契約やサービス実装の変更と衝突しやすい
- 低リスクの marketing repo として、別 issue / 別 PR で高速に回せる

推奨手順:

1. 新しい GitHub repository を作る
2. 現在の `grift-landing-blueprint` を初期コンテンツとして push する
3. README に目的、ドメイン、CTA、ベータ方針を書く
4. issue を分割して実装する
5. `main` 保護と preview deploy を設定する

推奨 issue の初期分割:

- `feat: bootstrap Astro from Virex`
- `feat: implement landing page content`
- `feat: add pricing page and beta pricing table`
- `feat: add FAQ page`
- `feat: add privacy page`
- `feat: add terms page`
- `feat: add Cor contact CTA wiring`
- `feat: add metadata, sitemap, robots, canonical`
- `feat: add analytics events`

### GitHub org について

公開検索では `Cor-Incorporated2` という GitHub organization / user は 2026-03-12 時点で確認できなかった。  
そのため、作成先は以下のどちらかを確認してから進めるべきである。

- `Cor-Incorporated`
- 別の新規 organization / personal account
