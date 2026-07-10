/**
 * Site Configuration
 *
 * @description
 * Core site metadata and branding settings.
 * These values can be customized via environment variables or by editing the defaults below.
 */

import type { LegalConfig, SocialLinks } from '../lib/types';
import { corCta } from '../lib/cor-cta';

/** Site name displayed in header, footer, and meta tags */
export const name = import.meta.env.SITE_NAME || 'Grift';

/** Site description for SEO and meta tags */
export const description =
  import.meta.env.SITE_DESCRIPTION ||
  'Griftは、受託開発チームが「なぜこの金額なのか」を説明できるよう、参考見積と見積根拠を整理するAI見積支援ツールです。';

/** Production URL of your site (used for sitemap, RSS, canonical URLs) */
export const url = import.meta.env.SITE_URL || 'https://griftai.org';

/** Author name for meta tags and copyright */
export const author = import.meta.env.SITE_AUTHOR || 'Cor.株式会社';

/** Path to logo file (relative to /public) */
export const logo = '/grift-mark.jpg';

/** Path to Open Graph image (relative to /public) */
export const ogImage = '/grift-og.svg';

/** Social media links */
export const social: SocialLinks = {
  github: 'https://github.com/Cor-Incorporated',
};

/** Legal configuration for privacy policy and terms pages */
export const legal: LegalConfig = {
  privacyEmail: corCta.teamBeta('grift-legal-privacy'),
  legalEmail: corCta.teamBeta('grift-legal-terms'),
  lastUpdated: '2026-03-12',
};
