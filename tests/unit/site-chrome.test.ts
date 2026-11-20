import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  SITE_CHROME,
  commonLinksFor,
  siteChromeOrganization,
  siteChromeYear,
  siteLinkFor,
} from '../../src/config/site-chrome';

const LOCALES = ['ja', 'en', 'zh', 'ko', 'es'] as const;

describe('siteChrome data', () => {
  it('keeps version 2 and the three canonical common link ids', () => {
    expect(SITE_CHROME.version).toBe(2);
    expect(SITE_CHROME.commonLinks.map((link) => link.id)).toEqual([
      'privacy',
      'tokushoho',
      'security',
    ]);
    expect(new Set(SITE_CHROME.commonLinks.map((link) => link.id)).size).toBe(
      SITE_CHROME.commonLinks.length
    );
  });

  it('has a company name for all five languages', () => {
    for (const locale of LOCALES) {
      expect(siteChromeOrganization(locale).length, locale).toBeGreaterThan(0);
    }
    expect(siteChromeOrganization('ja')).toBe('Cor.株式会社');
  });

  it('has https, trailing-slash hrefs and labels for all five languages', () => {
    for (const link of SITE_CHROME.commonLinks) {
      for (const locale of LOCALES) {
        expect(link.label[locale].length, `${link.id}.${locale} label`).toBeGreaterThan(0);
        expect(link.href[locale], `${link.id}.${locale}`).toMatch(/^https:\/\//);
        expect(link.href[locale].endsWith('/'), `${link.id}.${locale} trailing slash`).toBe(true);
        expect(link.label[locale], `${link.id}.${locale} label terms`).not.toMatch(/terms/i);
        expect(link.href[locale], `${link.id}.${locale} href terms`).not.toMatch(/terms/i);
      }
    }
  });

  it('lists the three sites with unique ids and hrefs', () => {
    expect(SITE_CHROME.sites.map((site) => site.id)).toEqual(['cor', 'grift', 'cloudia']);
    expect(new Set(SITE_CHROME.sites.map((site) => site.href)).size).toBe(SITE_CHROME.sites.length);
    for (const site of SITE_CHROME.sites) {
      expect(site.label.length).toBeGreaterThan(0);
      expect(site.href).toMatch(/^https:\/\//);
    }
  });

  it('returns the sites by id, so the URL has one owner', () => {
    expect(siteLinkFor('cor').href).toBe('https://cor-jp.com/');
    expect(siteLinkFor('grift').href).toBe('https://griftai.org/');
  });

  it('has no terms link while cor-jp.com has no terms page', () => {
    const all = [
      ...SITE_CHROME.commonLinks.flatMap((link) => [
        ...LOCALES.map((locale) => link.label[locale]),
        ...LOCALES.map((locale) => link.href[locale]),
      ]),
      ...SITE_CHROME.sites.map((site) => site.href),
    ].join(' ');

    expect(all).not.toMatch(/利用規約/);
    expect(all).not.toMatch(/terms/i);
  });

  it('returns the common links for every locale in JSON order', () => {
    expect(commonLinksFor('ja').map((link) => link.label)).toEqual([
      'プライバシー',
      '特定商取引法表記',
      'セキュリティ',
    ]);
    expect(commonLinksFor('en').map((link) => link.label)).toEqual([
      'Privacy',
      'Legal Notice',
      'Security',
    ]);
    for (const locale of LOCALES) {
      expect(commonLinksFor(locale).map((link) => link.id)).toEqual([
        'privacy',
        'tokushoho',
        'security',
      ]);
    }
  });

  it('takes the year from the clock, not from a constant', () => {
    expect(siteChromeYear(new Date('2026-05-01T00:00:00Z'))).toBe(2026);
    expect(siteChromeYear(new Date('2031-01-01T00:00:00Z'))).toBe(2031);
  });
});

/**
 * 直書きの URL は、DOM の検査では見つからない（同じ値なら通る）。
 * header と下の帯の source を読み、JSON が持つドメインの https URL が 0 件か見る。
 */
function sourceOf(file: string): string {
  return readFileSync(new URL(`../../src/components/layout/${file}`, import.meta.url), 'utf8');
}

function withoutComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

const domainPattern = [...new Set(SITE_CHROME.sites.map((site) => new URL(site.href).hostname))]
  .map((hostname) => hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

describe('header と下の帯の URL', () => {
  it('Cor.・Grift・Cloudia のドメインの https URL を source に直書きしない', () => {
    const hardcoded = new RegExp(`https:\\/\\/[^\\s"'<>]*(?:${domainPattern})`, 'i');

    for (const file of ['Header.astro', 'Footer.astro']) {
      const source = withoutComments(sourceOf(file));
      const matches = source.match(new RegExp(hardcoded.source, 'gi')) ?? [];
      expect(matches, `${file} の直書き URL`).toEqual([]);
    }
  });
});
