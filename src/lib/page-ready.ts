/**
 * ページの初期化を、最初の表示ではすぐに、ClientRouter のページ遷移後は astro:page-load で実行する。
 *
 * 最初の訪問での astro:page-load は window の load、つまり画像と外部スクリプト（GA4・Clarity）の
 * 読み込みが全部終わるまで来ない。2026-09-16（#70）に初期化を astro:page-load だけに寄せたところ、
 * 回線が遅いとその間ヒーローが opacity: 0 のまま白く見え、スマホのメニューも開かなかった。
 * 初期化を astro:page-load だけで書かないこと（e2e: the first view does not wait for images ...）。
 *
 * ClientRouter はページ遷移のたびに body を差し替える。同じ body で 2 回走らないよう、
 * 初期化した body を覚えておく（最初の表示では、すぐの実行と load 後の astro:page-load が重なる）。
 */
export function onPageReady(init: () => void): void {
  const initialized = new WeakSet<HTMLElement>();
  const run = (): void => {
    if (initialized.has(document.body)) return;
    initialized.add(document.body);
    init();
  };
  run();
  document.addEventListener('astro:page-load', run);
}
