import data from './site-chrome.json';

export type SiteChromeLocale = 'ja' | 'en' | 'zh' | 'ko' | 'es';
export type SiteChromeSiteId = 'cor' | 'grift' | 'cloudia';

export interface CommonLink {
  id: string;
  label: Record<SiteChromeLocale, string>;
  href: Record<SiteChromeLocale, string>;
}

export interface SiteLink {
  id: SiteChromeSiteId;
  label: string;
  href: string;
}

export interface SiteChrome {
  version: number;
  organization: Record<SiteChromeLocale, string>;
  commonLinks: CommonLink[];
  sites: SiteLink[];
}

/**
 * 共通の下の帯の中身。
 * 複数の repo で同じ中身を保つため、この JSON は整形せずそのまま写す。
 */
export const SITE_CHROME = data as SiteChrome;

/** 帯の年の表示に使う。定数で書かない（試験では時計を固定する）。 */
export function siteChromeYear(now: Date = new Date()): number {
  return now.getFullYear();
}

/** 帯の「© <年> <会社名>」の会社名。 */
export function siteChromeOrganization(locale: SiteChromeLocale): string {
  return SITE_CHROME.organization[locale];
}

/** 今の lang の共通 link。並びは JSON のまま。 */
export function commonLinksFor(
  locale: SiteChromeLocale
): Array<{ id: string; label: string; href: string }> {
  return SITE_CHROME.commonLinks.map((link) => ({
    id: link.id,
    label: link.label[locale],
    href: link.href[locale],
  }));
}

/** サイト切替の 1 本。URL の持ち主は JSON だけ。 */
export function siteLinkFor(id: SiteChromeSiteId): SiteLink {
  const site = SITE_CHROME.sites.find((candidate) => candidate.id === id);
  if (!site) throw new Error(`site-chrome.json に site ${id} が無い`);
  return site;
}
