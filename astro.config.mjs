import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config';
import { publishedSlugs } from './scripts/lib/cms-publish.mjs';

const siteUrl = process.env.SITE_URL || siteConfig.url;

// Grift のストーリー（/column/<id>/）。src/content/stories の .md と1対1。
const storyPaths = readdirSync(new URL('./src/content/stories/', import.meta.url))
  .filter((file) => file.endsWith('.md'))
  .map((file) => `/column/${file.replace(/\.md$/, '')}/`);

const contentPaths = (dir, prefix) =>
  publishedSlugs(fileURLToPath(new URL(dir, import.meta.url))).map((slug) => `${prefix}${slug}/`);

export default defineConfig({
  site: siteUrl,
  // hover で内部リンクをプリフェッチし、ClientRouter と合わせて
  // ページ遷移をほぼ瞬時にする（滞在時間・体感速度の向上）
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    mdx(),
    icon(),
    sitemap({
      filter: (page) => {
        const allowedPaths = new Set([
          '/',
          '/tep/',
          '/pricing/',
          '/faq/',
          '/privacy/',
          '/terms/',
          '/contact/',
          // GMO 納品 SEO コンテンツ
          '/column/',
          '/ai-estimate-automation/',
          '/ai-tool-requirement-definition/',
          '/automation-ai-develop-estimate/',
          '/automation-tool-requirement/',
          '/basis-estimate-automation/',
          '/cost-ai-develop-estimate/',
          '/create-estimate-automation/',
          '/market-price-ai-develop/',
          '/requirement-definition-ai/',
          '/tool-upstream-process-ai/',
          '/articles/',
          '/news/',
          ...storyPaths,
          ...contentPaths('./src/content/articles/', '/articles/'),
          ...contentPaths('./src/content/news/', '/news/'),
        ]);

        const pathname = new URL(page).pathname;
        return allowedPaths.has(pathname);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
