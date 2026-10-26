# Architecture Decision Records (ADR)

`griftai.org`（`Cor-Incorporated/griftai`）ランディングに関するアーキテクチャ決定の記録。

各 ADR は「背景／決定／理由／影響／代替案」フォーマット。2026-07-10 監査（`Cor_Grift_サイト刷新提案`）および Team Beta 方針を正本とする。

## 一覧

| ADR | タイトル | ステータス |
|---|---|---|
| [ADR-0001](./ADR-0001-product-stage-team-beta.md) | 製品ステージを Team Beta / Paid Trial / Estimate Audit とする | Superseded by ADR-0005 (2026-10-20) |
| [ADR-0002](./ADR-0002-cta-intent-and-cor-bridge.md) | CTA intent と Cor 橋渡し（環境変数） | Accepted (2026-07-10) |
| [ADR-0003](./ADR-0003-page-split-team-beta-estimate-audit.md) | `/team-beta/` と `/estimate-audit/` のページ分離 | Superseded by ADR-0005 (2026-10-20) |
| [ADR-0004](./ADR-0004-cross-repo-canon-reference.md) | クロスリポジトリ契約の正本参照 | Accepted (2026-07-11) |
| [ADR-0005](./ADR-0005-grift-cli-pivot.md) | Grift を CLI（OSS）＋紹介会社向けテスト導入として打ち出す | Proposed (2026-10-20)。決定 2 のヒーローのボタンは ADR-0006 で改めた |
| [ADR-0006](./ADR-0006-lp-first-view-and-measurement.md) | LP の最初の画面と計測：離脱を減らし、問い合わせまでを数える | Proposed (2026-10-26) |

## intent 正本（corsweb ADR-0014 が正本 / 本リポは参照）

| intent | 意味 | Grift LP CTA |
|---|---|---|
| `grift-team-beta` | Grift の相談（2026-10 以降は CLI・紹介会社向けテスト導入、ADR-0005） | ✅ 使用 |
| `grift-paid-trial` | Grift Paid Trial（取り下げ） | ❌ 使用しない（ADR-0005） |
| `estimate-audit` | Estimate Audit（取り下げ） | ❌ 使用しない（ADR-0005） |
| `contract-dev` | 受託開発の相談（Cloudia→Grift テナント自動ハンドオフ） | ❌ **使用しない**（ADR-0004） |
| `confidential-ai-assessment` | 機密データAI活用診断（Cor 側） | ❌ |
| `local-llm-poc` | ローカルLLM PoC（Cor 側） | ❌ |
| `press-speaking-other` | 取材・登壇・その他 | ❌ |

正本: [corsweb ADR-0014](https://github.com/Cor-Incorporated/corsweb2024/blob/develop/docs/adr/ADR-0014-intent-7keys-and-routing.md) / 本リポ参照: [ADR-0004](./ADR-0004-cross-repo-canon-reference.md)

## 運用

- ADR は `docs/adr/ADR-00xx-*.md` を Docs PR で追加・改訂する（`develop` 向け）。
- クロスリポジトリ契約の変更は corsweb 側で行い、本リポは参照リンクを追従する。
