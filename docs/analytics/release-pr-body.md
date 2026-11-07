## Summary

develop を main（本番）に出す release PR です。この PR は自分では merge しません。merge は、寺田さんの Yes のあとです。`main` に入ると、Cloudflare Pages の Git 連携が本番をビルドします。

この release には、GA4 と Clarity の ID をコードの直書きから環境変数（`PUBLIC_GA4_ID`、`PUBLIC_CLARITY_ID`）に変える変更（#108）が入っています。**Cloudflare Pages の `griftai` の Production に、この 2 つの変数がないまま merge すると、griftai.org の GA4 と Clarity のタグが本番から消えます。** 変数を入れる手順は `docs/analytics/runbook.md` の 5-2 節で、確かめる手順は 7 節です。

この release が変える `.github/workflows/ci.yml` は、2 つの PR（#107 と #108）の変更です。#107 は、cor-voice の写しを corsweb2024 の develop と比べる検査を足しました。#108 は、ダミーの ID で作り直す 2 ステップと、deploy 経路の ID の検査を足しました。

この本文は、`docs/analytics/runbook.md` の 6-2 節のブロックが作ります。先頭の `head: <sha>` の行は、作った時点の develop の sha です。ブロックは、構造パスの変更が `ci.yml` の 1 つだけで、それを変えた PR が #107 と #108 の 2 本だけであることを確かめてから、本文を作ります。

## 人間ゲート

- この PR の merge（develop → main、merge commit）: 寺田さんの Yes。Pages の Production に変数を入れたあとだけ（`docs/analytics/runbook.md` の 5-2 節）
- Pages の Production の変数の登録: 寺田さん（ブラウザの作業）

## 実環境貫通（C11 / Track B B1）

- [x] 実環境を 1 本通した（#107 と #108 の記録）。#108 は、ID なしのビルドと、ダミーの ID（`G-CITEST0001`、`citest0001`）のビルドを、Playwright で実ブラウザに通しました。#107 は、写しに 1 行足した commit の CI が failure、戻した commit の CI が success になりました。この release を main に merge したあとの本番の確認は、`docs/analytics/runbook.md` の 7 節です（merge 前は未実測）

## 未知の依存・API（C16 / Track B B4）

- [x] 該当なし（初出の依存・API は #107 でも #108 でも使っていません）

## 完了条件の形式（Track B B2）

- [x] F2 失敗モードの再現。#108 の `tests/unit/analytics-config.test.ts` と `e2e/smoke.spec.ts`、#107 の CI の step が見ます。それぞれの本文に、事故入力を注入して FAILED を測った記録があります

H5-guard: yes
H5-NEGATIVE: この release の workflow の変更は、#107 と #108 の ci.yml。#108 は、修正前のコードに新しい e2e を当てると、ID なしでも旧 ID のタグを読み込み 2 件が FAILED、deploy の検査の式は ID あり = 終了コード 0、空 = 1、片方だけ = 1 を実測。#107 は、cor-voice の写しに 1 行足した commit 720f57f の CI が failure（run 41624719690）、戻した commit cd7282f が success（run 41624834281）。どちらも各 PR の本文に記録
H5-LEDGER: #108 は経路なし。block 権限を持つ guard ではない（タグの ID を環境変数にする変更と、CI の e2e の段取り）。#107 は、検査が GitHub Actions の quality job で動き、発火の記録は GitHub の run と check に残る。runner に guard-ledger.jsonl はないので、この記録への配線はしない。数え方は #107 の本文の H5-LEDGER
H5-RETIRE: #108 は、ci.yml のダミー ID で作り直す 2 ステップを、GA4 と Clarity の ID をビルド時の環境変数で読む作りをやめた時点で削除する（測定は grep -c "dummy analytics IDs" .github/workflows/ci.yml が 0）。#107 は、cor-voice の写しの一致を別の必須チェックが見るようになったとき、または corsweb2024 の develop を cor-voice の基準にしなくなったときに、その step を消す。90 日間、その step の failure が 0 件なら、検査の要否を見直す issue を立てる
H5-SUBTRACTION: N/A
H5-PAIR: #107 は griftai の .claude/skills/cor-voice/ ↔ corsweb2024 の develop の同じパス; mutation=1 行を足した commit 720f57f で failure、戻した commit cd7282f で success（#107 の本文に記録）。#108 は pair の変更なし
H5-E2E: #108 は npm run build（ID なし）と npm run test:e2e、続けて PUBLIC_GA4_ID=G-CITEST0001 PUBLIC_CLARITY_ID=citest0001 REQUIRE_ANALYTICS_IDS=1 でビルドし直して npm run test:e2e -- --grep "Analytics"。#107 は npm run check、npm run test:unit、npm run build
H5-E2E-OUT: #108 は、ID なしの dist が 104 passed と 2 skipped、ダミー ID の dist が 6 passed と 2 skipped、修正前のコードに新しい e2e を当てた「ID なし」の検査が 2 件 FAILED。#107 は、npm run check rc 0、npm run test:unit rc 0（10 files / 30 tests）、npm run build rc 0（30 pages）。どちらも各 PR の本文に記録（merge 前の測定）
