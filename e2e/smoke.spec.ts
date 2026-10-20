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
    // 2026-10 以降、LP が送る intent は grift-team-beta（Grift のテスト導入・CLI の相談）だけ。
    expect(href).toMatch(/intent=grift-team-beta/);
    expect(href).toContain('source=');
    expect(href).toContain('utm_source=grift');
  });

  test('homepage contact CTAs use Cor AI reception', async ({ page }) => {
    const contactLinks = page.locator('a[href*="cor-jp.com/contact/"]');
    const hrefs = await contactLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? '')
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toContain('https://cor-jp.com/contact/chat?');
    }
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

  test('contact page provides AI reception and phone CTAs', async ({ page }) => {
    await page.goto('/contact/');

    const aiReception = page.getByRole('link', { name: 'Cor.株式会社のAI受付へ' });
    await expect(aiReception).toHaveAttribute(
      'href',
      /https:\/\/cor-jp\.com\/contact\/chat\?intent=grift-team-beta/
    );

    const phone = page.getByRole('link', { name: '電話（050-1792-9351）で相談する' });
    await expect(phone).toHaveAttribute('href', 'tel:05017929351');
  });
});

test.describe('Grift CLI positioning (2026-10)', () => {
  test('home shows the CLI usage example and links to the public repository', async ({ page }) => {
    await page.goto('/');
    const demo = page.locator('#product-demo');
    await expect(demo).toBeVisible();
    await expect(demo).toContainText('pipx install grift-cli');
    await expect(demo).toContainText('grift verify');

    const github = page.locator('#hero a[href="https://github.com/Cor-Incorporated/grift-cli"]');
    await expect(github.first()).toBeVisible();
  });

  test('home no longer offers the withdrawn plans or contract-dev CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Team Beta')).toHaveCount(0);
    await expect(page.getByText('Estimate Audit')).toHaveCount(0);
    await expect(page.getByText('プライベートベータ')).toHaveCount(0);
    await expect(page.locator('a[href*="intent=grift-paid-trial"]')).toHaveCount(0);
    await expect(page.locator('a[href*="intent=estimate-audit"]')).toHaveCount(0);
    await expect(page.locator('a[href*="intent=contract-dev"]')).toHaveCount(0);
    await expect(page.locator('a[href="/team-beta/"], a[href="/estimate-audit/"]')).toHaveCount(0);
  });

  test('agency CTA reads 自社でテストしてみる, not 試行', async ({ page }) => {
    for (const path of ['/', '/pricing/', '/faq/', '/contact/']) {
      await page.goto(path);
      await expect(page.getByText(/試行/)).toHaveCount(0);
    }
    await page.goto('/');
    const heroCta = page.locator('#hero a[href*="intent=grift-team-beta"]');
    await expect(heroCta).toHaveText('自社でテストしてみる');
  });

  test('home links to the articles on Grift philosophy', async ({ page }) => {
    await page.goto('/');
    for (const url of [
      'https://qiita.com/terisuke/items/c6bb68b3af0db3d43bb1',
      'https://note.com/cor_instrument/n/nd58ba0955317',
    ]) {
      await expect(page.locator(`#value a[href="${url}"]`)).toBeVisible();
      await expect(page.locator(`footer a[href="${url}"]`)).toHaveCount(1);
    }
  });

  test('the reading section leads to the articles and columns before pricing', async ({ page }) => {
    await page.goto('/');
    const reading = page.locator('#reading');
    await expect(reading.locator('a[href^="https://qiita.com/"]')).toHaveCount(1);
    await expect(reading.locator('a[href^="https://note.com/"]')).toHaveCount(1);
    await expect(reading.locator('a[href="/column/"]')).toHaveCount(1);
    const readingTop = (await reading.boundingBox())?.y ?? Infinity;
    const pricingTop = (await page.locator('#pricing').boundingBox())?.y ?? -Infinity;
    expect(readingTop).toBeLessThan(pricingTop);
  });

  test('header links to the columns', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      await page.locator('#mobile-menu-button').click();
      await expect(page.locator('#mobile-menu a[href="/column/"]')).toBeVisible();
    } else {
      await expect(page.locator('#site-header a[href="/column/"]')).toBeVisible();
    }
  });

  test('tablet width uses the menu button instead of squeezing the header links', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1000 });
    await page.goto('/');
    await expect(page.locator('#mobile-menu-button')).toBeVisible();
    await expect(page.locator('#site-header a[href="/column/"]')).toBeHidden();
  });
});

test.describe('Grift stories (fictional) and card links', () => {
  const storyPaths = [
    '/column/story-recommendation-reason/',
    '/column/story-java-5-years/',
    '/column/story-ai-activity/',
    '/column/story-score-cutoff/',
  ];

  test('each problem card on the top page links to its story', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page
      .locator('#problem a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs).toEqual(storyPaths);
  });

  test('story pages say they are fiction and link back to the columns', async ({ page }) => {
    for (const path of storyPaths) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(
        page.getByText('この記事は、よくある場面をもとにした架空の物語です。')
      ).toBeVisible();
      await expect(page.locator('article a[href="/column/"]').first()).toBeVisible();
    }
  });

  test('the column index lists the stories', async ({ page }) => {
    await page.goto('/column/');
    for (const path of storyPaths) {
      await expect(page.locator(`#story-heading ~ ul a[href="${path}"]`)).toHaveCount(1);
    }
  });

  test('the sitemap includes the stories', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    for (const path of storyPaths) {
      expect(sitemap).toContain(`${path}</loc>`);
    }
  });

  test('pricing and company cards respond to a click anywhere on the card', async ({ page }) => {
    // カードの説明文のあたり（中央）を押しても、リンクに当たることを確かめる。
    const cards = [
      { path: '/', selector: '#pricing article' },
      { path: '/pricing/', selector: 'article:has(a[href*="intent=grift-team-beta"])' },
      { path: '/', selector: '#social-proof li:has(a[href*="madeinlocal.jp"])' },
      { path: '/', selector: '#social-proof li:has(a[href*="engineer-cafe-navigator"])' },
    ];
    for (const { path, selector } of cards) {
      await page.goto(path);
      const card = page.locator(selector).first();
      await card.scrollIntoViewIfNeeded();
      const hitsLink = await card.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        return Boolean(hit?.closest('a[href]'));
      });
      expect(hitsLink, `${path} ${selector}`).toBe(true);
    }
  });
});
