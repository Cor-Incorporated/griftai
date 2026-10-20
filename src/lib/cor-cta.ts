/**
 * Cor contact CTA builder (ADR-0002 / corsweb ADR-0010)
 *
 * All primary CTAs that leave griftai.org for Cor AI reception must go through
 * these helpers so intent / source / UTM and PUBLIC_COR_BASE_URL stay consistent.
 */

/**
 * Product-intent values shared with corsweb / Cloudia (corsweb ADR-0014 が正本)。
 * 値は機械キーの契約なので、提供内容が変わってもここでは改名しない。
 * 2026-10 の方針転換後、Grift LP は `grift-team-beta` を「Grift（CLI・紹介会社さま向けテスト導入）の相談」
 * として使う。`grift-paid-trial` / `estimate-audit` は旧プラン用で、LP からはもう送らない。
 */
export type CorIntent = 'grift-team-beta' | 'grift-paid-trial' | 'estimate-audit';

export interface BuildCorContactUrlOptions {
  intent: CorIntent;
  /** Placement identifier, e.g. grift-lp-hero */
  source: string;
  utmSource?: string;
  utmMedium?: string;
  /** Path under Cor site. Default `/contact/chat` */
  path?: string;
}

const DEFAULT_COR_BASE_URL = 'https://cor-jp.com';

function readPublicEnv(name: string): string | undefined {
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  if (fromMeta) return fromMeta;
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

/** Cor site origin (no trailing slash). Preview overrides via PUBLIC_COR_BASE_URL. */
export function getCorBaseUrl(): string {
  const raw = readPublicEnv('PUBLIC_COR_BASE_URL') || DEFAULT_COR_BASE_URL;
  return raw.replace(/\/$/, '');
}

/** Build an absolute Cor URL for a path (company home, about, legal, etc.). */
export function getCorUrl(path = '/'): string {
  const base = getCorBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, `${base}/`).href;
}

/**
 * Build Cor contact URL with intent / source / UTM query params.
 *
 * Example:
 * `${PUBLIC_COR_BASE_URL}/contact/chat?intent=grift-team-beta&source=grift-lp-hero&utm_source=grift&utm_medium=cta`
 */
export function buildCorContactUrl(options: BuildCorContactUrlOptions): string {
  const base = getCorBaseUrl();
  const path = options.path ?? '/contact/chat';
  const url = new URL(path.startsWith('/') ? path : `/${path}`, `${base}/`);

  url.searchParams.set('intent', options.intent);
  url.searchParams.set('source', options.source);
  url.searchParams.set('utm_source', options.utmSource ?? 'grift');
  url.searchParams.set('utm_medium', options.utmMedium ?? 'cta');

  return url.toString();
}

/** Grift の相談（CLI・紹介会社さま向けテスト導入）へ送る CTA。intent キーは契約どおり `grift-team-beta`。 */
export const corCta = {
  griftTrial: (source: string) => buildCorContactUrl({ intent: 'grift-team-beta', source }),
} as const;
