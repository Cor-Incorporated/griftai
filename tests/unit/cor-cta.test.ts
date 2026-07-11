import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCorContactUrl, corCta, getCorBaseUrl, getCorUrl } from '../../src/lib/cor-cta';

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
    expect(url.pathname).toBe('/contact/');
    expect(url.searchParams.get('intent')).toBe('grift-team-beta');
    expect(url.searchParams.get('source')).toBe('grift-lp-hero');
    expect(url.searchParams.get('utm_source')).toBe('grift');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
  });

  it('uses preview base when PUBLIC_COR_BASE_URL is set', () => {
    vi.stubEnv('PUBLIC_COR_BASE_URL', 'https://preview-cor.example');
    const href = corCta.paidTrial('grift-pricing-paid-trial');
    expect(href.startsWith('https://preview-cor.example/contact/')).toBe(true);
    expect(href).toContain('intent=grift-paid-trial');
    expect(href).toContain('source=grift-pricing-paid-trial');
  });

  it('maps aliases to the three product intents', () => {
    expect(corCta.teamBeta('s')).toContain('intent=grift-team-beta');
    expect(corCta.paidTrial('s')).toContain('intent=grift-paid-trial');
    expect(corCta.estimateAudit('s')).toContain('intent=estimate-audit');
  });
});

describe('getCorUrl', () => {
  it('builds company paths without contact query params', () => {
    expect(getCorUrl('/')).toBe('https://cor-jp.com/');
    expect(getCorUrl('/about/')).toContain('https://cor-jp.com/about');
  });
});
