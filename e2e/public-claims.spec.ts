import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const viewportWidths = [375, 768, 1280, 1440] as const;
const evidenceDirectory = process.env.NAGI_SCREENSHOT_DIR;
const publicClaimCatalog = JSON.parse(
  readFileSync(new URL('../src/data/public-claims.json', import.meta.url), 'utf8')
) as {
  claims: Array<{ id: string; text: string; jsonLdQuestion?: string }>;
  routes: Array<{ url: string; seoClaimId: string; bodyClaimIds: string[] }>;
};

function normalizeClaimText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

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

  test('all public routes bind classified body claims to visible exact text', async ({ page }) => {
    const claimsById = new Map(publicClaimCatalog.claims.map((claim) => [claim.id, claim]));

    for (const route of publicClaimCatalog.routes) {
      const response = await page.goto(route.url);
      expect(response?.status(), route.url).toBe(200);

      const registries = page.locator('[data-public-claim-registry]');
      await expect(registries, `${route.url}: registry count`).toHaveCount(1);
      const registry = JSON.parse((await registries.textContent()) ?? '{}');
      const expectedRegistryIds = [...new Set([route.seoClaimId, ...route.bodyClaimIds])].sort();
      const renderedRegistryIds = registry.claims.map((claim: { id: string }) => claim.id).sort();
      expect(renderedRegistryIds, `${route.url}: registry IDs`).toEqual(expectedRegistryIds);

      await page.locator('details').evaluateAll((elements) => {
        for (const element of elements) element.setAttribute('open', '');
      });

      const bodyMarkers = page.locator('[data-public-claim-id]');
      const bodyMarkerIds = await bodyMarkers.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-public-claim-id'))
      );
      expect([...new Set(bodyMarkerIds)].sort(), `${route.url}: body marker IDs`).toEqual(
        [...route.bodyClaimIds].sort()
      );

      for (const claimId of route.bodyClaimIds) {
        const claim = claimsById.get(claimId);
        expect(claim, `${route.url}: known claim ${claimId}`).toBeDefined();
        const markers = page.locator(`[data-public-claim-id="${claimId}"]`);
        await expect(markers, `${route.url}: marker ${claimId}`).toHaveCount(1);
        for (const marker of await markers.all()) {
          await expect(marker, `${route.url}: visible marker ${claimId}`).toBeVisible();
          expect(
            normalizeClaimText(await marker.innerText()),
            `${route.url}: text ${claimId}`
          ).toBe(normalizeClaimText(claim?.text ?? ''));
          if (claim?.jsonLdQuestion) {
            const details = marker.locator('xpath=ancestor::details[1]');
            await expect(details, `${route.url}: question context ${claimId}`).toHaveCount(1);
            await expect(details.locator('summary').first()).toContainText(claim.jsonLdQuestion);
          }
        }
      }
    }
  });
});
