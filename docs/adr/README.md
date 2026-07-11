# Architecture Decision Records (ADR)

`griftai.org`（`Cor-Incorporated/griftai`）ランディングに関するアーキテクチャ決定の記録。

各 ADR は「背景／決定／理由／影響／代替案」フォーマット。2026-07-10 監査（`Cor_Grift_サイト刷新提案`）および Team Beta 方針を正本とする。

## 一覧

| ADR | タイトル | ステータス |
|---|---|---|
| [ADR-0001](./ADR-0001-product-stage-team-beta.md) | 製品ステージを Team Beta / Paid Trial / Estimate Audit とする | Accepted (2026-07-10) |
| [ADR-0002](./ADR-0002-cta-intent-and-cor-bridge.md) | CTA intent と Cor 橋渡し（環境変数） | Accepted (2026-07-10) |
| [ADR-0003](./ADR-0003-page-split-team-beta-estimate-audit.md) | `/team-beta/` と `/estimate-audit/` のページ分離 | Accepted (2026-07-10) |
| [ADR-0004](./ADR-0004-cross-repo-canon-reference.md) | クロスリポジトリ契約の正本参照 | Accepted (2026-07-11) |

## intent 正本（corsweb / Cloudia と共通）

| intent | 意味 |
|---|---|
| `grift-team-beta` | Grift Team Beta |
| `grift-paid-trial` | Grift Paid Trial |
| `estimate-audit` | Estimate Audit |
| `confidential-ai-assessment` | 機密データAI活用診断（Cor 側） |
| `local-llm-poc` | ローカルLLM PoC（Cor 側） |
| `press-speaking-other` | 取材・登壇・その他 |

## 運用

- ADR は `docs/adr/ADR-00xx-*.md` を Docs PR で追加・改訂する（`develop` 向け）。
