# ADR-0002 CTA intent と Cor 橋渡し（環境変数）

## ステータス: Accepted (2026-07-10)

## 背景
- 現状ほぼすべての CTA が `https://cor-jp.com/contact/` 固定で、Team Beta / Paid Trial / Estimate Audit の文脈が失われる（監査 P0）。
- Preview Grift → Preview Cor を通し検証できない。

## 決定

### 環境変数
| 変数 | 本番 | Preview |
|---|---|---|
| `PUBLIC_COR_BASE_URL` | `https://cor-jp.com` | 会社情報リンク用（問い合わせCTAには使わない） |
| `PUBLIC_CONTACT_CHAT_URL` | `https://cor-jp.com/contact/chat/` | `https://codex-cloudia-grift-uat.cloudia-contact.pages.dev/` |
| `PUBLIC_SITE_LOCALE` | `ja`（英語版buildは`en`） | `ja`（英語版buildは`en`） |
| `PUBLIC_RELEASE_CANDIDATE_SHA` | 不要 | LP repoの40文字lowercase commit SHA（`CF_PAGES_COMMIT_SHA`でも可） |
| `PUBLIC_RELEASE_DEPLOYMENT_ID` | 不要 | safeなPages deployment ID |
| `PUBLIC_RELEASE_ID` | 不要 | 4-repo共通のsafeなrelease ID |

- `src/config/contact.ts`（または同等）に CTA ビルダを集約する。
- コンポーネントに Cor URL を直書きしない。
- Previewは`PUBLIC_CONTACT_CHAT_URL`を必須とし、欠落、本番URL、exact URL以外をビルド時に拒否する。
- Productionは上記の本番URL以外を拒否し、Preview URLの混入をfail-closedにする。

### intent 付き URL
例: `${PUBLIC_CONTACT_CHAT_URL}?intent=grift-team-beta&source=grift-lp-hero&locale=ja&utm_source=grift&utm_medium=cta`

| CTA 種別 | intent |
|---|---|
| Team Beta 相談 | `grift-team-beta` |
| Paid Trial 相談 | `grift-paid-trial` |
| Estimate Audit 相談 | `estimate-audit` |

### Preview noindex
- Preview は `noindex, nofollow` または `X-Robots-Tag`。
- 本番/Preview URL 混在を CI またはビルド検査で検出する。
- LPの現行コンテンツは日本語なので全CTAに`locale=ja`を明示する。英語版buildでは`PUBLIC_SITE_LOCALE=en`により同じCTA契約で`locale=en`を渡す。

### Preview provenance

- Preview buildだけsame-origin `/release.json`を生成し、`status=ok`、`service=grift-lp`、`repository=Cor-Incorporated/griftai`、LP candidate SHA、deployment ID、release IDを返す。
- Preview provenanceの必須値欠落・形式不正はbuildをfail-closedにする。production buildは`release.json`を生成しない。
- Cloudflare Pagesの`_headers`で`Cache-Control: no-store`、`X-Content-Type-Options: nosniff`、JSON Content-Typeを設定する。Pagesが静的assetへ付ける既定CORSは公式detach syntaxの`! Access-Control-Allow-Origin`で明示的に除去する。

Preview再配信後の受入条件:

1. exact Previewの主要6ページにある全CTAがCloudia UAT originを使い、`intent`、`source`、`locale`を各1件だけ保持する。本番contact URLと`contract-dev`は0件。
2. `GET <Preview origin>/release.json`がHTTP 200と上記6-key schemaを返し、bodyのcandidate SHAがPR HEAD、deployment IDが配信、release IDがUAT候補と一致する。
3. Preview再配信後に`curl -fsS -D <masked-header-file> -o <masked-body-file> <Preview origin>/release.json`でreadbackする。response headerが`Cache-Control: no-store`と`X-Content-Type-Options: nosniff`を含み、`Access-Control-Allow-Origin`を含まないことを確認する。
4. PreviewはHTMLの`noindex, nofollow`、HTTPの`X-Robots-Tag: noindex`、`robots.txt`の`Disallow: /`を維持する。
5. 同一candidateでunit、typecheck、production/Preview build、Desktop/Mobile E2Eを再実行し、Preview URLと証跡をUAT runnerへ記録する。

### 将来
- Contact が Cloudia 本線になった後も、同一 intent クエリで初期文脈を渡す（corsweb ADR-0005 / 0012）。

## 理由
- 導線の真実性とリード分類が公開前最優先。
- 中央集約により後のフォーム置換コストを下げる（旧 Issue #9 の意図を拡張）。

## 影響
- `index.astro`, `pricing.astro`, `FloatingCTA.astro`, `navigation.ts`, `contact.ts` 等を更新。
- corsweb ADR-0010 と対で実装。

## 代替案
- **汎用 contact のみ**: 文脈喪失のため却下。
