# ADR-0002 CTA intent と Cor 橋渡し（環境変数）

## ステータス: Accepted (2026-07-10)

2026-10-20 の ADR-0005（決定 5）で、LP が送る intent は `grift-team-beta` だけになった（意味は「Grift（CLI・テスト導入）の相談」）。下の「intent 付き URL」の表にある Paid Trial と Estimate Audit は、取り下げる前の記録として残す。環境変数と Preview の決定は今も有効。

## 背景
- 変更前はほぼすべての CTA が `https://cor-jp.com/contact/` 固定で、Team Beta / Paid Trial / Estimate Audit の文脈が失われていた（監査 P0）。
- Preview Grift → Preview Cor を通し検証できない。

## 決定

### 環境変数
| 変数 | 本番 | Preview |
|---|---|---|
| `PUBLIC_COR_BASE_URL` | `https://cor-jp.com` | Preview Cor の origin |

- `src/config/contact.ts`（または同等）に CTA ビルダを集約する。
- コンポーネントに Cor URL を直書きしない。

### intent 付き URL
例: `${PUBLIC_COR_BASE_URL}/contact/chat?intent=grift-team-beta&source=grift-lp-hero&utm_source=grift&utm_medium=cta`

| CTA 種別 | intent |
|---|---|
| Team Beta 相談 | `grift-team-beta` |
| Paid Trial 相談 | `grift-paid-trial` |
| Estimate Audit 相談 | `estimate-audit` |

### Preview noindex
- Preview は `noindex, nofollow` または `X-Robots-Tag`。
- 本番/Preview URL 混在を CI またはビルド検査で検出する。

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
