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

  test('primary CTAs include Cor intent query params', async ({ page }) => {
    // Header nav CTA is hidden on mobile viewports, so match visible CTAs only
    const intentCtas = page.locator('a[href*="intent="]:visible');
    await expect(intentCtas.first()).toBeVisible();

    const href = await intentCtas.first().getAttribute('href');
    expect(href).toMatch(/intent=grift-team-beta|intent=grift-paid-trial|intent=estimate-audit/);
    expect(href).toContain('source=');
    expect(href).toContain('utm_source=grift');
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

  test('page does not create horizontal overflow', async ({ page }) => {
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });

  test('reduced motion still reveals animated content', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const hiddenAnimated = await page
      .locator('.section-animate, .fade-in-section')
      .evaluateAll(
        (elements) => elements.filter((element) => getComputedStyle(element).opacity === '0').length
      );

    expect(hiddenAnimated).toBe(0);
    await context.close();
  });
});

test.describe('Key pages load correctly', () => {
  const pages = [
    { path: '/', titlePattern: /Grift/ },
    { path: '/pricing/', titlePattern: /料金|Grift/ },
    { path: '/team-beta/', titlePattern: /Team Beta|Grift/ },
    { path: '/estimate-audit/', titlePattern: /Estimate Audit|Grift/ },
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

test.describe('Phase 2 product pages', () => {
  test('team-beta page CTA uses grift-team-beta intent', async ({ page }) => {
    await page.goto('/team-beta/');
    const cta = page.locator('a[href*="intent=grift-team-beta"]').first();
    await expect(cta).toBeVisible();
    await expect(page.locator('#site-header a[href="/team-beta"]')).toBeVisible();
  });

  test('estimate-audit page CTA uses estimate-audit intent', async ({ page }) => {
    await page.goto('/estimate-audit/');
    const cta = page.locator('a[href*="intent=estimate-audit"]').first();
    await expect(cta).toBeVisible();
  });

  test('home shows product demo placeholder without contract-dev CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#product-demo-placeholder')).toBeVisible();
    const contractDev = page.locator('a[href*="intent=contract-dev"]');
    await expect(contractDev).toHaveCount(0);
  });
});
