# アクセス解析の設計（griftai.org）

GA4 と Microsoft Clarity のタグの出し方と、その条件を固定するテストの対応表です。操作の手順は [runbook.md](./runbook.md) にあります。

## ID の置き場所

ID はコードに書きません。ビルド時の環境変数から読みます。

| 計測 | 環境変数 | 読む場所 |
|---|---|---|
| Google Analytics 4 | `PUBLIC_GA4_ID`（測定 ID。`G-` で始まる） | `src/config/analytics.ts` の `resolveAnalytics` |
| Microsoft Clarity | `PUBLIC_CLARITY_ID`（Project ID） | 同上 |

- 本番は Cloudflare Pages の Git 連携がビルドします（`CLAUDE.md` の「CI/CD」、2026-10-27 の確認）。環境変数は GitHub ではなく、Pages のプロジェクト `griftai` の **Production** に置きます。
- この repo の GitHub には secret も variable もありません（2026-11-06 に `gh secret list` と `gh variable list` で確認、どちらも 0 件）。
- `.github/workflows/ci.yml` の `deploy` job（GitHub Actions から Pages へ出す経路）は、Cloudflare の secret が未設定なので `skipped` です。その経路が将来有効になっても、使うのは `quality` ジョブの dist です。この dist は ID なしでビルドします。

## タグを出す条件

次の条件がすべて満たされたときだけ、その計測のタグが読み込まれます（`src/layouts/BaseLayout.astro`）。

1. 開いたページのホスト名が `griftai.org` か `www.griftai.org`。ビルドではなく実行時に判定する（CI のビルドと本番のビルドが同じ成果物になりうるため。ADR-0006 の決定 6）
2. その計測の ID が設定されている。未設定なら、ホストが本番でも何も読み込まない
3. ID が形式に合う。GA4 は `^G-[A-Z0-9]+$`、Clarity は `^[A-Za-z0-9]+$`。前後の空白と改行は取り除く。合わない値は空として扱い、タグの URL に入れない

`dataLayer` と `gtag` の関数は、どのホストでも、ID がなくても用意します。CTA と資料のクリックのイベントを、手元でも確かめられるようにするためです。

## テストとの対応

| 条件 | テスト | 落ちるべき変更 |
|---|---|---|
| ID を env から読む。直書きがない | `tests/unit/analytics-config.test.ts`「未設定なら 2 つとも空…」 | ID を config に直書きに戻す |
| 形式の崩れた ID は出さない | 同「形式の崩れた PUBLIC_GA4_ID」「PUBLIC_CLARITY_ID」 | 形式の検査を外す |
| 本番のホストの一覧 | 同「タグを読み込む本番のホストは…」 | 一覧を広げる・落とす |
| localhost では何も読み込まない | `e2e/smoke.spec.ts`「localhost loads neither…」 | ホストの判定を外す |
| ID あり: 本番のホストで設定した ID のタグを読み込む | 同「IDs configured: …」 | ID を無視する、ホストの判定を外す |
| ID なし: 本番のホストでも何も読み込まない | 同「IDs not configured: …」 | `if (ga4Id)` や `if (clarityId)` を外す |

e2e の「ID あり」と「ID なし」は、ビルドに ID を渡したかどうかで、どちらか一方だけが動きます（`PUBLIC_GA4_ID` と `PUBLIC_CLARITY_ID` が、ビルドとテストの両方に渡っているか）。CI の `e2e-smoke` ジョブは、次の順で両方を動かします。

1. `quality` ジョブの dist（ID なし）で `npm run test:e2e`。「ID なし」が動く
2. ダミーの ID（`G-CITEST0001`、`citest0001`）で作り直し、`--grep "Analytics"` で動かす。「ID あり」が動く

ダミーの ID は本物のプロパティ / プロジェクトではありません。作り直した dist は deploy に渡しません。

手元で「ID あり」を動かす場合は、次のようにします。

```bash
PUBLIC_GA4_ID=G-CITEST0001 PUBLIC_CLARITY_ID=citest0001 npm run build
PUBLIC_GA4_ID=G-CITEST0001 PUBLIC_CLARITY_ID=citest0001 npm run test:e2e -- --grep "Analytics"
```

## 2026-11-06 の変更

- `src/config/analytics.ts` に直書きしていた 2 つの ID（GA4 `G-3E8328E5V6`、Clarity `wk1nad97m0`）を、環境変数に変えた。2026-05-12 のコミット a7619d6「SEO内部対策（第1回納品分）反映」で、GMO の納品データを社内で反映したものだった。
- 2 サイトの計測を Cor. 所有のプロパティ / プロジェクトにそろえるため。ID の切り替えは、コードを直さずに Pages の変数で行える。
- **Pages の Production に変数を入れる前に、この変更を本番へ release すると、griftai.org の GA4 と Clarity が止まる。** 順序は [runbook.md](./runbook.md) の「1. 守る順序」にある。
