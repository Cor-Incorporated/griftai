/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly SITE_NAME: string;
  readonly SITE_DESCRIPTION: string;
  readonly SITE_AUTHOR: string;
  /** Cor site origin for CTAs (prod: https://cor-jp.com, preview: Preview Cor URL) */
  readonly PUBLIC_COR_BASE_URL?: string;
  /** Exact Cloudia entry URL; environment-specific and validated fail-closed. */
  readonly PUBLIC_CONTACT_CHAT_URL?: string;
  /** Locale attached to Cloudia CTA handoff. */
  readonly PUBLIC_SITE_LOCALE?: 'ja' | 'en' | string;
  /** production | preview — preview forces noindex */
  readonly PUBLIC_SITE_ENV?: 'production' | 'preview' | string;
  /** Cloudflare Pages branch name (set at build time) */
  readonly CF_PAGES_BRANCH?: string;
  /** Exact 40-character lowercase candidate SHA for Preview provenance. */
  readonly PUBLIC_RELEASE_CANDIDATE_SHA?: string;
  /** Safe Cloudflare Pages deployment identifier for Preview provenance. */
  readonly PUBLIC_RELEASE_DEPLOYMENT_ID?: string;
  /** Safe cross-repository release identifier for Preview provenance. */
  readonly PUBLIC_RELEASE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
