import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import {
  contentAsOf,
  griftArticles,
  griftCli,
  siteConfig,
  tepCliText,
  tepComparisonSummary,
  tepComparisons,
  tepFacts,
  tepLabel,
  tepObservationGroups,
  tepTerms,
} from '@/config';

/**
 * llms.txt — AI クローラ・LLM 向けサイト要約（https://llmstxt.org/ 準拠）
 *
 * AI 検索・回答エンジンがサイト構造と提供価値を短時間で把握できるよう、
 * 主要ページ・製品情報・連絡先を Markdown 形式で提供する。
 */
export const GET: APIRoute = async () => {
  const stories: CollectionEntry<'stories'>[] = (await getCollection('stories')).sort(
    (a: CollectionEntry<'stories'>, b: CollectionEntry<'stories'>) => a.data.order - b.data.order
  );
  // 観測と用語の対応は config/tep.ts から作る（/tep/ とトップの「観測すること」と同じ言葉）。
  const observations = tepObservationGroups
    .flatMap((group) => group.observations)
    .map((item) => tepLabel(item))
    .join('、');
  const body = `# Grift

> ${siteConfig.description}

Grift（Grift CLI）はCor.株式会社（福岡市）が開発・公開している、エンジニアのgit履歴から
「確かめられる事実（検査値）」を取り出すOSSのコマンドラインツール。手法の名前はTEP（Technical Evidence Pipeline）で、
何を見て、どう扱い、何をしないかは ${siteConfig.url}/tep/ にまとめている。
計測にAI（LLM）を使わず、同じリポジトリ・同じ版なら誰が何度実行しても同じ数値になる（決定論的な計測）。
1つにまとめた点数（合成スコア）・順位・合否・等級は出さず、数値には必ず「何件のうち何件か」（分子と分母）を付ける。
キャッチコピーは「経歴は盛れる。証拠は盛れない。」。

情報は${contentAsOf}時点のもの。

## 要点

- 対象: 人材紹介会社・SESの営業（推薦の理由を根拠とともに伝える）、自社開発企業の採用担当（候補者本人が共有した記録から、どんな仕事をしてきたかを確かめる）、エンジニア本人（経歴書に検算できる事実を添える）
- 提供状況: CLIは公開中（PyPI「${griftCli.packageName}」v${griftCli.version}、${griftCli.releasedOn}公開、${griftCli.license}ライセンス、Python ${griftCli.pythonRequires}）。紹介会社さま向けの機能はテスト導入（PoC）を準備中
- 料金: CLIは無償。紹介会社さま・SES企業さま・自社開発企業さまのテスト導入は対象・件数に応じて個別案内。正式版は2027年の提供開始を目指しており、価格は未定
- データの扱い: 手元のPCだけで動き、当社へデータを自動で送る機能はない。ネットワークを使う操作は本人が明示したときだけ
- 検算: grift verify で保存したレポートを再計算し、VERIFIED / MISMATCH / CANNOT_VERIFY を返す
- 主な観測: ${observations}。関わり方は本人の同意が記録されているときだけ出す。手戻り率と磨き直しは傾向の記録で合否に使わない。コードの新しさは指定したときだけ出し、いまのコードの行が書かれてからの新しさを表す指数で、${tepFacts.survivalTauDays}日後に残った行の割合ではない。どれも「何件のうち何件か」付きで、職種や能力の判定ではない。CLIの出力での名前は下の「用語の対応」
- レポートの先頭の文と問い: grift actor・grift project・grift align のレポートの先頭に、記録から見える仕事の進め方（変えた部分の区分・変更のペース・テストの付け方・関わり方）を、件数と期間を添えた短い文で書き、この記録では見えないことと、面談で確かめたいことの問いを続ける。文は公開した決定表で数字から選び、AIは使わない。人についての文と問いは、本人が名乗ったIDに同意の記録があるときだけ出し、それ以外は出していない理由を1文で書く。複数の人をまとめて出す一覧には文を出さない
- 案件側の宣言との並び: 案件で求める作業の区分・テストの種類・変更のペースなどを案件側が項目ごとに書き出し（grift project）、grift align が候補者の記録と項目ごとに並べる。並びは${tepComparisonSummary}で、総合点・順位・合否・推薦は計算しない。本人が名乗ったIDに同意の記録があるときだけ、面談で確かめたいことを問いの形で添える。grift align --team は要求を満たす人数だけを出し、${tepFacts.minTeamSize}人未満のチームでは集計しない
- 検証: 公開117リポジトリで指標を検証し、区別できた比較とできていない比較の両方を公開（社内測定・第三者監査なし）
- 利用規範（norms・7条）: 不在を負に読まない／単独で足切りしない／申告を負に読まない／同意なき第三者プロファイリング禁止／監視への転用は非準拠／選択性の明示／重み付け・換算の禁止
- 経緯: 2026年2月に受託開発向けのWeb見積アプリとして着手 → 8月に計測部分をCLIに切り出し → 9月に旧Webアプリを停止し、紹介会社・SESの営業支援へ方針転換。旧プラン（Team Beta / Paid Trial / Estimate Audit）は2026年10月に取り下げ

## 主要ページ

- [トップ](${siteConfig.url}/): Griftとは・3つの約束・観測すること・検証の公開・推薦までの流れ・料金と提供状況
- [TEPとは](${siteConfig.url}/tep/): TEPを作った理由・TEPが見るもの・数え方の決まり・しないこと・自己申告の診断との違い・案件側とエンジニア側の使い方・用語の対応表
- [料金と提供状況](${siteConfig.url}/pricing/): CLIは無償、テスト導入は個別案内、正式版は2027年の提供開始を目指す
- [FAQ](${siteConfig.url}/faq/): 計測のしかた・データと同意・料金と始め方
- [コラム一覧](${siteConfig.url}/column/): Griftのストーリー（架空の物語）と、受託開発の見積・要件定義・上流工程とAIに関する解説記事
- [お問い合わせ](${siteConfig.url}/contact/): Cor.株式会社のAI受付・電話窓口
- [プライバシーポリシー](${siteConfig.url}/privacy/)
- [利用規約](${siteConfig.url}/terms/)

## Griftのストーリー（架空の物語）

よくある場面をもとにした架空の物語。登場する人物・会社は実在せず、物語の中の数値は説明のための例。

${stories.map((story) => `- [${story.data.title}](${siteConfig.url}/column/${story.id}/): ${story.data.who}「${story.data.problem}」`).join('\n')}

## 用語の対応（サイトの言葉とCLIの言葉）

サイトの用語と、やさしい言い方と、CLI の出力・文書（metrics-guide）での名前の対応。${siteConfig.url}/tep/ の対応表と同じ。
テスト併修率は metrics-guide では「テスト同期変更率」とも書く。

| サイトの用語 | やさしい言い方 | CLI |
|---|---|---|
${tepTerms.map((term) => `| ${term.site} | ${term.plain} | ${tepCliText(term)} |`).join('\n')}

並びの${tepComparisons.length}通り（grift align の comparison）: ${tepComparisons.map((item) => `${item.site}（${item.cli}）`).join('、')}

## 一次情報

- GitHub: ${griftCli.github}
- PyPI: ${griftCli.pypi}
- 利用規範（norms）: ${griftCli.norms}
- 指標の読み方（metrics-guide）: ${griftCli.metricsGuide}
${griftArticles.map((article) => `- Griftの思想（${article.platform}・代表 ${article.author}）: ${article.url}`).join('\n')}

## 運営会社

- Cor.株式会社（Cor.inc）: 福岡のAI実装会社
- 所在地: 〒810-0001 福岡県福岡市中央区天神2丁目3-10 天神パインクレスト719号
- 電話: 050-1792-9351（AI受付の電話窓口）
- コーポレートサイト: https://cor-jp.com
- 会社概要: https://cor-jp.com/company/
- 情報セキュリティ: 2026年10月にISO/IEC 27001（ISMS）の第2段階審査を終了。2026年12月ごろの認証登録見込み（登録前のため「取得済み」ではない）
- 福岡を代表する企業100選 2026-2027 に選出
- 相談窓口: ${siteConfig.url}/contact/ 経由のAI受付

## コラム（解説記事）

- [AIを活用した要件定義ツールで属人化を防ぐ](${siteConfig.url}/ai-tool-requirement-definition/)
- [要件定義プロセスの自動化ステップ](${siteConfig.url}/automation-tool-requirement/)
- [AI開発の見積もり費用はどう決まる？](${siteConfig.url}/cost-ai-develop-estimate/)
- [AI開発の相場とは？](${siteConfig.url}/market-price-ai-develop/)
- [AI開発の見積もりを自動化する仕組み](${siteConfig.url}/automation-ai-develop-estimate/)
- [見積もり自動化をAIで実現する役割分担](${siteConfig.url}/ai-estimate-automation/)
- [見積もり作成を自動化するドキュメント構成](${siteConfig.url}/create-estimate-automation/)
- [自動化ツールで出した見積もりの根拠](${siteConfig.url}/basis-estimate-automation/)
- [要件定義にAIを導入する理由と体制づくり](${siteConfig.url}/requirement-definition-ai/)
- [上流工程を効率化するAIツールの選定基準](${siteConfig.url}/tool-upstream-process-ai/)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
