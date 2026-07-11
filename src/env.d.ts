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
  /** Cloudflare Pages branch name (set at build time) */
  readonly CF_PAGES_BRANCH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
