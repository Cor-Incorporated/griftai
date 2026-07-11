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

/**
 * True when this build should not be indexed (Preview / non-production).
 *
 * Priority:
 * 1. PUBLIC_SITE_ENV=preview | production (explicit)
 * 2. CF_PAGES_BRANCH set and not `main` (Cloudflare Pages)
 * 3. default false (allow index — safe for local/prod without env)
 */
export function isPreviewSite(): boolean {
  const siteEnv = readEnv('PUBLIC_SITE_ENV');
  if (siteEnv === 'preview') return true;
  if (siteEnv === 'production') return false;

  const branch = readEnv('CF_PAGES_BRANCH');
  if (branch && branch !== 'main') return true;

  return false;
}

/** robots meta content for the current build */
export function getRobotsMetaContent(): string {
  if (isPreviewSite()) {
    return 'noindex, nofollow';
  }
  return 'index, follow, max-snippet:-1, max-image-preview:large';
}
