/**
 * アクセス解析の設定。GA4 と Microsoft Clarity のタグは、本番のホストでだけ読み込む（BaseLayout.astro）。
 *
 * 2026-10-26 までは、どのホストでもタグを読み込んでいた。手元の開発・CI の e2e・Cloudflare Pages の
 * プレビューで開いたページも、本番と同じ GA4 のプロパティと Clarity のプロジェクトへ送られていた
 * （e2e: localhost loads neither GA4 nor Clarity）。
 */
export const analytics = {
  ga4MeasurementId: 'G-3E8328E5V6',
  clarityProjectId: 'wk1nad97m0',
  productionHosts: ['griftai.org', 'www.griftai.org'],
} as const;
