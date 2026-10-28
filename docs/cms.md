# 記事とお知らせの編集（Sveltia CMS）

決定は [ADR-0007](adr/ADR-0007-cms-articles-news.md) です。形は cor-jp.com の Sveltia CMS（corsweb2024 ADR-0018）に揃えています。本文は Git の Markdown で、データベースは使いません。

編集できるのは次の 2 つです。

| 種類 | ファイル | 公開 URL |
|---|---|---|
| 記事 | `src/content/articles/<slug>.md` | `/articles/<slug>/` |
| お知らせ | `src/content/news/<slug>.md` | `/news/<slug>/` |

`isDraft: true` のファイルは公開ページとサイトマップに出ません。コラム（GMO の固定ページ）とストーリーは、この画面の対象ではありません。

## 手元で追加・更新・削除する

```bash
npm ci
npm run cms:dev
```

Chromium（Chrome、Edge、Brave）で http://localhost:5174/ を開きます。ログインの代わりに「ローカルリポジトリで作業」を押し、このリポジトリのルートディレクトリを選ぶと、上の Markdown が直接変わります。

Firefox と Safari では、このローカル操作はできません。File System Access API が無いためです。

公開サイトは別の端末で `npm run dev` を動かし、`/articles/` と `/news/` を開いて確認します。

## 管理画面だけをビルドする

```bash
npm run build:cms
```

出力は `cms/dist` です。このディレクトリは git に入れません。

## GitHub で下書きと公開を分ける

`cms/public/config.yml` の `publish_mode` は `editorial_workflow` です。GitHub にログインした編集では、下書きが main 宛の PR になり、公開はその PR の merge です。merge のあと、Cloudflare Pages が本番をビルドします。

このログインはまだ使えません。`backend.base_url` は手元の Worker である `http://127.0.0.1:8787` を指しています。Netlify の認証（`api.netlify.com`）は使いません。

## 認証 Worker

コードは `workers/sveltia-cms-auth` です。`src/index.js` は上流のままなので、書き換えません。

トークンを渡してよいホストは `wrangler.toml` の `ALLOWED_DOMAINS` です。いまの値は `localhost,127.0.0.1` です。空や `*` にはしません。

OAuth App を作ったあとに、secret を環境へ入れます。値はリポジトリに書きません。

```bash
cd workers/sveltia-cms-auth
npx --yes wrangler@4.135.0 dev
npx --yes wrangler@4.135.0 secret put GITHUB_CLIENT_ID
npx --yes wrangler@4.135.0 secret put GITHUB_CLIENT_SECRET
```

GitHub OAuth App のコールバック URL は、Worker の URL の末尾に `/callback` を足したものです。`account_id` もファイルには書きません。

## 公開する日本語

記事とお知らせの本文は cor-voice と yomiyasu で整えます。検査スクリプトはモデルを指定しません。

```bash
python3 .claude/skills/yomiyasu/scripts/yomiyasu_check.py run --source 原文.md --final 最終稿.md --doc-type article --reader informed --stance=説明
```

CMS から LLM の API は呼びません。

## まだ無いもの

本番で GitHub ログインと、管理画面の配信をするには、次が残っています。

1. GitHub OAuth App（client id と client secret）。secret は `wrangler secret put` だけで、ファイルには置かない。
2. 認証 Worker のデプロイ。終わったら `cms/public/config.yml` の `backend.base_url` を、その Worker の URL に変える。`http://127.0.0.1:8787` のままでは本番のログインはできません。
3. 管理画面のホスト。`cms/dist` を griftai.org とは別のオリジンで配信する。同じオリジンに置くと、公開サイトのスクリプトからトークンを読める。
4. そのホスト名だけを `ALLOWED_DOMAINS` に書く。`localhost,127.0.0.1` は外す。`cms/public/_headers` の `connect-src` に、https の Worker のオリジンを足す。`npm run check:cms` が、契約とこれらのファイルの一致を見ます。
5. main のブランチ保護で、CMS から main へ直接 push できないことの確認。editorial workflow の「公開」が merge になることの確認。
6. プレビュー URL を CMS の「プレビューを表示」へ渡す設定。Cloudflare Pages のプレビューは、まだ `preview_context` に繋いでいません。

項目を変えるときは `src/config/cms-contract.ts` と `cms/public/config.yml` と `src/config/cms-schema.ts` を一緒に直し、`npm run check:cms` を通します。
