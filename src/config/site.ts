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
  'Griftは、エンジニアのgit履歴から「確かめられる事実」を取り出すOSSのツールです。点数や順位はつけず、誰が実行しても同じ結果になり、受け取った側が検算できます。人材紹介会社・SESの営業が推薦の理由を根拠とともに伝えるときや、自社開発企業の採用担当が、候補者本人が共有した記録から、どんな仕事をしてきたかを確かめるときに使えます。';

/** Production URL of your site (used for sitemap, RSS, canonical URLs) */
export const url = import.meta.env.SITE_URL || 'https://griftai.org';

/** Author name for meta tags and copyright */
export const author = import.meta.env.SITE_AUTHOR || 'Cor.株式会社';

/** Path to logo file (relative to /public) */
export const logo = '/grift-mark.jpg';

/** Path to Open Graph image (relative to /public). PNG 版を既定にする
 * （SVG 版 /grift-og.svg は og:image 非対応のクローラ向けフォールバックとして残置） */
export const ogImage = '/grift-og.png';

/** Social media links */
export const social: SocialLinks = {
  twitter: 'https://x.com/cor_terisuke',
  github: 'https://github.com/Cor-Incorporated',
};

/**
 * Grift CLI（OSS）の公開情報。LP・FAQ・構造化データ・llms.txt の共通の出典。
 * 版を上げたら version / releasedOn を PyPI の公開日（JST）に合わせて更新する。
 */
export const griftCli = {
  github: 'https://github.com/Cor-Incorporated/grift-cli',
  pypi: 'https://pypi.org/project/grift-cli/',
  norms: 'https://github.com/Cor-Incorporated/grift-cli/blob/main/docs/norms.md',
  metricsGuide: 'https://github.com/Cor-Incorporated/grift-cli/blob/main/docs/metrics-guide.md',
  packageName: 'grift-cli',
  installCommand: 'pipx install grift-cli',
  version: '0.8.0',
  releasedOn: '2026-10-26',
  license: 'MIT',
  pythonRequires: '3.11以上',
} as const;

/** Grift の思想を書いた代表・寺田康佑の記事。トップ・ストーリー・フッター・llms.txt が参照する。 */
export const griftArticles = [
  {
    platform: 'Qiita',
    url: 'https://qiita.com/terisuke/items/c6bb68b3af0db3d43bb1',
    title: 'Git履歴を技量スコアにせず、検算できるCLIを作った',
    author: '寺田康佑',
  },
  {
    platform: 'note',
    url: 'https://note.com/cor_instrument/n/nd58ba0955317',
    title: 'AI時代のプロジェクトをどう評価するのか',
    author: '寺田康佑',
  },
] as const;

/** LP に載せている情報の基準日。内容を更新したら合わせて更新する。 */
export const contentAsOf = '2026-10-26';

/**
 * Legal configuration for privacy policy and terms pages.
 * lastUpdated は /privacy・/terms の「最終更新日」の出典。2026-10 改訂案は顧問弁護士の確認待ち
 * （planning/blueprint-docs/08-legal-revision-2026-10-review.md）で、公開日が決まったら合わせて更新する。
 */
export const legal: LegalConfig = {
  privacyEmail: corCta.griftTrial('grift-legal-privacy'),
  legalEmail: corCta.griftTrial('grift-legal-terms'),
  lastUpdated: '2026-10-20',
};
