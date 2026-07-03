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
    main: [],
    cta: [
      {
        label: 'Team Betaについて相談する',
        href: 'https://cor-jp.com/contact/',
        variant: 'primary',
      },
    ],
  },

  /**
   * Footer Navigation
   * Organized into 5 columns: Product, Solutions, Resources, Company, Legal
   */
  footer: {
    product: [
      { label: 'トップ', href: '/' },
      { label: 'Team Beta', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'コラム', href: '/column/' },
      { label: 'お問い合わせ', href: 'https://cor-jp.com/contact/' },
    ],
    solutions: [
      { label: '見積根拠の整理', href: '/#proof' },
      { label: 'チーム共有', href: '/#value' },
      { label: 'Estimate Audit', href: '/#scenarios' },
      { label: '導入の流れ', href: '/#flow' },
    ],
    resources: [
      { label: 'プライベートベータ', href: '/#hero' },
      { label: '提供条件', href: '/pricing' },
      { label: '利用規約', href: '/terms' },
      { label: 'プライバシー', href: '/privacy' },
    ],
    company: [
      { label: 'Cor.株式会社', href: 'https://cor-jp.com/' },
      { label: '会社情報', href: 'https://cor-jp.com/about/' },
      { label: 'お問い合わせ', href: 'https://cor-jp.com/contact/' },
      { label: 'GitHub', href: 'https://github.com/Cor-Incorporated' },
    ],
    legal: [
      { label: 'プライバシーポリシー', href: '/privacy' },
      { label: '利用規約', href: '/terms' },
    ],
  },
};
