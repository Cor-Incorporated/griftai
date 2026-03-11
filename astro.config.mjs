import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config';

const siteUrl = process.env.SITE_URL || siteConfig.url;

export default defineConfig({
  site: siteUrl,
  integrations: [
    mdx(),
    icon(),
    sitemap({
      filter: (page) => {
        const allowedPaths = new Set([
          '/',
          '/pricing/',
          '/faq/',
          '/privacy/',
          '/terms/',
          '/contact/',
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
