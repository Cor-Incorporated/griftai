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
import { corCta, getCorUrl } from '../lib/cor-cta';
import { griftArticles, griftCli } from './site';

export const navigation: Navigation = {
  /**
   * Header Navigation
   * - main: Primary navigation links
   * - cta: Call-to-action buttons on the right
   */
  header: {
    main: [
      { label: 'Griftとは', href: '/#about' },
      { label: '3つの約束', href: '/#value' },
      { label: '使い方', href: '/#flow' },
      { label: '料金', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'GitHub', href: griftCli.github },
    ],
    cta: [
      {
        label: 'テストしてみる',
        href: corCta.griftTrial('grift-nav-header'),
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
      { label: '料金と提供状況', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'コラム', href: '/column/' },
      { label: 'GitHub（grift-cli）', href: griftCli.github },
      { label: 'PyPI（grift-cli）', href: griftCli.pypi },
      { label: 'お問い合わせ', href: corCta.griftTrial('grift-nav-footer-product') },
    ],
    solutions: [
      { label: '紹介会社・SESの営業の方へ', href: '/#for-sales' },
      { label: 'エンジニアの方へ', href: '/#for-engineers' },
      { label: '推薦までの流れ', href: '/#flow' },
      { label: '検証の公開', href: '/#proof' },
    ],
    resources: [
      { label: '利用規範（norms）', href: griftCli.norms },
      { label: '指標の読み方', href: griftCli.metricsGuide },
      ...griftArticles.map((article) => ({
        label: `Griftの思想（${article.platform}）`,
        href: article.url,
      })),
      { label: '利用規約', href: '/terms' },
      { label: 'プライバシー', href: '/privacy' },
    ],
    company: [
      { label: 'Cor.株式会社', href: getCorUrl('/') },
      { label: '会社概要', href: getCorUrl('/company/') },
      { label: 'お問い合わせ', href: corCta.griftTrial('grift-nav-footer-company') },
      { label: 'GitHub', href: 'https://github.com/Cor-Incorporated' },
    ],
    legal: [
      { label: 'プライバシーポリシー', href: '/privacy' },
      { label: '利用規約', href: '/terms' },
    ],
  },
};
