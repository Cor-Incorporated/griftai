# LP ストーリーテリング & コンバージョン ベストプラクティス調査

> 調査日: 2026-03-12
> 目的: Grift ランディングページ再設計のためのベンチマーク資料

---

## 1. LP ストーリーテリング・フレームワーク比較

### 1-1. AIDA（Attention → Interest → Desire → Action）

最も古典的なフレームワーク。SaaS LP での適用:

| フェーズ | LP セクション | 役割 |
|----------|-------------|------|
| Attention | ヒーロー + ソーシャルプルーフ | 一瞬で「自分ごと」にさせる |
| Interest | ベネフィット + アウトカム提示 | 課題の解像度を上げる |
| Desire | 事例・導入実績・デモ | 「使いたい」と思わせる |
| Action | CTA + FAQ + 価格 | 行動障壁を下げて背中を押す |

**Grift 現状との対比**: 現LPは AIDA に近い流れだが、Interest → Desire の間に「感情の揺さぶり」が弱い。課題提示（Problem セクション）からソリューション提示が早すぎ、読者が「痛み」を十分に感じる前に解決策に移っている。

### 1-2. PAS（Problem → Agitation → Solution）

BtoB SaaS で最も効果的とされるフレームワーク。

- **Problem**: 読者の課題を言語化する（「あ、それ自分のことだ」）
- **Agitation**: その課題を放置するとどうなるかを描く（痛みの増幅）
- **Solution**: 課題の解決策として自社プロダクトを提示する

**Grift への示唆**: 現LPの「こんな悩みがある方へ」セクションは Problem は良い。しかし **Agitation（放置した場合の痛み）が完全に欠落** している。例えば「見積の属人化を放置すると、代表がボトルネックになり受注キャパが伸びない」「価格の根拠が曖昧なまま提案すると、値引き交渉で常に劣勢になる」といった agitation を挟むことで、ソリューションの価値が際立つ。

### 1-3. StoryBrand フレームワーク

Donald Miller が提唱。核心は **「顧客をヒーローにし、あなたのブランドはガイド役に徹する」**。

7 つの要素:
1. **キャラクター**（顧客）が何かを望んでいる
2. **問題**に直面している
3. **ガイド**（あなた）に出会う
4. ガイドが **プラン**を示す
5. **行動**を促す
6. **失敗**を避ける
7. **成功**に至る

**Grift への示唆**: 現LPは比較的 StoryBrand に近い構造を持っているが、以下が弱い:
- **ガイドとしての権威性**: Grift チームの実績・専門性が見えない（なぜ見積の課題を解決できるのか）
- **失敗の回避**: 「使わなかった場合にどうなるか」のセクションがない
- **成功のビジョン**: 導入後の具体的な変化が抽象的（数値や事例がない）

### 1-4. フレームワーク選定の推奨

Grift の現在のステージ（ベータ、実績少）では **PAS + StoryBrand のハイブリッド** が最適:

```
Problem（共感）
  → Agitation（放置コスト）
    → Guide Introduction（なぜ Grift が解決できるか）
      → Plan（具体的な使い方）
        → CTA（行動）
          → Failure Avoidance（使わない場合のリスク）
            → Success Vision（使った場合の変化）
```

---

## 2. 日本の BtoB SaaS LP で効くパターン

### 2-1. 才流の標準ワイヤーフレーム（業界標準）

才流（SAIRU）が公開している BtoB LP の標準構成は日本市場のデファクトスタンダード:

1. **ファーストビュー**: キャッチコピー + サービス概要 + CTA + 資料請求フォーム
2. **課題提起**: ターゲットの悩みを列挙
3. **解決策**: サービスがどう解決するか
4. **機能/特徴**: 具体的な機能ベネフィット
5. **導入実績/事例**: ロゴクラウド + ケーススタディ
6. **料金**: プラン比較
7. **FAQ**: 導入前の不安を解消
8. **CTA**: 最終アクション

**Grift 現状の評価**: 構成自体はこの型に沿っているが、以下が不足:
- ファーストビューに **フォームの露出がない**（才流型では FV に資料請求フォームを配置して CVR 向上）
- **導入実績/事例セクションが完全に欠落**（ベータでも「こういう相談を受けた」程度の定性的な実績は載せるべき）
- **数値がゼロ**（「導入○社」「平均○時間短縮」など、ベータでも仮説ベースの数値を出す方が信頼される）

### 2-2. 日本 BtoB LP の高 CVR パターン

調査で判明した日本市場特有のパターン:

| パターン | 説明 | CVR への影響 |
|----------|------|-------------|
| **FV フォーム埋め込み** | ファーストビューにフォームを直接配置 | 顕在層の即コンバージョンを逃さない |
| **ベネフィット > 機能** | 機能説明ではなく「導入後の成果」中心 | BtoB購買者の判断基準に合致 |
| **課題 → 解決のストーリー** | まず現状の悩みを提示し、解決への道筋を描く | 共感からの信頼構築 |
| **導入企業ロゴ** | 信頼性を視覚的に伝える | 初回訪問者の離脱率低下 |
| **文脈に合わせた中間 CTA** | セクション間に適切な CTA を配置 | 読了率に関係なくコンバージョン機会を確保 |
| **口語体 > 文語体** | 会話調のコピーの方が成約率が高い | 情景を浮かべやすく、感情を刺激する |

### 2-3. BtoB と BtoC のコピーの違い

| 軸 | BtoB | BtoC |
|----|------|------|
| 訴求の核 | **合理性 + 将来損失の回避** | 感情 + 即時獲得 |
| 意思決定 | 複数人（稟議プロセス） | 個人 |
| CTA の種類 | 資料請求、デモ申込、問い合わせ | 購入、無料登録 |
| コピーの長さ | 長め（論理的説明が必要） | 短め（感情的インパクト重視） |
| 信頼の構築 | 実績、数値、第三者評価 | レビュー、UGC |

---

## 3. 開発者ツール / AI プロダクトの LP デザインパターン

### 3-1. Evil Martians の 100 サイト調査（2025年）

Evil Martians が 100+ の開発者ツール LP を分析した結果、以下が判明:

**2 つの鉄則:**
1. **セールス臭を出さない**: 開発者は「売り込み」に敏感。Clever & Simple が勝つ
2. **クリーンなデザイン**: フラッシーなインタラクションより、しっかりしたタイポグラフィ、明快なレイアウト、適切な余白

**共通パターン:**
- **センタード・ヒーロー**: 太字の見出しを中央に配置 + 下にグラフィカル要素（安定感・信頼感）
- **実際の出力を見せる**: スクリーンショットよりインタラクティブデモや実際のアウトプット
- **インテグレーション表示**: 連携ロゴで成熟度とエコシステム適合性を示す
- **キュレーテッド・テスティモニアル**: 自動取得のツイートではなく、手動選定された推薦文
- **max-width コンテナ**: ほぼ全サイトが centered layout + max-width

**Grift への示唆**:
- 現LPのレイアウトは概ね良い（max-width、クリーンなデザイン）
- しかし **実際の出力（見積の例、ダッシュボードのスクリーンショット等）が皆無**
- テスティモニアルもない
- インテグレーション（GitHub 連携等）の視覚的表示がない

### 3-2. AI プロダクト LP の 9 ブロック・フレームワーク

AI サービスの高 CVR LP に共通する構成:

1. **Hero**: 価値提案を一言で。AI の場合「何が自動化されるか」ではなく「何が可能になるか」
2. **Pain**: ターゲットの痛み（AI なしでの現状）
3. **Solution**: AI がどう解決するか（技術ではなく結果に焦点）
4. **Benefits**: 具体的なベネフィット（時間短縮、精度向上、コスト削減など数値付き）
5. **Proof**: 社会的証明（導入事例、推薦文、メディア掲載）
6. **Pricing**: 明確な料金体系
7. **FAQ**: AI 特有の不安への回答（データセキュリティ、精度、人間の判断との関係）
8. **CTA**: 最終アクション
9. **Footer**: 会社情報、法的情報

**重要な統計:**
- 単一 CTA のページはクリック率が **371% 向上**
- パーソナライズされたページは **202% 高いコンバージョン**
- 動画はコンバージョンを **86% 向上** させる可能性
- LP 訪問の **83%** がモバイルから

---

## 4. 「AI っぽくない」コピーの書き方

### 4-1. AI 生成感を消す 7 つのテクニック

調査から判明した、人間らしいコピーを書くための実践的テクニック:

1. **会話調を使う**: 「Furthermore」「Moreover」のような接続詞を避け、自然な話し言葉に近づける
2. **文の長さを意図的に変える**: AI は均一な文長になりがち。短文と長文を意識的に混ぜる
3. **個人的な経験を入れる**: 「自分たちもフリーランス時代に同じ悩みを抱えていた」のような実体験
4. **VoC（Voice of Customer）を活用**: 顧客が実際に使う言葉でコピーを書く。Reddit、Twitter、インタビューから収集
5. **不完全さを残す**: AI は完璧な文章を作りがち。意図的に口語的な表現や言い淀みを残す
6. **過度に複雑な用語を避ける**: AI はジャーゴンを多用する傾向。シンプルで明確な言葉を選ぶ
7. **修辞的な問いかけ**: 読者に考えさせる問いを入れる（「そもそも、見積の"正解"って何でしょう？」）

### 4-2. Grift 現 LP のコピー評価

**良い点:**
- 「見積が、いつも特定の人の判断に寄ってしまう」← 具体的で共感しやすい
- 「夜に相談が来て、翌朝までに概算を返したい」← シナリオが具体的で、VoC に近い
- 全体的に口語体で書かれており、文語体の堅さがない
- 「いいえ。」から始まる FAQ の回答 ← 人間らしい断り方

**改善点:**
- 「曖昧な相談を、見積できる状態まで寄せる」← やや抽象的。もっと具体的なシーンを描ける
- 全体的に **トーンが均一** すぎる。感情の起伏が少なく、読み進める動機が弱い
- **数値がゼロ**: 「○分で」「○%の精度で」のような具体性がない
- **「寄せる」「揃える」「整える」** が多用されており、動詞のバリエーションが少ない（AI っぽく見える原因の一つ）
- 「最後の CTA」というラベル ← メタ的すぎる。ユーザー目線ではなく制作者目線

---

## 5. 日本特有の UX パターン（vs 西洋）

### 5-1. 情報密度

**最大の違い**: 日本のユーザーは情報量が多いページを好む傾向がある。

- **日本**: 多くの情報を最初から表示することが **透明性と信頼** のシグナルになる
- **西洋**: ホワイトスペースとミニマリズムが「洗練」のシグナル

しかし、最近の日本の SaaS LP（特にテック系）は西洋的なクリーンデザインに寄っている。Grift の現デザインはこのモダンな方向性で正しい。

### 5-2. 信頼構築の方法

| 要素 | 日本 | 西洋 |
|------|------|------|
| **信頼のシグナル** | 導入企業数、取引先ロゴ、受賞歴 | ユーザーレビュー、星評価 |
| **CTA の文言** | 控えめ（「まずは相談する」「資料を見る」） | 直接的（「Start Free Trial」「Buy Now」） |
| **料金表示** | 月額を強調（年額の割引は控えめ） | 年額を強調（割引率をアピール） |
| **FAQ の重要性** | 非常に高い（不安解消が購買の鍵） | 中程度（FAQ は補足的） |
| **色の意味** | 赤=積極性・ポジティブ | 赤=エラー・警告 |

### 5-3. スクロール vs クリック

日本のユーザーは **スクロールして追加情報にアクセスすることを好む**（別ページへのクリックよりも）。これは LP の構成に直結する:
- 長い 1 ページ LP が日本では特に有効
- 各セクション間のナビゲーションよりもスムーズなスクロール体験を重視
- ただしセクション間の **視覚的区切り** は明確にすべき

### 5-4. Grift への具体的示唆

- **1 ページ完結型を維持**: 日本ユーザーの行動パターンに合致
- **信頼要素を追加**: ロゴクラウド、導入数（ベータでも「○社に試験提供中」）
- **CTA は現行の控えめなトーンが適切**: 「自分たちの案件で使えるか相談する」は日本市場に合っている
- **「最後の CTA」ラベルを変更**: 制作者目線のメタ表現。「まずは気軽に」などに

---

## 6. 現 LP の改善提案（優先度順）

### P0: 即時対応すべき項目

1. **Agitation セクションの追加**: Problem → Solution の間に「放置した場合のコスト」を描く
   - 例: 「見積の属人化を続けると、代表が関与しなければ受注できない構造が固定化する」
   - 例: 「根拠のない概算を続けると、値下げ交渉で常に受け身になる」

2. **社会的証明の追加**: ベータでも載せられる内容
   - 「現在○社にベータ提供中」
   - 匿名でも良いので初期ユーザーの声（1-2件）
   - チームの実績・専門性（なぜこの課題を解決できるか）

3. **「最後の CTA」ラベルの修正**: メタ的すぎる。「次のステップ」「まずは気軽に」等に

### P1: 短期的な改善

4. **実際のアウトプットの可視化**: 見積レポートのサンプル、ダッシュボード UI のスクリーンショット等
5. **数値の追加**: 「見積作成にかかる時間を○%短縮」「○件の見積データを学習」等
6. **動詞のバリエーション改善**: 「寄せる」「揃える」「整える」の多用を解消
7. **中間 CTA の追加**: 課題セクション後、フローセクション後に文脈に合った CTA を配置

### P2: 中期的な改善

8. **インタラクティブデモ**: 実際に相談内容を入力して出力を見られるミニデモ
9. **ケーススタディ**: 匿名でも「こういう相談 → こう整理した → 結果どうなった」のストーリー
10. **ガイドとしての権威性**: チーム紹介、受託経験年数、処理した見積件数など
11. **Failure Avoidance セクション**: 「Grift を使わない場合」の将来像を控えめに描く

---

## 7. 参考にすべき LP の方向性

### 開発者ツール系で参考になるサイト

Evil Martians の調査で高評価だった LP の共通特徴:
- **Linear**: クリーンなデザイン + 実際の UI を見せる + 控えめだが確信に満ちたコピー
- **Supabase**: 技術的な信頼性 + コミュニティの強さ + インテグレーション表示
- **Vercel**: シンプルなヒーロー + 実績ロゴ + パフォーマンス数値

### 日本 BtoB SaaS で参考になる構成

- **才流の標準ワイヤーフレーム**: FV フォーム埋め込み + 課題 → 解決のストーリー
- **KARTE**: 長尺 LP + セクション間の視覚的区切り + 導入事例の厚み

---

## 8. ソース一覧

### 日本語ソース
- [ランディングページ制作 x 動線設計の極意 (DEAP)](https://deap.co.jp/column/c25131/)
- [売れるランディングページの共通点 (Break Marketing Program)](https://break-marketing-program.jp/blog/2025/05/31/landing-page-design/)
- [ストーリーテリングを活用すべき？ (Shopify Japan)](https://www.shopify.com/jp/blog/brand-storytelling)
- [成果につながる BtoB LP の構成 (KARTE Blocks)](https://blocks.karte.io/blog/landingpage_btob/)
- [BtoB 商材の LP 構成要素 (LeadNine)](https://leadnine.co.jp/media-btobmarketing/14195/)
- [BtoB 商材の LP 標準ワイヤーフレーム (才流)](https://sairu.co.jp/method/2683/)
- [SaaS 向け LP の作り方 (ロックビル)](https://rockvil.jp/blog/saas-lp-design-guide/)
- [BtoB で効果的な LP (HubSpot Japan)](https://blog.hubspot.jp/marketing/btob-lp)
- [心理学に基づく LP コピーライティング (REPRESENT)](https://represent.co.jp/psychologically-based-landing-page-copywriting-strategies/)
- [LP ライティング完全ガイド (ロックビル)](https://rockvil.jp/blog/lp-sales-copywriting/)
- [コピーライティングの原則 (アナグラム)](https://anagrams.jp/blog/8-types-of-copywriting/)
- [記事 LP とは？ (StockSun)](https://stock-sun.com/column/article_lp/)

### 英語ソース
- [100 Dev Tool Landing Pages Study (Evil Martians)](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)
- [Landing Page Storytelling (LinkBuildingHQ)](https://www.linkbuildinghq.com/blog/storytelling-for-high-converting-landing-page/)
- [High-Converting Landing Pages (Shopify)](https://www.shopify.com/blog/high-converting-landing-pages)
- [Landing Page Best Practices 2026 (Lovable)](https://lovable.dev/guides/landing-page-best-practices-convert)
- [SaaS Landing Pages 2026 (SaaS Hero)](https://www.saashero.net/design/enterprise-landing-page-design-2026/)
- [PAS Framework for SaaS (SaaS Funnel Lab)](https://www.saasfunnellab.com/essay/pas-copywriting-framework/)
- [StoryBrand Framework for LP (ChatterBuzz)](https://www.chatterbuzzmedia.com/blog/storybrand-framework-landing-page/)
- [AI Landing Pages Copy Templates (Digital Applied)](https://www.digitalapplied.com/blog/ai-landing-pages-copy-templates-convert-guide)
- [Japanese UX Design (Nitta)](https://ni-tta.github.io/uxinjapan.html)
- [How Japanese UX Differs (CRESTEC)](https://www.crestecusa.com/blog/how-japanese-ux-differs-fundamentally-from-what-you-may-think-is-best/)
- [Japanese UI/UX Design for SaaS (Nihonium)](https://nihonium.io/japanese-uiux-design-key-requirements-for-saas/)
- [US vs Japanese UX Design (btrax)](https://blog.btrax.com/american-japanese-ux-design/)
- [Write Better Than AI (CXL)](https://cxl.com/blog/write-better-than-ai/)
- [AI vs Human Copywriting (Perpetua)](https://copybyperpetua.co.uk/ai-vs-human-copywriting/)
- [Humanize AI Writing (Type.ai)](https://blog.type.ai/post/make-writing-sound-less-ai)
