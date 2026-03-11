/**
 * Navigation Configuration
 *
 * @description
 * Centralized navigation configuration for header and footer.
 * All navigation items are defined here for consistency and easy maintenance.
 *
 * Items with a `feature` property will only be shown if that feature is enabled
 * in the site config's feature flags.
 */

import type { Navigation } from '../lib/types';

export const navigation: Navigation = {
  /**
   * Header Navigation
   * - main: Primary navigation links
   * - cta: Call-to-action buttons on the right
   */
  header: {
    main: [
      { label: '課題', href: '/#problem' },
      { label: '仕組み', href: '/#solution' },
      { label: '料金', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
    ],
    cta: [
      { label: 'Cor.inc', href: 'https://cor-jp.com/', variant: 'ghost' },
      { label: 'ベータ相談をする', href: 'https://cor-jp.com/contact/', variant: 'primary' },
    ],
  },

  /**
   * Footer Navigation
   * Organized into 5 columns: Product, Solutions, Resources, Company, Legal
   */
  footer: {
    product: [
      { label: 'トップ', href: '/' },
      { label: '料金', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: '問い合わせ', href: 'https://cor-jp.com/contact/' },
    ],
    solutions: [
      { label: 'AI開発見積', href: '/#proposal' },
      { label: 'GitHub実績分析', href: '/#github-intelligence' },
      { label: '市場 evidence', href: '/#market-evidence' },
      { label: '運用と精度改善', href: '/#intelligence-loop' },
    ],
    resources: [
      { label: '日本市場向け Beta', href: '/#hero' },
      { label: 'ベータ pricing', href: '/pricing' },
      { label: '利用規約', href: '/terms' },
      { label: 'プライバシー', href: '/privacy' },
    ],
    company: [
      { label: 'Cor.inc', href: 'https://cor-jp.com/' },
      { label: 'Cor 会社情報', href: 'https://cor-jp.com/about/' },
      { label: 'Cor お問い合わせ', href: 'https://cor-jp.com/contact/' },
      { label: 'GitHub', href: 'https://github.com/Cor-Incorporated' },
    ],
    legal: [
      { label: 'プライバシーポリシー', href: '/privacy' },
      { label: '利用規約', href: '/terms' },
    ],
  },
};
