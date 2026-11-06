/**
 * アクセス解析の設定。GA4 と Microsoft Clarity のタグは、本番のホストでだけ読み込む（BaseLayout.astro）。
 *
 * ID はコードに書かない。ビルドの環境変数から読む（Cloudflare Pages の Production の変数。docs/analytics/runbook.md）。
 * - PUBLIC_GA4_ID:     GA4 の測定 ID（「G-」で始まる値）
 * - PUBLIC_CLARITY_ID: Clarity のプロジェクト ID
 * 未設定、または形式の崩れた値なら空文字にし、BaseLayout はその計測のタグを出さない。
 *
 * 2026-10-26 までは、どのホストでもタグを読み込んでいた。手元の開発・CI の e2e・Cloudflare Pages の
 * プレビューで開いたページも、本番と同じ GA4 のプロパティと Clarity のプロジェクトへ送られていた
 * （e2e: localhost loads neither GA4 nor Clarity）。
 * 2026-11-06 までは、2 つの ID をこのファイルに直書きしていた。Cor. が所有するプロパティ / プロジェクトへ
 * 切り替えられるように、環境変数にした。
 */
export interface AnalyticsEnv {
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_CLARITY_ID?: string;
}

// GA4 の測定 ID は「G-」に英数字が続く。Clarity のプロジェクト ID は英数字。
// 引用符・空白・&・スラッシュ・バッククォートは通さない（secret や変数に別の値や改行が混ざっても、タグの URL に入れない）。
const GA4_MEASUREMENT_ID = /^G-[A-Z0-9]+$/;
const CLARITY_PROJECT_ID = /^[A-Za-z0-9]+$/;

/** 前後の空白と改行を取り除き、形式に合わなければ空文字にする */
function pickId(raw: string | undefined, pattern: RegExp): string {
  const id = (raw ?? '').trim();
  return pattern.test(id) ? id : '';
}

export function resolveAnalytics(env: AnalyticsEnv) {
  return {
    ga4MeasurementId: pickId(env.PUBLIC_GA4_ID, GA4_MEASUREMENT_ID),
    clarityProjectId: pickId(env.PUBLIC_CLARITY_ID, CLARITY_PROJECT_ID),
    productionHosts: ['griftai.org', 'www.griftai.org'],
  } as const;
}

export const analytics = resolveAnalytics({
  PUBLIC_GA4_ID: import.meta.env.PUBLIC_GA4_ID,
  PUBLIC_CLARITY_ID: import.meta.env.PUBLIC_CLARITY_ID,
});
