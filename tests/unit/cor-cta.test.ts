import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCorContactUrl,
  corCta,
  getContactChatUrl,
  getCorBaseUrl,
  getCorUrl,
  getSiteLocale,
  PREVIEW_CONTACT_CHAT_URL,
  PRODUCTION_CONTACT_CHAT_URL,
} from '../../src/lib/cor-cta';

describe('getCorBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to production Cor origin', () => {
    expect(getCorBaseUrl()).toBe('https://cor-jp.com');
  });

  it('uses PUBLIC_COR_BASE_URL and strips trailing slash', () => {
    vi.stubEnv('PUBLIC_COR_BASE_URL', 'https://preview-cor.example/');
    expect(getCorBaseUrl()).toBe('https://preview-cor.example');
  });
});

describe('buildCorContactUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('adds intent, source, and default UTM params', () => {
    const url = new URL(
      buildCorContactUrl({
        intent: 'grift-team-beta',
        source: 'grift-lp-hero',
      })
    );

    expect(url.origin).toBe('https://cor-jp.com');
    expect(url.pathname).toBe('/contact/chat/');
    expect(url.searchParams.get('intent')).toBe('grift-team-beta');
    expect(url.searchParams.get('source')).toBe('grift-lp-hero');
    expect(url.searchParams.get('locale')).toBe('ja');
    expect(url.searchParams.get('utm_source')).toBe('grift');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
  });

  it('uses the exact preview Cloudia URL when preview config is complete', () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    vi.stubEnv('PUBLIC_CONTACT_CHAT_URL', PREVIEW_CONTACT_CHAT_URL);
    const href = corCta.paidTrial('grift-pricing-paid-trial');
    expect(href.startsWith(PREVIEW_CONTACT_CHAT_URL)).toBe(true);
    expect(href).toContain('intent=grift-paid-trial');
    expect(href).toContain('source=grift-pricing-paid-trial');
    expect(href).toContain('locale=ja');
  });

  it('maps aliases to the three product intents', () => {
    expect(corCta.teamBeta('s')).toContain('intent=grift-team-beta');
    expect(corCta.paidTrial('s')).toContain('intent=grift-paid-trial');
    expect(corCta.estimateAudit('s')).toContain('intent=estimate-audit');
    expect(corCta.teamBeta('s')).not.toContain('intent=contract-dev');
  });

  it('supports the explicit English handoff locale', () => {
    vi.stubEnv('PUBLIC_SITE_LOCALE', 'en');
    expect(new URL(corCta.teamBeta('s')).searchParams.get('locale')).toBe('en');
    expect(new URL(corCta.paidTrial('s', 'ja')).searchParams.get('locale')).toBe('ja');
  });

  it('fails closed when preview target is missing or points to production', () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    expect(() => getContactChatUrl()).toThrow(/required for preview builds/);

    vi.stubEnv('PUBLIC_CONTACT_CHAT_URL', PRODUCTION_CONTACT_CHAT_URL);
    expect(() => getContactChatUrl()).toThrow(/Invalid PUBLIC_CONTACT_CHAT_URL for preview/);
  });

  it('fails closed when production target points to Preview', () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'production');
    vi.stubEnv('PUBLIC_CONTACT_CHAT_URL', PREVIEW_CONTACT_CHAT_URL);
    expect(() => getContactChatUrl()).toThrow(/Invalid PUBLIC_CONTACT_CHAT_URL for production/);
  });

  it('rejects malformed targets and unsupported locales', () => {
    vi.stubEnv('PUBLIC_CONTACT_CHAT_URL', `${PRODUCTION_CONTACT_CHAT_URL}?unexpected=1`);
    expect(() => getContactChatUrl()).toThrow(/Invalid PUBLIC_CONTACT_CHAT_URL/);

    vi.stubEnv('PUBLIC_CONTACT_CHAT_URL', PRODUCTION_CONTACT_CHAT_URL);
    vi.stubEnv('PUBLIC_SITE_LOCALE', 'fr');
    expect(() => getSiteLocale()).toThrow(/Invalid PUBLIC_SITE_LOCALE/);
  });
});

describe('getCorUrl', () => {
  it('builds company paths without contact query params', () => {
    expect(getCorUrl('/')).toBe('https://cor-jp.com/');
    expect(getCorUrl('/about/')).toContain('https://cor-jp.com/about');
  });
});
