import { test, expect } from '@playwright/test';
import { cliKeyNames, keyNamePattern } from '../scripts/lib/cli-key-names.mjs';
import { tepComparisons, tepTerms } from '../src/config/tep';
import siteChrome from '../src/config/site-chrome.json' with { type: 'json' };

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

  test('the first view does not wait for images and third-party scripts', async ({
    browser,
    isMobile,
    viewport,
  }) => {
    // 回線が遅いと、画像と外部スクリプト（GA4・Clarity）の読み込みが終わるまで window の load が来ない。
    // 2026-09-16〜10 月は、初回の表示処理が load を待っていたため、その間ヒーローが白いままで、
    // スマホのメニューも開かなかった。ここでは読み込みを終わらせずに、最初の画面が出ることを確かめる。
    const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
    const page = await context.newPage();
    await page.route(/\.(?:jpe?g|png|avif|webp|svg)(?:\?|$)/, () => {});
    await page.route(/googletagmanager\.com|clarity\.ms|cloudflareinsights\.com/, () => {});
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(await page.evaluate(() => document.readyState)).not.toBe('complete');
    await expect(page.locator('#hero')).toHaveCSS('opacity', '1', { timeout: 3000 });
    await expect(page.locator('#hero h1')).toBeVisible();

    if (isMobile) {
      await page.locator('#mobile-menu-button').click();
      await expect(page.locator('#mobile-menu')).toBeVisible({ timeout: 3000 });
    }
    expect(await page.evaluate(() => document.readyState)).not.toBe('complete');
    await context.close();
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
      links
        .filter((link) => !link.closest('nav[aria-label="サイト切替"]'))
        .map((link) => link.getAttribute('href') ?? '')
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

test.describe('First view for agency sales and in-house hiring teams (2026-10-26)', () => {
  test('the first view names the reader and offers the trial and the deck', async ({ page }) => {
    // 広告や直接アクセスで来た人は、最初の画面だけを見て残るかどうかを決める
    await page.goto('/');
    const viewportHeight = page.viewportSize()?.height ?? 0;
    const hero = page.locator('#hero');
    await expect(hero.locator('.section-kicker').first()).toHaveText(
      'エンジニアの紹介や採用に携わる方へ'
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
    '/column/story-inhouse-hiring-interview/',
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

  test('articles and news show published entries and hide drafts', async ({ page }) => {
    await page.goto('/articles/');
    await expect(page.getByRole('heading', { level: 1, name: '記事' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /gitの履歴から確かめられる事実を取り出す/ })
    ).toBeVisible();
    await expect(page.getByText('下書きの記事です')).toHaveCount(0);
    await expect(page.getByText('この下書きは公開ページに出ません。')).toHaveCount(0);

    const draftArticle = await page.goto('/articles/draft-article/');
    expect(draftArticle?.status()).toBe(404);

    await page.goto('/news/');
    await expect(page.getByRole('heading', { level: 1, name: 'お知らせ' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Grift CLIを公開しています/ })).toBeVisible();
    await expect(page.getByText('下書きのお知らせです')).toHaveCount(0);

    const draftNews = await page.goto('/news/draft-news/');
    expect(draftNews?.status()).toBe(404);

    await page.goto('/articles/git-history-facts/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'gitの履歴から確かめられる事実を取り出す'
    );
    await expect(page.getByTestId('article-author')).toContainText('寺田 康佑');
  });

  test('llms.txt and the sitemap list the TEP page', async ({ request }) => {
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toContain('/tep/');
    expect(llms).toContain('| テスト併修率 | テストも一緒に変えた割合 | test co-change |');
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('/tep/</loc>');
  });
});

test.describe('Analytics: tags only on the production host, events for CTAs and the deck', () => {
  const tagHosts = /googletagmanager\.com|google-analytics\.com|clarity\.ms/;
  // GA4 と Clarity の ID はコードに無く、ビルドの環境変数（PUBLIC_GA4_ID / PUBLIC_CLARITY_ID）にある。
  // このテストを動かす側にも、ビルドしたときと同じ値を渡す（CI は e2e-smoke ジョブがダミーの ID で作り直して渡す。
  // 手元: PUBLIC_GA4_ID=G-… PUBLIC_CLARITY_ID=… npm run build してから同じ値で npm run test:e2e）。
  // ID が無いビルドでは「ID あり」の検査を飛ばし、「ID なし」の検査（本番のホストでも何も出ない）を動かす。
  const ga4Id = process.env.PUBLIC_GA4_ID ?? '';
  const clarityId = process.env.PUBLIC_CLARITY_ID ?? '';
  const hasIds = ga4Id !== '' && clarityId !== '';

  // 手元のビルドを https://griftai.org/ として返す（ホスト名が本番のときの振る舞いを確かめるため）
  async function serveLocalBuildAsProductionHost(
    page: import('@playwright/test').Page,
    baseURL: string | undefined
  ): Promise<string[]> {
    const tagRequests: string[] = [];
    await page.route(tagHosts, async (route) => {
      tagRequests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    await page.route('https://griftai.org/**', async (route) => {
      const local = route
        .request()
        .url()
        .replace('https://griftai.org/', baseURL ?? '/');
      await route.fulfill({ response: await route.fetch({ url: local }) });
    });
    return tagRequests;
  }

  test('localhost loads neither GA4 nor Clarity', async ({ page }) => {
    // 手元の開発・CI の e2e・プレビューで開いたページを、本番のプロパティに送らない
    const tagRequests: string[] = [];
    page.on('request', (request) => {
      if (tagHosts.test(request.url())) tagRequests.push(request.url());
    });
    await page.goto('/');
    await page.waitForLoadState('load');
    expect(tagRequests).toEqual([]);
    expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  });

  test('IDs configured: the production host loads GA4 and Clarity with those IDs', async ({
    page,
    baseURL,
  }) => {
    if (process.env.REQUIRE_ANALYTICS_IDS === '1') {
      // CI で ID を渡すはずの実行。渡っていないときに skip すると、検査が動かないまま緑になる
      expect(
        { ga4Id, clarityId },
        'REQUIRE_ANALYTICS_IDS=1 なのに PUBLIC_GA4_ID / PUBLIC_CLARITY_ID がテストに渡っていない'
      ).toEqual({ ga4Id: expect.stringMatching(/^G-/), clarityId: expect.stringMatching(/./) });
    } else {
      test.skip(
        !hasIds,
        'PUBLIC_GA4_ID と PUBLIC_CLARITY_ID の両方を付けてビルドしたときだけ動かす（片方だけのときは「ID なし」も動かない）'
      );
    }
    const tagRequests = await serveLocalBuildAsProductionHost(page, baseURL);
    await page.goto('https://griftai.org/');
    await expect
      .poll(() => tagRequests.some((url) => url.includes(`gtag/js?id=${ga4Id}`)))
      .toBe(true);
    await expect
      .poll(() => tagRequests.some((url) => url.includes(`clarity.ms/tag/${clarityId}`)))
      .toBe(true);
    // タグを読み込むだけでは page_view は送られない。gtag('config', ID) が呼ばれていること
    const dataLayerEntries = await page.evaluate(() =>
      (window.dataLayer as unknown[]).map((entry) => Array.from(entry as ArrayLike<unknown>))
    );
    expect(dataLayerEntries).toContainEqual(['config', ga4Id]);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('IDs not configured: even the production host loads neither GA4 nor Clarity', async ({
    page,
    baseURL,
  }) => {
    test.skip(
      ga4Id !== '' || clarityId !== '',
      'ID を付けずにビルドしたときだけ動かす（片方だけのときは「ID あり」も動かない）'
    );
    const tagRequests = await serveLocalBuildAsProductionHost(page, baseURL);
    await page.goto('https://griftai.org/');
    await page.waitForLoadState('load');
    // 空の ID でタグを組み立てていない（gtag/js?id= や clarity.ms/tag/ の URL を作らない）。
    // タグは head の inline script が同期に読み込むので、load の時点でリクエストは出ている
    expect(tagRequests).toEqual([]);
    // ID が無くても、イベントの列（dataLayer）は用意する
    expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('clicks on the hero CTA and the deck are pushed as events', async ({ page }) => {
    await page.goto('/');
    // 外部の問い合わせ画面を開かず、ダウンロードもしない（記録だけを確かめる）
    await page.evaluate(() => {
      document.addEventListener('click', (event) => event.preventDefault());
    });
    await page.locator('#hero a[href*="intent=grift-team-beta"]').click();
    await page.locator('#hero a[href$=".pdf"]').click();

    const events = await page.evaluate(() =>
      (window.dataLayer as unknown[])
        .map((entry) => Array.from(entry as ArrayLike<unknown>))
        .filter((args) => args[0] === 'event')
    );
    expect(events).toContainEqual([
      'event',
      'cta_click',
      expect.objectContaining({
        cta_source: 'grift-lp-hero',
        cta_intent: 'grift-team-beta',
        cta_method: 'chat',
      }),
    ]);
    expect(events).toContainEqual([
      'event',
      'deck_download',
      expect.objectContaining({ file_name: 'grift-cli-overview.pdf', placement: 'hero' }),
    ]);
  });
});

// ==========================================================================
// 読み物の列と行の替わり方（配置と改行の決まり R1〜R3）。手本は /tep/。
// ==========================================================================

const READING_COLUMN_MAX_PX = 768; // 48rem = 全角 40 字ぶん（18px のとき 720px 以下）
const COLUMN_TOLERANCE_PX = 2;

// font の違う環境（CI の Linux など）では、同じ字数でも英数字や等幅の字の幅が広い。
// 字数で決めると、実際には箱に収まらない文を「1 行のはず」と誤って数える。
// この関数を page.evaluate で仕込み、読み物と LP の試験で使い回す。
type LineBreakProbe = {
  lineCount: (element: Element) => number;
  unwrappedWidth: (element: Element) => number;
  contentWidth: (element: Element) => number;
  sentenceFailures: () => string[];
  judgedCount: () => number;
};

declare global {
  interface Window {
    __lineBreakProbe?: LineBreakProbe;
  }
}

function installLineBreakProbe(): void {
  // 行の数は、要素の高さを行の高さで割って数える。inline の code は、同じ行でも
  // 上下の padding で Range の top が 9px ずれる事があり、top を 8px でまとめる数え方だと
  // 1 行を 2 行と誤る。手で入れた <br> は折り返しではないので、その数だけ引く。
  const lineCount = (element: Element): number => {
    const manualBreaks = element.querySelectorAll('br').length;
    const style = window.getComputedStyle(element);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const height = element.getBoundingClientRect().height;
    if (Number.isFinite(lineHeight) && lineHeight > 0 && height > 0) {
      return Math.max(1, Math.round(height / lineHeight) - manualBreaks);
    }
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0 && rect.height > 0
    );
    const tops: number[] = [];
    for (const rect of rects) {
      if (!tops.some((top) => Math.abs(top - rect.top) <= 8)) tops.push(rect.top);
    }
    range.detach();
    return Math.max(1, tops.length - manualBreaks);
  };

  // 折り返さない時の幅。複製を不可視・nowrap で親に置いて測り、終わったら必ず消す
  // （元の要素の見た目は変えない）。手で入れた <br> は、折り返さない時の幅を測るため
  // 空白に置き換える（<br> を残すと、複製の幅が長い方の行だけになる）。
  const unwrappedWidth = (element: Element): number => {
    const clone = element.cloneNode(true) as HTMLElement;
    for (const br of Array.from(clone.querySelectorAll('br'))) br.replaceWith(' ');
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.whiteSpace = 'nowrap';
    clone.style.maxWidth = 'none';
    clone.style.width = 'auto';
    clone.style.display = 'inline-block';
    element.parentElement?.appendChild(clone);
    const width = clone.getBoundingClientRect().width;
    clone.remove();
    return width;
  };

  // 文を置く箱（親）の中身の幅。文字が流れるのは padding と border の内側だけなので、
  // 親の矩形から左右の padding と border を引く。clientWidth は整数に丸めて返すので使わない
  // （丸めた値と、折り返さない時の幅の小数が、境界でどちらにも転ぶ）。
  const contentWidth = (element: Element): number => {
    const parent = element.parentElement;
    if (!parent) return document.documentElement.clientWidth;
    const style = window.getComputedStyle(parent);
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(style.paddingRight) || 0;
    const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0;
    const borderRight = Number.parseFloat(style.borderRightWidth) || 0;
    return (
      parent.getBoundingClientRect().width - paddingLeft - paddingRight - borderLeft - borderRight
    );
  };

  // 折り返さない時の幅が箱より 1px 以上小さい文だけを「1 行のはず」とし、2 行以上なら落とす。
  // 箱との差が 1px 未満の文は、丸めでどちらにも転ぶので判定から外す（箱より広い文も、
  // 折り返して当然なので同じく外す）。判定した文が 0 個の route は、測り方が空振りしているので落とす。
  const sentenceFailures = (): string[] => {
    const failures: string[] = [];
    let judged = 0;
    const sentences = Array.from(document.querySelectorAll('.lb-sentence'));
    if (sentences.length === 0) failures.push('.lb-sentence が 1 つも無い');
    for (const sentence of sentences) {
      const text = (sentence.textContent ?? '').replace(/\s+/g, '');
      if (text.length === 0) continue;
      const box = contentWidth(sentence);
      const nowrapWidth = unwrappedWidth(sentence);
      if (nowrapWidth > box - 1) continue;
      judged += 1;
      const lines = lineCount(sentence);
      if (lines !== 1) {
        const chars = Array.from(text).length;
        failures.push(
          `文が 1 行に収まらない（幅 ${nowrapWidth.toFixed(1)}px / 箱 ${box.toFixed(1)}px、${chars} 字）: ${text.slice(0, 40)}`
        );
      }
    }
    if (judged === 0)
      failures.push('「1 行のはず」と判定した文が 0 個（幅の測り方が空振りしている）');
    return failures;
  };

  // route ごとに「1 行のはず」と判定した文の数（報告用。合否は sentenceFailures が見る）。
  const judgedCount = (): number => {
    let judged = 0;
    for (const sentence of Array.from(document.querySelectorAll('.lb-sentence'))) {
      const text = (sentence.textContent ?? '').replace(/\s+/g, '');
      if (text.length === 0) continue;
      if (unwrappedWidth(sentence) > contentWidth(sentence) - 1) continue;
      judged += 1;
    }
    return judged;
  };

  window.__lineBreakProbe = {
    lineCount,
    unwrappedWidth,
    contentWidth,
    sentenceFailures,
    judgedCount,
  };
}

interface ColumnBox {
  name: string;
  left: number;
  right: number;
  width: number;
}

test.describe('/tep/ reading column and line breaks', () => {
  test('reading column boxes share one centered column on wide screens', async ({ page }) => {
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/tep/');
      const result = await page.evaluate(() => {
        const contentBox = (element: Element): ColumnBox => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
          const paddingRight = Number.parseFloat(style.paddingRight) || 0;
          return {
            name: `${element.tagName.toLowerCase()}.${Array.from(element.classList)
              .filter((className) => className.startsWith('max-w-'))
              .join('.')}`,
            left: rect.left + paddingLeft,
            right: rect.right - paddingRight,
            width: rect.width - paddingLeft - paddingRight,
          };
        };
        const seen = new Set<Element>();
        const boxes: ColumnBox[] = [];
        for (const element of Array.from(document.querySelectorAll('main .mx-auto'))) {
          if (seen.has(element)) continue;
          seen.add(element);
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          const box = contentBox(element);
          if (box.width > 0) boxes.push(box);
        }
        return { boxes, center: document.documentElement.clientWidth / 2 };
      });
      const labels = result.boxes.map((box) => box.name).join(', ');
      expect(
        result.boxes.length,
        `main の中に .mx-auto の箱がある (width=${width})`
      ).toBeGreaterThan(0);
      const first = result.boxes[0];
      const misaligned = result.boxes.filter(
        (box) =>
          Math.abs(box.left - first.left) > COLUMN_TOLERANCE_PX ||
          Math.abs(box.right - first.right) > COLUMN_TOLERANCE_PX
      );
      expect(
        misaligned.map((box) => box.name),
        `箱の左右の端がそろわない (width=${width}, boxes=${labels}): ${misaligned
          .map((box) => `${box.name} left=${box.left.toFixed(1)} right=${box.right.toFixed(1)}`)
          .join('; ')}`
      ).toEqual([]);
      const offCenter = result.boxes.filter(
        (box) => Math.abs(box.left + box.width / 2 - result.center) > COLUMN_TOLERANCE_PX
      );
      expect(
        offCenter.map((box) => box.name),
        `箱が画面の中央にない (width=${width}, center=${result.center}): ${offCenter
          .map((box) => `${box.name} center=${(box.left + box.width / 2).toFixed(1)}`)
          .join('; ')}`
      ).toEqual([]);
      const tooWide = result.boxes.filter((box) => box.width > READING_COLUMN_MAX_PX + 0.5);
      expect(
        tooWide.map((box) => box.name),
        `箱が ${READING_COLUMN_MAX_PX}px を超える (width=${width}): ${tooWide
          .map((box) => `${box.name} width=${box.width.toFixed(1)}`)
          .join('; ')}`
      ).toEqual([]);
    }
  });

  test('headings and sentences break at meaning boundaries on wide screens', async ({ page }) => {
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/tep/');
      await page.evaluate(installLineBreakProbe);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        const probe = window.__lineBreakProbe;
        if (!probe) return ['折り返しを測る関数が仕込まれていない'];

        const heading = document.querySelector('main h1');
        if (!heading) failures.push('h1 が無い');

        const h1Clauses = Array.from(document.querySelectorAll('main h1 .lb-clause'));
        if (h1Clauses.length < 2) {
          failures.push(
            `h1 の塊が ${h1Clauses.length} 個（2 個以上のはず）: ${heading?.textContent?.trim() ?? ''}`
          );
        }
        for (const clause of h1Clauses) {
          const box = probe.contentWidth(clause);
          if (probe.unwrappedWidth(clause) > box + 1) continue;
          const lines = probe.lineCount(clause);
          if (lines !== 1) {
            failures.push(`h1 の塊が ${lines} 行に割れている: ${clause.textContent ?? ''}`);
          }
        }

        failures.push(...probe.sentenceFailures());

        for (const paragraph of Array.from(document.querySelectorAll('main p')).filter((p) =>
          p.querySelector('.lb-sentence')
        )) {
          const style = window.getComputedStyle(paragraph);
          const fontSize = Number.parseFloat(style.fontSize) || 16;
          const box = paragraph.clientWidth;
          if (box > fontSize * 40 + 1) {
            failures.push(
              `本文の箱が全角 40 字を超える（${box.toFixed(1)}px / ${fontSize}px の ${(box / fontSize).toFixed(1)} 字）: ${(paragraph.textContent ?? '').slice(0, 30)}`
            );
          }
        }

        const inTables = document.querySelectorAll(
          'main table .lb-sentence, main table .lb-clause'
        );
        if (inTables.length > 0) failures.push(`表の中に印がある（${inTables.length} 個）`);
        const inCode = document.querySelectorAll('main pre .lb-sentence, main pre .lb-clause');
        if (inCode.length > 0) failures.push(`code の中に印がある（${inCode.length} 個）`);

        return failures;
      });
      expect(issues, `行の替わり方が決まりどおりでない (width=${width})`).toEqual([]);
    }
  });

  test('reading column has no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tep/');
    const issues = await page.evaluate(() => {
      const failures: string[] = [];
      const root = document.documentElement;
      const scrollWidth = Math.max(root.scrollWidth, document.body?.scrollWidth ?? 0);
      if (scrollWidth > root.clientWidth + 2) {
        failures.push(
          `横 scroll が出る（scrollWidth=${scrollWidth} > clientWidth=${root.clientWidth}）`
        );
      }
      const clauses = Array.from(document.querySelectorAll('.lb-clause'));
      if (clauses.length === 0) failures.push('.lb-clause が 1 つも無い');
      for (const clause of clauses) {
        const box = clause.parentElement?.getBoundingClientRect();
        const rect = clause.getBoundingClientRect();
        if (!box) continue;
        // 狭い画面で塊は inline になり、行の終わりの全角の閉じ括弧は親の箱の外へ数 px だけ
        // はみ出してよい（日本語の行末のぶら下げ。横 scroll が出ない事は上の別の検査で見る）。
        if (rect.left < box.left - 1 || rect.right > box.right + 4) {
          failures.push(`塊が箱からはみ出す: ${(clause.textContent ?? '').slice(0, 30)}`);
        }
      }
      // 狭い画面（幅 390）では、文の中の塊は通常の折り方に戻り、題の塊は inline-block のまま
      // （docs/design/layout-rules.md の R1 と「確かめ」の 5）。
      const displayOf = (element: Element): string => window.getComputedStyle(element).display;
      const bodyClauses = Array.from(document.querySelectorAll('.lb-sentence .lb-clause'));
      if (bodyClauses.length === 0)
        failures.push('文の中の塊（.lb-sentence .lb-clause）が 1 つも無い');
      for (const clause of bodyClauses) {
        if (displayOf(clause) !== 'inline') {
          failures.push(
            `文の中の塊の display が ${displayOf(clause)}（inline のはず）: ${(clause.textContent ?? '').slice(0, 30)}`
          );
          break;
        }
      }
      const headingClauses = Array.from(document.querySelectorAll('.lb-heading .lb-clause'));
      if (headingClauses.length === 0)
        failures.push('題の塊（.lb-heading .lb-clause）が 1 つも無い');
      for (const clause of headingClauses) {
        if (displayOf(clause) !== 'inline-block') {
          failures.push(
            `題の塊の display が ${displayOf(clause)}（inline-block のはず）: ${(clause.textContent ?? '').slice(0, 30)}`
          );
          break;
        }
      }
      return failures;
    });
    expect(issues, '幅 390 で読み物の列がはみ出る').toEqual([]);
  });

  test('line-break marks keep their computed styles on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/tep/');
    const issues = await page.evaluate(() => {
      const failures: string[] = [];
      const displayOf = (element: Element | null): string =>
        element ? window.getComputedStyle(element).display : '(要素が無い)';

      const sentence = document.querySelector('.lb-sentence');
      if (!sentence) failures.push('.lb-sentence が 1 つも無い');
      else if (displayOf(sentence) !== 'block') {
        failures.push(`.lb-sentence の display が ${displayOf(sentence)}（block のはず）`);
      }

      const clause = document.querySelector('.lb-clause');
      if (!clause) failures.push('.lb-clause が 1 つも無い');
      else if (displayOf(clause) !== 'inline-block') {
        failures.push(`.lb-clause の display が ${displayOf(clause)}（inline-block のはず）`);
      }

      const headings = Array.from(document.querySelectorAll('.lb-heading'));
      if (headings.length === 0) failures.push('.lb-heading が 1 つも無い');
      for (const heading of headings) {
        const style = window.getComputedStyle(heading);
        const textWrap =
          style.getPropertyValue('text-wrap') || style.getPropertyValue('text-wrap-mode');
        if (textWrap.trim() === 'balance') {
          failures.push(
            `.lb-heading の text-wrap が balance: ${(heading.textContent ?? '').slice(0, 30)}`
          );
        }
      }

      return failures;
    });
    expect(issues, '行の替えの印の CSS が広い画面で効いていない').toEqual([]);
  });
});

// ==========================================================================
// 配置と改行の決まりを、読み物と LP の残りの page に広げた時の確かめ。
// 測り方は /tep/ の describe と同じ（箱の端・中央・幅、題と文の塊、幅 390）。
// ==========================================================================

const READING_ROUTES = [
  '/terms/',
  '/privacy/',
  '/faq/',
  '/column/',
  '/column/story-ai-activity/',
  '/column/story-java-5-years/',
  '/column/story-recommendation-reason/',
  '/articles/',
  '/articles/git-history-facts/',
  '/news/',
  '/news/cli-published/',
];

const LP_ROUTES = ['/', '/pricing/'];

test.describe('reading column rollout (terms, privacy, faq, column, articles, news)', () => {
  test('reading routes share one centered column on wide screens', async ({ page }) => {
    for (const route of READING_ROUTES) {
      for (const width of [1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const result = await page.evaluate(() => {
          const contentBox = (element: Element): ColumnBox => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
            const paddingRight = Number.parseFloat(style.paddingRight) || 0;
            return {
              name: `${element.tagName.toLowerCase()}.${Array.from(element.classList)
                .filter((className) => className.startsWith('max-w-'))
                .join('.')}`,
              left: rect.left + paddingLeft,
              right: rect.right - paddingRight,
              width: rect.width - paddingLeft - paddingRight,
            };
          };
          const seen = new Set<Element>();
          const boxes: ColumnBox[] = [];
          for (const element of Array.from(document.querySelectorAll('main .mx-auto'))) {
            if (seen.has(element)) continue;
            seen.add(element);
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const box = contentBox(element);
            if (box.width > 0) boxes.push(box);
          }
          return { boxes, center: document.documentElement.clientWidth / 2 };
        });
        expect(
          result.boxes.length,
          `${route}: main の中に .mx-auto の箱がある (width=${width})`
        ).toBeGreaterThan(0);
        const first = result.boxes[0];
        const misaligned = result.boxes.filter(
          (box) =>
            Math.abs(box.left - first.left) > COLUMN_TOLERANCE_PX ||
            Math.abs(box.right - first.right) > COLUMN_TOLERANCE_PX
        );
        expect(
          misaligned.map((box) => box.name),
          `${route}: 箱の左右の端がそろわない (width=${width}): ${misaligned
            .map((box) => `${box.name} left=${box.left.toFixed(1)} right=${box.right.toFixed(1)}`)
            .join('; ')}`
        ).toEqual([]);
        const offCenter = result.boxes.filter(
          (box) => Math.abs(box.left + box.width / 2 - result.center) > COLUMN_TOLERANCE_PX
        );
        expect(
          offCenter.map((box) => box.name),
          `${route}: 箱が画面の中央にない (width=${width}): ${offCenter
            .map((box) => `${box.name} center=${(box.left + box.width / 2).toFixed(1)}`)
            .join('; ')}`
        ).toEqual([]);
        const tooWide = result.boxes.filter((box) => box.width > READING_COLUMN_MAX_PX + 0.5);
        expect(
          tooWide.map((box) => box.name),
          `${route}: 箱が ${READING_COLUMN_MAX_PX}px を超える (width=${width}): ${tooWide
            .map((box) => `${box.name} width=${box.width.toFixed(1)}`)
            .join('; ')}`
        ).toEqual([]);
      }
    }
  });

  // 幅 1440 と 1920 で、折り返さない時の幅が箱に収まる文が 1 行かを見る。
  // 判定した文が 0 個の route は、測り方が空振りしているので落とす。
  test('reading routes keep sentences on one line where they fit (line breaks)', async ({
    page,
  }) => {
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of READING_ROUTES) {
        await page.goto(route);
        await page.evaluate(installLineBreakProbe);
        const issues = await page.evaluate(() => {
          const probe = window.__lineBreakProbe;
          if (!probe) return ['折り返しを測る関数が仕込まれていない'];
          return probe.sentenceFailures();
        });
        expect(issues, `${route}: 1 行に収まるはずの文 (width=${width})`).toEqual([]);
      }
    }
  });

  test('reading routes mark sentences and keep boxes within 40em', async ({ page }) => {
    for (const route of READING_ROUTES) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const result = await page.evaluate(() => {
        const failures: string[] = [];
        const sentenceCount = document.querySelectorAll('main .lb-sentence').length;
        if (sentenceCount === 0) failures.push('main に .lb-sentence が 1 つも無い');
        // 表・code・summary・dt の中に印を付けない
        const markedInExcluded = document.querySelectorAll(
          'main table .lb-sentence, main pre .lb-sentence, main code .lb-sentence, main summary .lb-sentence, main dt .lb-sentence'
        );
        if (markedInExcluded.length > 0)
          failures.push(
            `表・code・summary・dt の中に .lb-sentence が ${markedInExcluded.length} 個ある`
          );
        // 文の箱は 40em まで
        for (const sentence of Array.from(document.querySelectorAll('main .lb-sentence'))) {
          const width = sentence.getBoundingClientRect().width;
          // 全角 40 字（18px のとき 720px。docs/design/layout-rules.md の R2）まで
          if (width > 721)
            failures.push(`文の箱が 40 字を超える: ${width.toFixed(0)}px（上限 720px）`);
        }
        return failures;
      });
      expect(result, `${route}: 印と箱の幅`).toEqual([]);
    }
  });

  test('reading routes do not overflow at 390px', async ({ page }) => {
    for (const route of READING_ROUTES) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        const clientWidth = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth > clientWidth + 1)
          failures.push(
            `横の scroll が出る: scrollWidth=${document.documentElement.scrollWidth} clientWidth=${clientWidth}`
          );
        for (const clause of Array.from(document.querySelectorAll('main .lb-clause'))) {
          const box = clause.getBoundingClientRect();
          if (box.width > 0 && (box.left < -1 || box.right > clientWidth + 1))
            failures.push(`塊が画面からはみ出る: ${clause.textContent?.slice(0, 20) ?? ''}`);
        }
        return failures;
      });
      expect(issues, `${route}: 幅 390`).toEqual([]);
    }
  });

  // 印の CSS が効いていることを、計算値で見る。.lb-sentence を display: inline にすると落ちる
  test('reading routes keep the computed styles of line-break marks', async ({ page }) => {
    const failures: string[] = [];
    for (const route of [...READING_ROUTES, ...LP_ROUTES]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        const displayOf = (element: Element | null): string =>
          element ? window.getComputedStyle(element).display : '(要素が無い)';

        const sentence = document.querySelector('main .lb-sentence');
        if (!sentence) failures.push('.lb-sentence が 1 つも無い');
        else if (displayOf(sentence) !== 'block') {
          failures.push(`.lb-sentence の display が ${displayOf(sentence)}（block のはず）`);
        }

        const clause = document.querySelector('main .lb-clause');
        if (!clause) failures.push('.lb-clause が 1 つも無い');
        else if (displayOf(clause) !== 'inline-block') {
          failures.push(`.lb-clause の display が ${displayOf(clause)}（inline-block のはず）`);
        }

        const headings = Array.from(document.querySelectorAll('main .lb-heading'));
        if (headings.length === 0) failures.push('.lb-heading が 1 つも無い');
        for (const heading of headings) {
          const style = window.getComputedStyle(heading);
          const textWrap =
            style.getPropertyValue('text-wrap') || style.getPropertyValue('text-wrap-mode');
          if (textWrap.trim() === 'balance') {
            failures.push(
              `.lb-heading の text-wrap が balance: ${(heading.textContent ?? '').slice(0, 30)}`
            );
          }
        }
        return failures;
      });
      failures.push(...issues.map((issue) => `${route}: ${issue}`));
    }
    expect(failures, '印の CSS の計算値が決まりどおりでない').toEqual([]);
  });

  // 全部の .lb-sentence で、開きの括弧と閉じの括弧の数が同じ。揃わない文は page と文の頭 30 字を出す
  test('reading routes keep bracket pairs balanced inside sentences', async ({ page }) => {
    const pairs = [
      ['（', '）'],
      ['「', '」'],
      ['『', '』'],
      ['(', ')'],
    ];
    const failures: string[] = [];
    for (const route of [...READING_ROUTES, ...LP_ROUTES]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const issues = await page.evaluate((bracketPairs: string[][]) => {
        const failures: string[] = [];
        for (const sentence of Array.from(document.querySelectorAll('main .lb-sentence'))) {
          const text = sentence.textContent ?? '';
          for (const [open, close] of bracketPairs) {
            const opens = text.split(open).length - 1;
            const closes = text.split(close).length - 1;
            if (opens !== closes) {
              failures.push(
                `括弧 ${open}${close} が ${opens} 個 / ${closes} 個: ${text.slice(0, 30)}`
              );
            }
          }
        }
        return failures;
      }, pairs);
      failures.push(...issues.map((issue) => `${route}: ${issue}`));
    }
    expect(failures, '括弧の対が揃わない文がある').toEqual([]);
  });
});

test.describe('LP headings and sentence marks (top, pricing)', () => {
  test('LP headings with a comma split at the comma and keep one line per clause', async ({
    page,
  }) => {
    for (const route of LP_ROUTES) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await page.evaluate(installLineBreakProbe);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        const probe = window.__lineBreakProbe;
        if (!probe) return ['折り返しを測る関数が仕込まれていない'];
        if (document.querySelectorAll('main .lb-sentence').length === 0)
          failures.push('main に .lb-sentence が無い');
        // 読点を含む題（手で改行を入れた hero・資料の案内の共有部品は除く）
        for (const heading of Array.from(document.querySelectorAll('main h1, main h2, main h3'))) {
          const text = heading.textContent ?? '';
          if (!text.includes('、')) continue;
          if (heading.querySelector('span.block')) continue; // 手動改行の題はそのまま
          if (heading.querySelector('.whitespace-nowrap')) continue; // 折り返し防止を手で入れた題もそのまま
          if (heading.closest('[data-testid="document-download"]')) continue; // 共有部品（GMO 納品枠でも使うため触らない）
          const clauses = Array.from(heading.querySelectorAll('.lb-clause'));
          // 「まずは、」のような 5 字以下の出だしは、次の塊と続けるのが決まり（R1）
          const lead = text.split('、')[0] ?? '';
          const minClauses = [...lead].length <= 5 ? 1 : 2;
          if (clauses.length < minClauses)
            failures.push(
              `読点を含む題に塊が無い（${clauses.length} 個, 最低 ${minClauses}）: ${text.trim().slice(0, 24)}`
            );
          for (const clause of clauses) {
            // 折り返さない時の幅が箱を超える塊は、塊の中で折り返して当然なので 1 行断言の外
            const box = probe.contentWidth(clause);
            if (probe.unwrappedWidth(clause) > box + 1) continue;
            const lines = probe.lineCount(clause);
            if (lines !== 1)
              failures.push(
                `題の塊が ${lines} 行: ${clause.textContent?.trim().slice(0, 24) ?? ''}`
              );
          }
        }
        return failures;
      });
      expect(issues, `${route}: 題の塊`).toEqual([]);
    }
  });

  // 幅 1440 と 1920 で、折り返さない時の幅が箱に収まる文が 1 行かを見る。
  // 判定した文が 0 個の route は、測り方が空振りしているので落とす。
  test('LP sentences stay on one line where they fit (line breaks)', async ({ page }) => {
    for (const width of [1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of LP_ROUTES) {
        await page.goto(route);
        await page.evaluate(installLineBreakProbe);
        const issues = await page.evaluate(() => {
          const probe = window.__lineBreakProbe;
          if (!probe) return ['折り返しを測る関数が仕込まれていない'];
          return probe.sentenceFailures();
        });
        expect(issues, `${route}: 1 行に収まるはずの文 (width=${width})`).toEqual([]);
      }
    }
  });

  test('LP description paragraphs stay within 40em', async ({ page }) => {
    for (const route of LP_ROUTES) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      const issues = await page.evaluate(() => {
        const failures: string[] = [];
        for (const sentence of Array.from(document.querySelectorAll('main .lb-sentence'))) {
          // 全角 40 字（18px のとき 720px）まで
          const width = sentence.getBoundingClientRect().width;
          if (width > 721) failures.push(`文の箱が 40 字を超える: ${width.toFixed(0)}px`);
        }
        return failures;
      });
      expect(issues, `${route}: 説明の箱`).toEqual([]);
    }
  });
});

// 読み物と LP の試験が回る page の全部で、page の中の link（href="#…"）の飛び先の id が
// 同じ page に在るかを見る。# だけの link は飛び先を持たないので除く。
const INTERNAL_LINK_ROUTES = ['/tep/', ...READING_ROUTES, ...LP_ROUTES];

test('page-internal links point to an id on the same page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const failures: string[] = [];

  for (const route of INTERNAL_LINK_ROUTES) {
    await page.goto(route);
    const missing = await page.evaluate(() => {
      const missing: string[] = [];
      for (const link of Array.from(document.querySelectorAll('main a[href^="#"]'))) {
        const href = link.getAttribute('href') ?? '';
        if (href === '#') continue;
        const id = decodeURIComponent(href.slice(1));
        if (!id) continue;
        if (document.getElementById(id)) continue;
        missing.push(href);
      }
      return Array.from(new Set(missing));
    });
    failures.push(...missing.map((href) => `${route}: 飛び先の id が無い ${href}`));
  }

  expect(failures, 'page 内の link の飛び先が無い').toEqual([]);
});

// Markdown の記事の本文の箱（main .prose）の中の p に、文の印（.lb-sentence）が在るかを見る。
// 題や lead の LbText の印で緑にならないよう、本文の container（main .prose）に絞る。
// plugin を astro.config.mjs の rehypePlugins から外すと、本文の印だけが消えるので落ちる。
const MARKDOWN_BODY_ROUTES = [
  { route: '/articles/git-history-facts/', label: 'articles' },
  { route: '/news/cli-published/', label: 'news' },
  { route: '/column/story-ai-activity/', label: 'stories' },
];

test('markdown body paragraphs carry line-break marks', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const failures: string[] = [];

  for (const { route, label } of MARKDOWN_BODY_ROUTES) {
    await page.goto(route);
    const result = await page.evaluate(() => {
      const prose = document.querySelector('main .prose');
      if (!prose) return { paragraphs: 0, marked: 0 };
      const paragraphs = Array.from(prose.querySelectorAll('p'));
      const marked = paragraphs.filter((paragraph) =>
        paragraph.querySelector('.lb-sentence')
      ).length;
      return { paragraphs: paragraphs.length, marked };
    });
    if (result.paragraphs === 0) {
      failures.push(`${label} ${route}: 本文の箱（main .prose）の中に p が無い`);
    } else if (result.marked === 0) {
      failures.push(
        `${label} ${route}: 本文の p ${result.paragraphs} 個のどれにも .lb-sentence が無い`
      );
    }
  }

  expect(failures, 'markdown の本文に文の印が無い').toEqual([]);
});

test.describe('共通の header と下の帯', () => {
  test('1280px: header は 64px で、戻る link と CTA が 1 段に並ぶ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const header = page.locator('#site-header');
    await expect(header).toHaveCSS('position', 'sticky');
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(Math.round(headerBox!.height)).toBe(64);

    const back = header.getByRole('link', { name: 'Cor. のサイトへ' });
    await expect(back).toBeVisible();
    expect(await back.getAttribute('href')).toBe(
      siteChrome.sites.find((site) => site.id === 'cor')?.href
    );
    const backBox = await back.boundingBox();
    expect(backBox).not.toBeNull();
    expect(backBox!.height).toBeGreaterThanOrEqual(44);

    await expect(header.getByRole('link', { name: 'テストしてみる' })).toBeVisible();
  });

  test('390px: header は 56px で、menu の先頭に戻る link が在る', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const header = page.locator('#site-header');
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(Math.round(headerBox!.height)).toBe(56);

    const menuButton = page.locator('#mobile-menu-button');
    await expect(menuButton).toBeVisible();
    const buttonBox = await menuButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(Math.round(buttonBox!.width)).toBe(44);
    expect(Math.round(buttonBox!.height)).toBe(44);

    await menuButton.click();
    const panel = page.locator('#mobile-menu-panel');
    await expect(panel).toBeVisible();

    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

    const firstLink = panel.locator('a').first();
    expect(await firstLink.getAttribute('href')).toBe(
      siteChrome.sites.find((site) => site.id === 'cor')?.href
    );
    const firstBox = await firstLink.boundingBox();
    expect(firstBox).not.toBeNull();
    expect(firstBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('下の帯: 共通リンクとサイト切替が 3 本ずつで、利用規約を置かない', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const common = page.locator('footer nav[aria-label="共通リンク"]');
    const sites = page.locator('footer nav[aria-label="サイト切替"]');
    await expect(common.locator('a')).toHaveCount(3);
    await expect(sites.locator('a')).toHaveCount(3);

    const current = sites.locator('a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText('Grift');

    const links = page.locator(
      'footer nav[aria-label="共通リンク"] a, footer nav[aria-label="サイト切替"] a'
    );
    const rels = await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute('rel') ?? '')
    );
    for (const rel of rels) {
      expect(rel).toContain('noopener');
    }

    await expect(links.filter({ hasText: '利用規約' })).toHaveCount(0);

    // 旧い下の行（© … と legalLinks の行）が戻ると、© の行が 2 つになる。
    const copyrightMarks = await page.evaluate(
      () => (document.body.innerText.match(/©/g) ?? []).length
    );
    expect(copyrightMarks).toBe(1);
    await expect(
      page.locator('footer').getByRole('link', { name: 'プライバシーポリシー', exact: true })
    ).toHaveCount(0);
  });

  test('URL の持ち主は site-chrome.json だけ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const back = page.locator('#site-header').getByRole('link', { name: 'Cor. のサイトへ' });
    expect(await back.getAttribute('href')).toBe(
      siteChrome.sites.find((site) => site.id === 'cor')?.href
    );

    const commonHrefs = await page
      .locator('footer nav[aria-label="共通リンク"] a')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href')));
    expect(commonHrefs).toEqual(siteChrome.commonLinks.map((link) => link.href.ja));

    const siteHrefs = await page
      .locator('footer nav[aria-label="サイト切替"] a')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href')));
    expect(siteHrefs).toEqual(siteChrome.sites.map((site) => site.href));
  });

  test('1280px、390px、320px で横に 1px もはみ出さない', async ({ page }) => {
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const widths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(widths.scrollWidth, `${width}px`).toBeLessThanOrEqual(widths.clientWidth);
    }
  });

  test('320px で実績の本文とリンクがカードに収まる', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    const item = page.getByRole('listitem').filter({ hasText: 'OSSの開発・運用実績' });
    await item.scrollIntoViewIfNeeded();
    const overflow = await item.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return Array.from(element.querySelectorAll('p, a')).flatMap((text) => {
        const contents = document.createRange();
        contents.selectNodeContents(text);
        return Array.from(contents.getClientRects()).filter(
          (rect) => rect.left < bounds.left || rect.right > bounds.right
        );
      }).length;
    });
    expect(overflow).toBe(0);
  });
});
