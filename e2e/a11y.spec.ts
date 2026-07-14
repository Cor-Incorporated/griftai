import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const accessibilityPages = [
  '/',
  '/pricing/',
  '/team-beta/',
  '/estimate-audit/',
  '/faq/',
  '/contact/',
];

async function prepareForAccessibilityScan(page: Page, path: string) {
  await page.goto(path);

  // Scroll behavior is covered by smoke tests. Axe scans the full DOM, so run
  // every page against a stable final frame instead of a transition midpoint.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        scroll-behavior: auto !important;
        transition: none !important;
      }
      .section-animate,
      .fade-in-section,
      .stagger-children > * {
        opacity: 1 !important;
        transform: none !important;
      }
    `,
  });

  await page.mouse.move(0, 0);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
}

async function expectNoAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe('Accessibility — WCAG 2.2 AA', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of accessibilityPages) {
    test(`${path} has no automated WCAG A/AA violations`, async ({ page }) => {
      await prepareForAccessibilityScan(page, path);
      await expectNoAccessibilityViolations(page);
    });
  }
});
