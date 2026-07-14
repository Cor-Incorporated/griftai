import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config';
import { releaseMetadataIntegration } from './src/integrations/release-metadata';

const siteUrl = process.env.SITE_URL || siteConfig.url;

export default defineConfig({
  site: siteUrl,
  integrations: [
    releaseMetadataIntegration(),
    mdx(),
    icon(),
    sitemap({
      filter: (page) => {
        const allowedPaths = new Set([
          '/',
          '/pricing/',
          '/team-beta/',
          '/estimate-audit/',
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
