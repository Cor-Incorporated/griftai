/**
 * Cor contact CTA builder (ADR-0002 / corsweb ADR-0010)
 *
 * All primary CTAs that leave griftai.org for Cor contact must go through
 * these helpers so target / intent / source / locale / UTM stay consistent.
 */

import { getSiteEnvironment } from './site-env';

/** Product-intent values shared with corsweb / Cloudia */
export type CorIntent = 'grift-team-beta' | 'grift-paid-trial' | 'estimate-audit';
export type CorLocale = 'ja' | 'en';

export interface BuildCorContactUrlOptions {
  intent: CorIntent;
  /** Placement identifier, e.g. grift-lp-hero */
  source: string;
  /** Locale handed to Cloudia. Defaults to PUBLIC_SITE_LOCALE, then `ja`. */
  locale?: CorLocale;
  utmSource?: string;
  utmMedium?: string;
}

const DEFAULT_COR_BASE_URL = 'https://cor-jp.com';
export const PRODUCTION_CONTACT_CHAT_URL = 'https://cor-jp.com/contact/chat/';
export const PREVIEW_CONTACT_CHAT_URL = 'https://6ad95a0c.cloudia-contact.pages.dev/';

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

function validateExactContactUrl(raw: string, expected: string, environment: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid PUBLIC_CONTACT_CHAT_URL for ${environment}: expected ${expected}`);
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.href !== expected
  ) {
    throw new Error(`Invalid PUBLIC_CONTACT_CHAT_URL for ${environment}: expected ${expected}`);
  }

  return url.href;
}

/** Exact Cloudia entry URL for the current build; never falls across environments. */
export function getContactChatUrl(): string {
  const environment = getSiteEnvironment();
  const configured = readPublicEnv('PUBLIC_CONTACT_CHAT_URL');

  if (environment === 'preview') {
    if (!configured) {
      throw new Error(
        `PUBLIC_CONTACT_CHAT_URL is required for preview builds and must equal ${PREVIEW_CONTACT_CHAT_URL}`
      );
    }
    return validateExactContactUrl(configured, PREVIEW_CONTACT_CHAT_URL, environment);
  }

  return validateExactContactUrl(
    configured ?? PRODUCTION_CONTACT_CHAT_URL,
    PRODUCTION_CONTACT_CHAT_URL,
    environment
  );
}

/** Locale attached to every Cloudia CTA. The current LP defaults to Japanese. */
export function getSiteLocale(): CorLocale {
  const locale = readPublicEnv('PUBLIC_SITE_LOCALE') ?? 'ja';
  if (locale === 'ja' || locale === 'en') return locale;
  throw new Error(
    `Invalid PUBLIC_SITE_LOCALE: expected "ja" or "en", received ${JSON.stringify(locale)}`
  );
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
 * `${PUBLIC_CONTACT_CHAT_URL}?intent=grift-team-beta&source=grift-lp-hero&locale=ja&utm_source=grift&utm_medium=cta`
 */
export function buildCorContactUrl(options: BuildCorContactUrlOptions): string {
  const url = new URL(getContactChatUrl());

  url.searchParams.set('intent', options.intent);
  url.searchParams.set('source', options.source);
  url.searchParams.set('locale', options.locale ?? getSiteLocale());
  url.searchParams.set('utm_source', options.utmSource ?? 'grift');
  url.searchParams.set('utm_medium', options.utmMedium ?? 'cta');

  return url.toString();
}

/** Convenience aliases for the three Grift product intents */
export const corCta = {
  teamBeta: (source: string, locale?: CorLocale) =>
    buildCorContactUrl({ intent: 'grift-team-beta', source, locale }),
  paidTrial: (source: string, locale?: CorLocale) =>
    buildCorContactUrl({ intent: 'grift-paid-trial', source, locale }),
  estimateAudit: (source: string, locale?: CorLocale) =>
    buildCorContactUrl({ intent: 'estimate-audit', source, locale }),
} as const;
