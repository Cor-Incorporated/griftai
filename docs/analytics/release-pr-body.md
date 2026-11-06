## Summary

develop を main（本番）に出す release PR です。この PR は自分では merge しません。merge は、寺田さんの Yes のあとです。`main` に入ると、Cloudflare Pages の Git 連携が本番をビルドします。

この release には、GA4 と Clarity の ID をコードの直書きから環境変数（`PUBLIC_GA4_ID`、`PUBLIC_CLARITY_ID`）に変える変更（#108）が入っています。**Cloudflare Pages の `griftai` の Production に、この 2 つの変数がないまま merge すると、griftai.org の GA4 と Clarity のタグが本番から消えます。** 変数を入れる手順は `docs/analytics/runbook.md` の 5-2 節で、確かめる手順は 7 節です。

この本文は、`docs/analytics/runbook.md` の 6-2 節のブロックが作ります。先頭の `head: <sha>` の行は、作った時点の develop の sha です。ブロックは、この release が変える `.github/workflows/` のファイルが `ci.yml` の 1 つだけであることを確かめてから、本文を作ります。

## 人間ゲート

- この PR の merge（develop → main、merge commit）: 寺田さんの Yes。Pages の Production に変数を入れたあとだけ（`docs/analytics/runbook.md` の 5-2 節）
- Pages の Production の変数の登録: 寺田さん（ブラウザの作業）

## 実環境貫通（C11 / Track B B1）

- [x] 実環境を 1 本通した（#108 の記録）。ID なしのビルドと、ダミーの ID（`G-CITEST0001`、`citest0001`）のビルドを、Playwright で実ブラウザに通しました。この release を main に merge したあとの本番の確認は、`docs/analytics/runbook.md` の 7 節です（merge 前は未実測）

## 未知の依存・API（C16 / Track B B4）

- [x] 該当なし（初出の依存・API は #108 でも使っていません）

## 完了条件の形式（Track B B2）

- [x] F2 失敗モードの再現。#108 の `tests/unit/analytics-config.test.ts` と `e2e/smoke.spec.ts` が見ます。#108 の本文に、事故入力を注入して FAILED を測った記録があります

H5-guard: yes
H5-NEGATIVE: この release の workflow の変更は、#108 の ci.yml（ダミー ID で作り直す 2 ステップと、deploy 経路の ID の検査）だけ。修正前のコードに新しい e2e を当てると、ID なしでも旧 ID のタグを読み込み 2 件が FAILED。deploy の検査の式は、ID あり = 終了コード 0、空 = 1、片方だけ = 1 を実測（#108 の本文に記録）
H5-LEDGER: 経路なし。この release の変更は block 権限を持つ guard ではない（タグの ID を環境変数にする変更と、CI の e2e の段取り）。発火が aidd_ledger_append や guard-ledger.jsonl に届く経路は作っていない
H5-RETIRE: ci.yml のダミー ID で作り直す 2 ステップは、GA4 と Clarity の ID をビルド時の環境変数で読む作りをやめた時点で削除する。測定は grep -c "dummy analytics IDs" .github/workflows/ci.yml が 0 になること
H5-SUBTRACTION: N/A
H5-PAIR: N/A
H5-E2E: npm run build（ID なし）と npm run test:e2e、続けて PUBLIC_GA4_ID=G-CITEST0001 PUBLIC_CLARITY_ID=citest0001 REQUIRE_ANALYTICS_IDS=1 でビルドし直して npm run test:e2e -- --grep "Analytics"（#108 で実行）
H5-E2E-OUT: ID なしの dist は 104 passed と 2 skipped、ダミー ID の dist は 6 passed と 2 skipped。修正前のコードに新しい e2e を当てた「ID なし」の検査は 2 件 FAILED（#108 の本文に記録。merge 前の測定）
