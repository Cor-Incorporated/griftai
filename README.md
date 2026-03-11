# Grift Landing

`griftai.org` 向けの日本語ファーストな Astro ランディングサイトです。`Virex` をベースに、Grift Beta の訴求、料金、FAQ、法務ページを実装しています。

## 目的

- 日本市場向けに `Grift Beta` の価値を明確に伝える
- `Cor.inc` の既存問い合わせ導線へ確実につなぐ
- AI 開発の見積、提案、GitHub 実績分析に関する高意図キーワードの受け皿を作る

## 現在の公開対象ページ

- `/`
- `/pricing`
- `/faq`
- `/contact`
- `/privacy`
- `/terms`

不要な英語テンプレートページ、ダッシュボード、ブログ、ドキュメントルートは初期リリース対象から外しています。

## 実装方針

- 日本語ファースト
- canonical は `https://griftai.org`
- 主要 CTA は `https://cor-jp.com/contact/`
- 料金表示は正式版ではなく `Beta pricing`
- LP 内の独自フォームは未実装
  後から追加しやすい構成でページを分離しています。

## 設計ドキュメント

企画と要件定義は `planning/blueprint-docs/` に保存しています。

- `planning/blueprint-docs/01-source-extraction.md`
- `planning/blueprint-docs/02-persona-positioning.md`
- `planning/blueprint-docs/03-astro-spa-requirements.md`
- `planning/blueprint-docs/04-content-strategy.md`
- `planning/blueprint-docs/05-beta-launch-decisions.md`
- `planning/blueprint-docs/06-privacy-draft.md`
- `planning/blueprint-docs/07-terms-draft.md`

## 開発

```bash
npm install
npm run dev
```

主な確認コマンド:

```bash
npm run build
npm run check
```

## 備考

- デザインシステムと Astro 構成は `Virex` をベースにしています。
- ただし公開サイトとしては Grift 用に大幅に簡略化し、テンプレート由来の公開ルートは削除しています。
