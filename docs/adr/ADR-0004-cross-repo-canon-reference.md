# ADR-0004 クロスリポジトリ契約の正本参照

## ステータス: Accepted (2026-07-11、2026-07-14 更新)

## 背景
- Grift LP の CTA は corsweb（cor-jp.com）の問い合わせ導線へ intent 付き URL で接続する（ADR-0002）。
- intent キーの定義・導線設計・公開順序などのクロスリポジトリ契約が両リポジトリに分散すると、更新漏れ・食い違いが発生する。

## 決定
- クロスリポジトリ契約（intent キー正本・導線設計・公開順序）の**正本は corsweb** に置く（corsweb ADR-0015 の決定に従う）。
- 本リポジトリは以下の正本 ADR に従う。内容のコピーは置かない:
  - corsweb ADR-0010: intent/env/noindex 初版 — https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0010-cross-site-cta-env-and-intent.md
  - corsweb ADR-0013: 問い合わせ一極集中（Cloudia + workers/contact-chat） — https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0013-contact-consolidation-cloudia.md
  - corsweb ADR-0014: intent 7キー化（contract-dev 新設）とルーティング — https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0014-intent-7keys-and-routing.md
  - corsweb ADR-0015: 正本配置と参照方式 — https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0015-cross-repo-adr-canon.md
  - corsweb ADR-0016: CloudiaからGrift公開相談セッションへの引継ぎ — https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0016-cloudia-grift-customer-session-handoff.md
- 実装ガードとの対応: `src/lib/cor-cta.ts`（intent 生成）、`scripts/check-cta-hardcode.mjs`（ハードコード検査）、`scripts/check-forbidden-metrics.mjs`、`e2e/smoke.spec.ts`（全主要 CTA の契約検査）は正本 ADR の契約を機械的に担保する。

## 注意
- Grift LP の CTA が使う intent は `grift-team-beta` / `grift-paid-trial` / `estimate-audit` のみ。
- `contract-dev` は Cor. サイトの受託開発相談専用である。CloudiaからGriftへの公開相談セッション引継ぎはcorsweb ADR-0016を正本とし、Issue・PR・Preview・UATの状態は決定そのものと分離する。
- Grift LP は `contract-dev` を生成せず、contact-chat WorkerやGrift内部APIを直接呼び出さない。製品CTAはproductionで `https://cor-jp.com/contact/chat/`、Previewで正本が固定したCloudia Pages Previewを入口とし、既存3 intent・source・localeを渡す。
- Cloudia障害時の既存フォームfallbackはcorsweb側で維持する。LPがfallback URLや内部handoffを独自実装しない。
- 公開相談セッション引継ぎの実装状況は corsweb issue #259（https://github.com/Cor-Incorporated/corsweb2024/issues/259）で追跡する。Issue は正本 ADR ではない。

## 影響
- クロスリポジトリ契約の変更は corsweb 側 ADR の更新として行い、本リポジトリは参照リンクのみ追従する。
