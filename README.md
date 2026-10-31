# griftai.org

Grift の紹介サイト（`https://griftai.org`）のソースです。Astro 5 の静的サイトで、Cloudflare Pages に公開しています。

Grift はエンジニアの git 履歴から確かめられる事実を取り出す OSS の CLI（[grift-cli](https://github.com/Cor-Incorporated/grift-cli)、MIT ライセンス）と、人材紹介会社・SES の営業や自社開発企業の採用担当に向けたテスト導入（PoC）です。点数や順位は出しません。運営は Cor.株式会社です。方針は [ADR-0005](docs/adr/ADR-0005-grift-cli-pivot.md) にあります。

## 公開しているページ

- `/`、`/tep/`、`/pricing/`、`/faq/`、`/contact/`
- `/privacy/`、`/terms/`
- `/column/`（コラム 10 本と、架空の物語）
- `/articles/`、`/news/`（CMS で編集する記事とお知らせ。下書きは出さない）
- `/robots.txt`、`/llms.txt`、`/sitemap-index.xml`

ページの一覧と書き方の決まりは [CLAUDE.md](CLAUDE.md) にあります。相談の入口は cor-jp.com の AI 受付（Cloudia）で、このサイトにはフォームを置いていません。

## 開発

```bash
npm ci
npm run dev
```

確かめるときは、次のコマンドを使います。

```bash
npm run check      # lint・書式・astro check・CTA と指標と用語の検査
npm run test:unit
npm run build
npm run test:e2e   # build の後に。Playwright の smoke test
```

## 記事とお知らせの編集

編集画面は Sveltia CMS です。cor-jp.com と同じく、本文は Git の Markdown のままです。手順と、まだ無いもの（OAuth App、認証 Worker のデプロイ、管理画面の公開ホスト）は [docs/cms.md](docs/cms.md) にあります。

手元でファイルを追加・更新・削除するとき:

```bash
npm run cms:dev
```

Chromium で http://localhost:5174/ を開き、「ローカルリポジトリで作業」からこのリポジトリのルートを選びます。Firefox と Safari ではこの操作はできません。

## CI と公開

`.github/workflows/ci.yml` が、PR と、`main`・`feat/**`・`fix/**`・`chore/**` への push で動きます。

- `npm run check`・`npm run test:unit`・`npm run build`（quality）
- Playwright の smoke test（e2e-smoke）
- アクセシビリティの検査（a11y。失敗しても止めない）

本番への公開は、Cloudflare Pages の Git 連携（project `griftai`）が行います。コミットと PR に付く「Cloudflare Pages」のチェックがそれで、PR ごとのプレビューも同じ連携で作られます。PR は `develop` に向けて出してください。`main` は本番で、develop → main の release PR（題は `release: YYYY-MM-DD develop → main`）を人が merge したときだけ変わります。`main` に入ると本番に出ます（2026-10-30 の代表の判断、#102）。

`ci.yml` にも公開のジョブ（deploy_gate と deploy）がありますが、`CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が設定されているときだけ動きます。2026-10-27 時点では設定されておらず、毎回飛ばされています。

## 決定と資料

- 決定: [docs/adr/](docs/adr/README.md)
- `planning/blueprint-docs/` と `docs/lp-storytelling-research.md`: 2026-03 の歴史資料です。AI 見積もりの Web アプリと Grift Beta を前提にしたもので、ADR-0005 で取り下げました
- `docs/01`〜`09`: 元にした Virex テンプレートの説明です
