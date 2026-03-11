/**
 * Site Configuration
 *
 * @description
 * Core site metadata and branding settings.
 * These values can be customized via environment variables or by editing the defaults below.
 */

import type { LegalConfig, SocialLinks } from '../lib/types';

/** Site name displayed in header, footer, and meta tags */
export const name = import.meta.env.SITE_NAME || 'Grift';

/** Site description for SEO and meta tags */
export const description =
  import.meta.env.SITE_DESCRIPTION ||
  'AI開発の見積と提案を、GitHub実績と市場証拠で支える日本市場向けベータ版インテリジェンスプラットフォーム';

/** Production URL of your site (used for sitemap, RSS, canonical URLs) */
export const url = import.meta.env.SITE_URL || 'https://griftai.org';

/** Author name for meta tags and copyright */
export const author = import.meta.env.SITE_AUTHOR || 'Cor.inc';

/** Path to logo file (relative to /public) */
export const logo = '';

/** Path to Open Graph image (relative to /public) */
export const ogImage = '/grift-og.svg';

/** Social media links */
export const social: SocialLinks = {
  github: 'https://github.com/Cor-Incorporated',
};

/** Legal configuration for privacy policy and terms pages */
export const legal: LegalConfig = {
  privacyEmail: 'https://cor-jp.com/contact/',
  legalEmail: 'https://cor-jp.com/contact/',
  lastUpdated: '2026-03-12',
};
