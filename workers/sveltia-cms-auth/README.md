# workers/sveltia-cms-auth

Grift の管理画面で「GitHub にログイン」するとき、GitHub OAuth App の client secret をブラウザに出さずにトークンを受け取る Cloudflare Worker です。渡し先は `wrangler.toml` の `ALLOWED_DOMAINS` だけです。

実装の形は cor-jp.com（corsweb2024 の `workers/sveltia-cms-auth`、ADR-0018）と同じです。

## 上流

| 項目 | 値 |
|---|---|
| リポジトリ | https://github.com/sveltia/sveltia-cms-auth |
| コミット | `4fd08b5d4e009a85fa473fd523824ca9dfee9533` |
| ライセンス | MIT（Copyright (c) 2026 Kohei Yoshino）。全文は `LICENSE.txt` |

`src/index.js` と `LICENSE.txt` は上流のファイルそのままです。`scripts/check-cms.mjs` が git の blob SHA を照合します。変えてよいのは `wrangler.toml` と、この README と `.gitignore` だけです。

## まだ置いていないもの

- Cloudflare の `account_id`（リポジトリに書かない）
- `GITHUB_CLIENT_ID` と `GITHUB_CLIENT_SECRET`（`wrangler secret put`。ファイルに書かない）
- 本番の workers.dev URL。`cms/public/config.yml` の `backend.base_url` は `http://127.0.0.1:8787` のまま

手元で Worker を動かすとき:

```bash
cd workers/sveltia-cms-auth
npx --yes wrangler@4.135.0 dev
npx --yes wrangler@4.135.0 secret put GITHUB_CLIENT_ID
npx --yes wrangler@4.135.0 secret put GITHUB_CLIENT_SECRET
```

OAuth App のコールバック URL は、動かしている Worker の URL に `/callback` を足したものです。手順の全体は [docs/cms.md](../../docs/cms.md) にあります。
