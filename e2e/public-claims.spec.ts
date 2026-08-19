import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const viewportWidths = [375, 768, 1280, 1440] as const;
const evidenceDirectory = process.env.NAGI_SCREENSHOT_DIR;

test.describe('public claim parity', () => {
  for (const width of viewportWidths) {
    test(`${width}px keeps bounded claims visible without overflow`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto('/automation-ai-develop-estimate/');

      expect(response?.status()).toBe(200);
      await expect(
        page.locator('[data-public-claim-id="PUB-COLUMN-GENERAL-BOUNDARY"]')
      ).toBeVisible();
      await expect(page.locator('[data-public-claim-id="PUB-COLUMN-BETA-SCOPE"]')).toBeVisible();
      await expect(page.locator('[data-public-claim-id="PUB-COLUMN-HUMAN-FINAL"]')).toBeVisible();
      await expect(page.getByText('人間が承認した情報だけを登録・共有する運用')).toBeVisible();

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);

      const firstMainLink = page.locator('main a:visible').first();
      await firstMainLink.focus();
      await expect(firstMainLink).toBeFocused();

      const body = await page.locator('body').innerText();
      expect(body).not.toMatch(/瞬時|専門的な知識がなくても|自動で起票/);

      const screenshotPath = evidenceDirectory
        ? join(evidenceDirectory, `public-claims-${width}.png`)
        : testInfo.outputPath(`public-claims-${width}.png`);
      if (evidenceDirectory) mkdirSync(evidenceDirectory, { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
    });
  }

  test('top, FAQ, and Team Beta keep reference and human-final boundaries', async ({ page }) => {
    const pages = [
      { path: '/', text: 'PUB-HOME-HUMAN-FINAL' },
      { path: '/faq/', text: 'PUB-FAQ-HUMAN-FINAL' },
      { path: '/team-beta/', text: 'PUB-TEAM-BETA-HUMAN-FINAL' },
    ];

    for (const target of pages) {
      await page.goto(target.path);
      const registry = await page.locator('[data-public-claim-registry]').textContent();
      expect(registry).not.toBeNull();
      expect(
        JSON.parse(registry ?? '{}').claims.map((claim: { id: string }) => claim.id)
      ).toContain(target.text);
      await expect(page.locator('body')).toContainText('最終');
      await expect(page.locator('body')).toContainText(/人間|担当者/);
    }
  });
});
