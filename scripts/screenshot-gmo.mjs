import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:4321';
const OUT = '/tmp/gmo-screenshots';

const targets = [
  { url: '/', name: 'top-desktop', viewport: { width: 1280, height: 800 } },
  { url: '/', name: 'top-mobile', viewport: { width: 390, height: 844 } },
  { url: '/column/', name: 'column-list-desktop', viewport: { width: 1280, height: 800 } },
  { url: '/column/', name: 'column-list-mobile', viewport: { width: 390, height: 844 } },
  {
    url: '/requirement-definition-ai/',
    name: 'column-article-desktop',
    viewport: { width: 1280, height: 800 },
  },
  {
    url: '/requirement-definition-ai/',
    name: 'column-article-mobile',
    viewport: { width: 390, height: 844 },
  },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: t.viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${t.url}`, { waitUntil: 'networkidle' });
  // Trigger scroll animations and wait
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const path = `${OUT}/${t.name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`✓ ${path}`);
  await ctx.close();
}
await browser.close();
