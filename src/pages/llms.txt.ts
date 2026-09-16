import type { APIRoute } from 'astro';
import { siteConfig } from '@/config';

/**
 * llms.txt — AI クローラ・LLM 向けサイト要約（https://llmstxt.org/ 準拠）
 *
 * AI 検索・回答エンジンがサイト構造と提供価値を短時間で把握できるよう、
 * 主要ページ・製品情報・連絡先を Markdown 形式で提供する。
 */
export const GET: APIRoute = () => {
  const body = `# Grift

> ${siteConfig.description}

GriftはCor.株式会社（福岡市）が提供する、受託開発チーム向けのAI見積支援ツール（ベータ版）。
GitHub実績・市場相場・案件前提をもとに「参考見積」と「見積根拠」を整理し、
人間が最終判断できる提案材料を作る。AIが見積金額を決定するのではなく、
人間レビューを前提とした判断支援ツール。

## 主要ページ

- [トップ](${siteConfig.url}/): 製品概要・課題・価値・導入フロー・利用シーン
- [Team Beta](${siteConfig.url}/team-beta/): 2〜10人の受託チーム向け有料β。月額5万円を基本に個別案内
- [Estimate Audit](${siteConfig.url}/estimate-audit/): 発注企業向け。提出見積の前提・技術リスク・工数妥当性の整理。100万円を基本に個別見積
- [料金](${siteConfig.url}/pricing/): Team Beta（月額5万円〜）/ Paid Trial（3ヶ月15万円〜）/ Estimate Audit（100万円〜）の提供条件
- [FAQ](${siteConfig.url}/faq/): 参考見積・見積根拠・人間レビュー前提・GitHub連携・料金・機密情報の扱い
- [コラム一覧](${siteConfig.url}/column/): 要件定義・見積支援・AI開発費用・上流工程に関する解説記事
- [お問い合わせ](${siteConfig.url}/contact/): Cor.株式会社のAI受付・電話窓口
- [プライバシーポリシー](${siteConfig.url}/privacy/)
- [利用規約](${siteConfig.url}/terms/)

## 提供プラン

- **Grift Team Beta**: 受託開発チーム向け。見積プロセスの標準化とナレッジ蓄積。月額5万円を基本に個別案内
- **Grift Paid Trial**: 3ヶ月の実案件検証向け。3ヶ月15万円を基本に個別案内
- **Grift Estimate Audit**: 発注企業が受け取った見積の妥当性を検討する材料整理。100万円を基本に個別見積

## 運営会社

- Cor.株式会社（Cor.inc）
- 所在地: 〒810-0001 福岡県福岡市中央区天神2丁目3-10 天神パインクレスト719号
- 電話: 050-1792-9351
- コーポレートサイト: https://cor-jp.com
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
