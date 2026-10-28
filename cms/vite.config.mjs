// CMS 管理画面のビルド（npm run build:cms）。公開サイトの Astro とは別の Vite ビルドで、出力は cms/dist。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { cmsSite } from '../src/config/cms-contract.ts';

const siteLogo = () => ({
  name: 'grift-site-logo',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'logo.svg',
      source: readFileSync(new URL('../public/logo.svg', import.meta.url)),
    });
  },
});

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: 'public',
  plugins: [siteLogo()],
  server: {
    host: 'localhost',
    port: cmsSite.devPort,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2500,
  },
});
