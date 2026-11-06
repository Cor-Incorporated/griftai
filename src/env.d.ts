/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly SITE_NAME: string;
  readonly SITE_DESCRIPTION: string;
  readonly SITE_AUTHOR: string;
  /** Cor site origin for CTAs (prod: https://cor-jp.com, preview: Preview Cor URL) */
  readonly PUBLIC_COR_BASE_URL?: string;
  /** production | preview — preview forces noindex */
  readonly PUBLIC_SITE_ENV?: 'production' | 'preview' | string;
  /** GA4 の測定 ID（G-…）。未設定なら GA4 のタグを出さない（src/config/analytics.ts） */
  readonly PUBLIC_GA4_ID?: string;
  /** Clarity のプロジェクト ID。未設定なら Clarity のタグを出さない（src/config/analytics.ts） */
  readonly PUBLIC_CLARITY_ID?: string;
  /** Cloudflare Pages branch name (set at build time) */
  readonly CF_PAGES_BRANCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** GA4 のイベントの列。BaseLayout.astro がどのホストでも用意し、本番のホストでだけ送る */
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
  /** Microsoft Clarity。本番のホストでだけ読み込む */
  clarity?: (...args: unknown[]) => void;
}
