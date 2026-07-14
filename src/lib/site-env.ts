/**
 * Site environment helpers (ADR-0002 Preview noindex)
 */

function readEnv(name: string): string | undefined {
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  if (fromMeta) return fromMeta;
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

export type SiteEnvironment = 'production' | 'preview';

/**
 * Resolve the build environment once for every public integration boundary.
 * An explicit but unknown value is rejected so a typo cannot silently turn a
 * Preview build into a production-connected build.
 */
export function getSiteEnvironment(): SiteEnvironment {
  const siteEnv = readEnv('PUBLIC_SITE_ENV');
  if (siteEnv) {
    if (siteEnv === 'preview' || siteEnv === 'production') return siteEnv;
    throw new Error(
      `Invalid PUBLIC_SITE_ENV: expected "production" or "preview", received ${JSON.stringify(siteEnv)}`
    );
  }

  const branch = readEnv('CF_PAGES_BRANCH');
  if (branch && branch !== 'main') return 'preview';

  return 'production';
}

/**
 * True when this build should not be indexed (Preview / non-production).
 *
 * Priority:
 * 1. PUBLIC_SITE_ENV=preview | production (explicit)
 * 2. CF_PAGES_BRANCH set and not `main` (Cloudflare Pages)
 * 3. default false (allow index — safe for local/prod without env)
 */
export function isPreviewSite(): boolean {
  return getSiteEnvironment() === 'preview';
}

/** robots meta content for the current build */
export function getRobotsMetaContent(): string {
  if (isPreviewSite()) {
    return 'noindex, nofollow';
  }
  return 'index, follow, max-snippet:-1, max-image-preview:large';
}
