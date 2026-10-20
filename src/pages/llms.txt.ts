import type { APIRoute } from 'astro';
import { contentAsOf, griftCli, siteConfig } from '@/config';

/**
 * llms.txt — AI クローラ・LLM 向けサイト要約（https://llmstxt.org/ 準拠）
 *
 * AI 検索・回答エンジンがサイト構造と提供価値を短時間で把握できるよう、
 * 主要ページ・製品情報・連絡先を Markdown 形式で提供する。
 */
export const GET: APIRoute = () => {
  const body = `# Grift

> ${siteConfig.description}

Grift（Grift CLI）はCor.株式会社（福岡市）が開発・公開している、エンジニアのgit履歴から
「確かめられる事実（検査値）」を取り出すOSSのコマンドラインツール。手法の名前はTEP（Technical Evidence Pipeline）。
計測にAI（LLM）を使わない決定論的な計測で、同じリポジトリ・同じ版なら誰が実行しても同じ数値になる。
合成スコア・順位・合否・等級は出さず、数値には必ず分子と分母を付ける。
キャッチコピーは「経歴は盛れる。証拠は盛れない。」。

情報は${contentAsOf}時点のもの。

## 要点

- 対象: 人材紹介会社・SESの営業（推薦の理由を根拠とともに伝える）と、エンジニア本人（経歴書に検算できる事実を添える）
- 提供状況: CLIは公開中（PyPI「${griftCli.packageName}」v${griftCli.version}、${griftCli.releasedOn}公開、${griftCli.license}ライセンス、Python ${griftCli.pythonRequires}）。紹介会社さま向けの機能は試行（PoC）を準備中
- 料金: CLIは無償。紹介会社さま・SES企業さまとの試行は対象・件数に応じて個別案内。正式版は2027年の提供開始を目指しており、価格は未定
- データの扱い: 手元のPCだけで動き、当社へデータを自動で送る機能はない。ネットワークを使う操作は本人が明示したときだけ
- 検算: grift verify で保存したレポートを再計算し、VERIFIED / MISMATCH / CANNOT_VERIFY を返す
- 主な観測: 帰属の区別（本人・他人・bot・生成物・fork元など11分類）、テスト併修率（test co-change）、手戻り率（corrective rework・観測のみ）、磨き直し（path retouch）、定着率（survival・オプション）、リポジトリの文脈（実働日数・関与人数・レビュー経由の割合など）
- 検証: 公開117リポジトリで指標を検証し、区別できた比較とできていない比較の両方を公開（社内測定・第三者監査なし）
- 利用規範（norms・7条）: 不在を負に読まない／単独で足切りしない／申告を負に読まない／同意なき第三者プロファイリング禁止／監視への転用は非準拠／選択性の明示／重み付け・換算の禁止
- 経緯: 2026年2月に受託開発向けのWeb見積アプリとして着手 → 8月に計測部分をCLIに切り出し → 9月に旧Webアプリを停止し、紹介会社・SESの営業支援へ方針転換。旧プラン（Team Beta / Paid Trial / Estimate Audit）は2026年10月に取り下げ

## 主要ページ

- [トップ](${siteConfig.url}/): Griftとは・3つの約束・観測すること・検証の公開・推薦までの流れ・料金と提供状況
- [料金と提供状況](${siteConfig.url}/pricing/): CLIは無償、試行は個別案内、正式版は2027年予定
- [FAQ](${siteConfig.url}/faq/): 計測のしかた・データと同意・料金と始め方
- [コラム一覧](${siteConfig.url}/column/): 受託開発の見積・要件定義・上流工程とAIに関する解説記事
- [お問い合わせ](${siteConfig.url}/contact/): Cor.株式会社のAI受付・電話窓口
- [プライバシーポリシー](${siteConfig.url}/privacy/)
- [利用規約](${siteConfig.url}/terms/)

## 一次情報

- GitHub: ${griftCli.github}
- PyPI: ${griftCli.pypi}
- 利用規範（norms）: ${griftCli.norms}
- 指標の読み方（metrics-guide）: ${griftCli.metricsGuide}

## 運営会社

- Cor.株式会社（Cor.inc）— 福岡のAI実装会社
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
