# ADR-0004 クロスリポジトリ契約の正本参照

## ステータス: Accepted (2026-07-11)

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
- 実装ガードとの対応: `src/lib/cor-cta.ts`（intent 生成）、`scripts/check-cta-hardcode.mjs`（ハードコード検査）、`scripts/check-forbidden-metrics.mjs` は正本 ADR の契約を機械的に担保する。

## 注意
- Grift LP の CTA が使う intent は `grift-team-beta` / `grift-paid-trial` / `estimate-audit` のみ。新キー `contract-dev` は Grift LP からは使用しない（corsweb ADR-0014）。

## 影響
- クロスリポジトリ契約の変更は corsweb 側 ADR の更新として行い、本リポジトリは参照リンクのみ追従する。
