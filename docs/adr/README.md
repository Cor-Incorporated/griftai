# Architecture Decision Records (ADR)

`griftai.org`（`Cor-Incorporated/griftai`）ランディングに関するアーキテクチャ決定の記録。

各 ADR は「背景／決定／理由／影響／代替案」フォーマット。2026-07-10 監査（`Cor_Grift_サイト刷新提案`）および Team Beta 方針を正本とする。

## 一覧

| ADR | タイトル | ステータス |
|---|---|---|
| [ADR-0001](./ADR-0001-product-stage-team-beta.md) | 製品ステージを Team Beta / Paid Trial / Estimate Audit とする | Accepted (2026-07-10) |
| [ADR-0002](./ADR-0002-cta-intent-and-cor-bridge.md) | CTA intent と Cor 橋渡し（環境変数） | Accepted (2026-07-10) |
| [ADR-0003](./ADR-0003-page-split-team-beta-estimate-audit.md) | `/team-beta/` と `/estimate-audit/` のページ分離 | Accepted (2026-07-10) |
| [ADR-0004](./ADR-0004-cross-repo-canon-reference.md) | クロスリポジトリ契約の正本参照 | Accepted (updated 2026-07-14) |

## intent・問い合わせ導線の正本（corsweb ADR-0013 / ADR-0014 が正本、本リポは参照）

| intent | 意味 | Grift LP CTA |
|---|---|---|
| `grift-team-beta` | Grift Team Beta | ✅ 使用 |
| `grift-paid-trial` | Grift Paid Trial | ✅ 使用 |
| `estimate-audit` | Estimate Audit | ✅ 使用 |
| `contract-dev` | 受託開発の相談（Cloudia→Grift 引継ぎは Phase 3 方針） | ❌ **使用しない**（ADR-0004） |
| `confidential-ai-assessment` | 機密データAI活用診断（Cor 側） | ❌ |
| `local-llm-poc` | ローカルLLM PoC（Cor 側） | ❌ |
| `press-speaking-other` | 取材・登壇・その他 | ❌ |

正本: [corsweb ADR-0013](https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0013-contact-consolidation-cloudia.md) / [corsweb ADR-0014](https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0014-intent-7keys-and-routing.md) / [corsweb ADR-0015](https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0015-cross-repo-adr-canon.md) / 本リポ参照: [ADR-0004](./ADR-0004-cross-repo-canon-reference.md)

## 運用

- ADR は `docs/adr/ADR-00xx-*.md` を Docs PR で追加・改訂する（`develop` 向け）。
- クロスリポジトリ契約の変更は corsweb 側で行い、本リポは参照リンクを追従する。
