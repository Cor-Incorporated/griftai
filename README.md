# Grift Landing Blueprint

このリポジトリは、`BenevolentDirector` 内の README / `docs/v2` / 各 service README を根拠に、Grift のランディングページを設計するためのドキュメント集です。

目的は 3 つです。

1. 既存ドキュメントから「誰のための、何を解決するシステムか」を抽出する
2. 抽出結果を LP のポジショニング、情報設計、訴求に変換する
3. Astro ベースの SPA を作るための要件を、実装前に固定する

## Deliverables

- `docs/01-source-extraction.md`
  - 既存ドキュメントから抽出した事実、価値提案、ターゲット、差別化要因
- `docs/02-persona-positioning.md`
  - 想定ペルソナ、JTBD、刺さる論点、避けるべき訴求
- `docs/03-astro-spa-requirements.md`
  - Astro ベース SPA の要件定義、情報設計、機能要件、非機能要件
- `docs/04-content-strategy.md`
  - どんなコピーを書けば刺さるか、各セクションで何を言うべきか
- `docs/05-beta-launch-decisions.md`
  - `griftai.org` 前提の beta pricing、FAQ、法務ページ方針、CTA 導線、残論点
- `docs/06-privacy-draft.md`
  - Grift Beta 用のプライバシーポリシー草案
- `docs/07-terms-draft.md`
  - Grift Beta 用の利用規約草案

## Intended Outcome

この設計書を元に、次の段階で以下へ移れます。

- Astro プロジェクト初期化
- LP のビジュアルデザイン
- コピーライティング
- CTA 導線と計測の実装

## Source Scope

主な抽出元:

- ルート `README.md`
- `docs/v2/README.md`
- `docs/v2/architecture-overview.md`
- `docs/v2/implementation-roadmap.md`
- `docs/v2/adr-0002-multi-source-market-intelligence.md`
- `docs/v2/adr-0004-operational-intelligence-loop.md`
- `docs/v2/adr-0012-cross-tenant-anonymous-intelligence.md`
- `docs/v2/adr-0016-product-integration-estimation-research.md`
- `docs/v2/cross-tenant-intelligence-architecture.md`
- `apps/web/README.md`
- `services/control-api/README.md`
- `services/intelligence-worker/README.md`
- `services/llm-gateway/README.md`
