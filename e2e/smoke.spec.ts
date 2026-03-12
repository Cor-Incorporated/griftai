import { test, expect } from '@playwright/test';

test.describe('Landing page smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Grift/);
  });

  test('hero section is visible with content', async ({ page }) => {
    const hero = page.locator('#hero');
    await expect(hero).toBeVisible();

    // Critical: detect opacity: 0 regression (the blank page bug)
    await expect(hero).toHaveCSS('opacity', '1');

    // Hero heading text is present
    const heading = hero.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test('all major sections become visible after scroll animations', async ({ page }) => {
    const sectionIds = [
      '#problem',
      '#agitation',
      '#value',
      '#product',
      '#flow',
      '#pricing',
      '#cta',
    ];

    for (const id of sectionIds) {
      const section = page.locator(id);
      // Scroll into view to trigger IntersectionObserver
      await section.scrollIntoViewIfNeeded();
      // Wait for animation class to apply (opacity transitions to 1)
      await expect(section).toHaveCSS('opacity', '1', { timeout: 3000 });
    }
  });

  test('no section stays at opacity 0 after full page scroll', async ({ page }) => {
    // Scroll to bottom to trigger all animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check all section-animate elements have become visible
    const sections = page.locator('.section-animate');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section).toHaveCSS('opacity', '1', { timeout: 2000 });
    }
  });

  test('fade-in-section elements become visible after scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const fadeIns = page.locator('.fade-in-section');
    const count = await fadeIns.count();

    for (let i = 0; i < count; i++) {
      const el = fadeIns.nth(i);
      await expect(el).toHaveCSS('opacity', '1', { timeout: 2000 });
    }
  });

  test('CTA buttons exist and at least one is visible', async ({ page }) => {
    const ctaLinks = page.locator('a[href*="contact"]:visible');
    // At least one CTA link should be visible (hero CTA, mid-page, or floating)
    await expect(ctaLinks.first()).toBeVisible();
  });

  test('navigation header is visible', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });
});

test.describe('Key pages load correctly', () => {
  const pages = [
    { path: '/', titlePattern: /Grift/ },
    { path: '/pricing/', titlePattern: /料金|Grift/ },
    { path: '/faq/', titlePattern: /質問|FAQ|Grift/ },
    { path: '/contact/', titlePattern: /相談|お問い合わせ|Grift/ },
  ];

  for (const { path, titlePattern } of pages) {
    test(`${path} loads with correct title`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(titlePattern);
    });
  }
});
