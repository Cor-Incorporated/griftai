# ADR-0007 記事とお知らせを Sveltia CMS（Git・別オリジン）で編集する

## ステータス: Accepted (2026-10-28)

## 背景

- griftai.org は Astro の静的出力で、Cloudflare Pages に公開している。記事の追加は、これまで Markdown かページファイルを手で編集する必要があった。
- cor-jp.com（corsweb2024）は、同じ静的 Astro のまま、Sveltia CMS で日本語の Markdown を GitHub の PR として編集する（ADR-0018）。管理画面は公開サイトと別オリジンに置き、GitHub ログインは Cloudflare Worker（Sveltia CMS Authenticator）が仲介する。
- griftai.org に別のデータベースや SSR を足すと、いまのビルドと公開の流れが変わる。

## 決定

1. 記事は `src/content/articles`、お知らせは `src/content/news` の Markdown とする。公開ページは `/articles/` と `/news/`。`isDraft: true` のファイルは公開ページとサイトマップに出さない。
2. 編集画面は Sveltia CMS（npm 版、cor-jp.com と同じ 0.221.7）とする。設定は `cms/`。`publish_mode: editorial_workflow` とし、GitHub 上では下書きを PR、公開を main への merge とする。削除は CMS からできる。翻訳ファイルが無いため、cor-jp.com のように削除を止めない。
3. 管理画面は公開サイトと同じオリジンに置かない。GitHub のトークンが localStorage に入るため。配信先のホストは未確定で、この決定ではデプロイしない。
4. GitHub ログインの仲介は `workers/sveltia-cms-auth` とする。`src/index.js` は上流 sveltia/sveltia-cms-auth のコミット `4fd08b5d4e009a85fa473fd523824ca9dfee9533` のまま置く。`GITHUB_CLIENT_ID` と `GITHUB_CLIENT_SECRET` と Cloudflare の `account_id` はリポジトリに書かない。`ALLOWED_DOMAINS` は空にせず、`[vars]` に書く。
5. 項目の正本は `src/config/cms-contract.ts` とする。`cms/public/config.yml` と Zod（`src/config/cms-schema.ts`）のずれは `npm run check:cms` が止める。
6. 公開する日本語の推敲は、cor-voice と yomiyasu（`.claude/skills/yomiyasu/scripts/yomiyasu_check.py`）で行う。特定のモデルの API は呼ばない。CMS に下書き生成のウィジェットは付けない（cor-jp.com ADR-0018 の第 1 段階と同じ）。
7. 既存のコラム（GMO の固定ページ）とストーリー（`src/content/stories`）と、テンプレートの blog コレクションは、この CMS の対象にしない。

## 理由

- 本文が Git の Markdown のままなので、手で書いた記事と CMS で書いた記事が同じ PR とビルドに入る。
- cor-jp.com で動いている認証と設定の形を使うので、編集者の操作と、トークンを公開サイトに置かない理由を揃える。
- 手元では、Chromium の「ローカルリポジトリで作業」で OAuth なしにファイルを追加・更新・削除できる。GitHub ログインは Worker と OAuth App が揃ってからにする。

## 影響

- 公開サイトへの反映は、main に入ったあとの Cloudflare Pages のビルドである。CMS の「公開」だけでは本番に出ない。
- 編集者には GitHub アカウントと、このリポジトリへの書き込みが要る。トークンの範囲は `public_repo,user` で、その人が書き込める公開リポジトリ全体に及ぶ。
- 本番の管理画面ホスト、OAuth App、Worker のデプロイ、`ALLOWED_DOMAINS` をそのホストだけにすること、`backend.base_url` をその Worker にすること、ブランチ保護の確認は、まだ終わっていない。手順は `docs/cms.md`。

## 代替案

- 公開サイトと同じオリジンに `/admin` を置く: 公開ページのスクリプトからトークンを読める。採らない。
- microCMS など本文が Git の外に出る CMS: いまのビルドと記事ファイルを作り直す。採らない。
- StudioCMS: SSR とデータベースが要る。cor-jp.com でも不採用。採らない。

## 関連

corsweb ADR-0018（Sveltia CMS）、本リポジトリ ADR-0005（公開文の範囲）
