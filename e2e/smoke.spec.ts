import { test, expect } from '@playwright/test';
import { cliKeyNames, keyNamePattern } from '../scripts/lib/cli-key-names.mjs';
import { tepComparisons, tepTerms } from '../src/config/tep';

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
    { path: '/tep/', titlePattern: /TEP/ },
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
    for (const path of ['/', '/tep/', '/pricing/', '/faq/', '/contact/']) {
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

test.describe('Article author, key points and the downloadable deck (2026-10)', () => {
  const columnPaths = ['/ai-estimate-automation/', '/requirement-definition-ai/'];
  const deckHref = '/downloads/grift-cli-overview.pdf';

  test('the deck PDF is served', async ({ request }) => {
    const response = await request.get(deckHref);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
  });

  test('the top page offers the deck from the hero and the final CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`#hero a[href="${deckHref}"]`)).toBeVisible();
    await expect(
      page.locator(`#cta [data-testid="document-download"] a[href="${deckHref}"]`)
    ).toHaveCount(1);
  });

  test('pricing, faq, contact and the TEP page end with the deck download', async ({ page }) => {
    for (const path of ['/pricing/', '/faq/', '/contact/', '/tep/']) {
      await page.goto(path);
      await expect(
        page.locator(`[data-testid="document-download"] a[href="${deckHref}"]`)
      ).toHaveCount(1);
    }
  });

  test('columns show key points, the author and the deck', async ({ page }) => {
    for (const path of columnPaths) {
      await page.goto(path);
      await expect(page.getByTestId('key-points')).toContainText('この記事でわかること');
      const author = page.getByTestId('article-author');
      await expect(author).toContainText('寺田 康佑');
      await expect(author).toContainText('Cor.株式会社');
      await expect(author.locator('a[href="https://note.com/cor_instrument"]')).toHaveCount(1);
      await expect(
        page.locator(`[data-testid="document-download"] a[href="${deckHref}"]`)
      ).toHaveCount(1);
    }
  });

  test('stories show the author and the deck', async ({ page }) => {
    await page.goto('/column/story-java-5-years/');
    await expect(page.getByTestId('article-author')).toContainText('寺田 康佑');
    await expect(
      page.locator(`[data-testid="document-download"] a[href="${deckHref}"]`)
    ).toHaveCount(1);
  });

  test('the article author is the founder Person shared with cor-jp.com', async ({ page }) => {
    await page.goto('/column/story-java-5-years/');
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
    const article = blocks.find((block) => block['@type'] === 'Article');
    expect(article?.author?.['@id']).toBe('https://cor-jp.com/#person-kousuke-terada');
    expect(article?.publisher).toEqual({ '@id': 'https://griftai.org/#organization' });
    const person = blocks.find((block) => block['@type'] === 'Person');
    expect(person?.sameAs).toContain('https://note.com/cor_instrument');
  });
});

test.describe('TEP page and plain words (2026-10)', () => {
  // 本文に出さない CLI のキー名。ソースの検査（scripts/check-plain-terms.mjs）と同じ規則で、config/tep.ts の値から作る
  const keyNames = cliKeyNames(
    [...tepTerms, ...tepComparisons].flatMap((item) => [
      item.cli,
      ...('cliNote' in item && item.cliNote ? [item.cliNote] : []),
    ])
  );

  test('the TEP page follows the reader-first outline in order', async ({ page }) => {
    const response = await page.goto('/tep/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('git履歴から、確かめられる事実を取り出す方法');
    const ids = await page
      .locator('main section[id]')
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(ids).toEqual(['why', 'what', 'how', 'not', 'compare', 'use', 'next']);
    // 架空の例は、架空であることを先に書く
    await expect(page.locator('#use figure figcaption')).toContainText('架空の例です。');
  });

  test('the glossary is folded and shows CLI names in the layout for each width', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/tep/');
    const terms = page.locator('details#terms');
    await expect(terms).not.toHaveAttribute('open', /.*/);
    await terms.locator('summary').click();
    // スマホでは表の代わりに積んだ一覧を見せる。見えている方に CLI の名前とサイトの用語がある
    const shown = isMobile ? terms.locator('dl') : terms.locator('table');
    await expect(shown).toBeVisible();
    await expect(shown).toContainText('surface_profile');
    await expect(shown).toContainText('テスト併修率');
  });

  test('a link to /tep/#terms opens the glossary', async ({ page }) => {
    await page.goto('/tep/#terms');
    await expect(page.locator('details#terms')).toHaveAttribute('open', '');
  });

  test('the TEP page names the founder as the Article author', async ({ page }) => {
    await page.goto('/tep/');
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent ?? '{}')));
    const article = blocks.find((block) => block['@type'] === 'Article');
    expect(article?.author?.['@id']).toBe('https://cor-jp.com/#person-kousuke-terada');
    await expect(page.getByTestId('article-author')).toContainText('寺田 康佑');
  });

  test('the top page and the FAQ link to the TEP page', async ({ page, isMobile }) => {
    await page.goto('/');
    await expect(page.locator('#about a[href="/tep/"]')).toHaveCount(1);
    await expect(page.locator('#product a[href="/tep/#terms"]')).toHaveCount(1);
    if (isMobile) {
      await page.locator('#mobile-menu-button').click();
      await expect(page.locator('#mobile-menu a[href="/tep/"]')).toBeVisible();
    } else {
      await expect(page.locator('#site-header a[href="/tep/"]')).toBeVisible();
    }
    await page.goto('/faq/');
    await expect(page.locator('#about-grift a[href="/tep/"]')).toHaveCount(1);
  });

  test('the top page lists observations in plain words', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#product')).toContainText(
      'テストも一緒に変えた割合（テスト併修率）'
    );
  });

  test('published pages other than /tep/ show no CLI key names', async ({ page, request }) => {
    expect(keyNames.length).toBeGreaterThan(0);
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)]
      .map((match) => match[1])
      .filter((path) => path !== '/tep/');
    expect(paths).toContain('/');
    expect(paths).toContain('/faq/');
    for (const path of paths) {
      await page.goto(path);
      // body の文字には、ページ本文と body の中の構造化データ（トップの SoftwareApplication など）が入る
      const text = (await page.locator('body').textContent()) ?? '';
      for (const name of keyNames) {
        expect(text, `${path} shows ${name}`).not.toMatch(keyNamePattern(name));
      }
    }
  });

  test('llms.txt and the sitemap list the TEP page', async ({ request }) => {
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toContain('/tep/');
    expect(llms).toContain('| テスト併修率 | テストも一緒に変えた割合 | test co-change |');
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('/tep/</loc>');
  });
});

test.describe('First view for agency sales (2026-10-26)', () => {
  test('the first view names the reader and offers the trial and the deck', async ({ page }) => {
    // 広告や直接アクセスで来た人は、最初の画面だけを見て残るかどうかを決める
    await page.goto('/');
    const viewportHeight = page.viewportSize()?.height ?? 0;
    const hero = page.locator('#hero');
    await expect(hero.locator('.section-kicker').first()).toHaveText(
      '人材紹介会社・SESの営業の方へ'
    );
    for (const locator of [
      hero.locator('a[href*="intent=grift-team-beta"]'),
      hero.locator('a[href="/downloads/grift-cli-overview.pdf"]'),
    ]) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box, 'CTA is rendered').not.toBeNull();
      expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(viewportHeight);
    }
  });

  test('the CLI usage example sits under the observations, not in the hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero #product-demo')).toHaveCount(0);
    await expect(page.locator('#product #product-demo')).toHaveCount(1);
  });

  test('the page ends with one closing CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="source=grift-lp-final"]')).toHaveCount(1);
  });
});
