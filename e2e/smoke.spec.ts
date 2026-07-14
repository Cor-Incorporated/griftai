import { test, expect, type Page } from '@playwright/test';

type ProductIntent = 'grift-team-beta' | 'grift-paid-trial' | 'estimate-audit';

interface ExpectedCorCta {
  source: string;
  intent: ProductIntent;
  count: number;
}

interface MajorCtaPage {
  path: string;
  ctas: ExpectedCorCta[];
}

const allowedCorIntents = new Set<ProductIntent>([
  'grift-team-beta',
  'grift-paid-trial',
  'estimate-audit',
]);
const expectedContactUrl = new URL(
  process.env.PUBLIC_CONTACT_CHAT_URL ?? 'https://cor-jp.com/contact/chat/'
);
const expectedLocale = process.env.PUBLIC_SITE_LOCALE ?? 'ja';
const expectedPreviewBuild =
  process.env.PUBLIC_SITE_ENV === 'preview' ||
  (!process.env.PUBLIC_SITE_ENV &&
    Boolean(process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main'));
const contractQueryKeys = ['intent', 'source', 'locale', 'utm_source', 'utm_medium'] as const;
const sourcePattern = /^grift-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const sharedCorCtas: ExpectedCorCta[] = [
  { source: 'grift-nav-header', intent: 'grift-team-beta', count: 2 },
  { source: 'grift-nav-footer', intent: 'grift-team-beta', count: 1 },
  { source: 'grift-nav-footer-estimate-audit', intent: 'estimate-audit', count: 1 },
  { source: 'grift-nav-footer-product', intent: 'grift-team-beta', count: 1 },
  { source: 'grift-nav-footer-company', intent: 'grift-team-beta', count: 1 },
];

const majorCtaPages: MajorCtaPage[] = [
  {
    path: '/',
    ctas: [
      ...sharedCorCtas,
      { source: 'grift-lp-hero', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-lp-hero-secondary', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-lp-mid', intent: 'grift-team-beta', count: 2 },
      { source: 'grift-lp-pricing-team-beta', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-lp-pricing-paid-trial', intent: 'grift-paid-trial', count: 1 },
      { source: 'grift-lp-pricing-estimate-audit', intent: 'estimate-audit', count: 1 },
      { source: 'grift-lp-final', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-lp-column-promo', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-lp-floating', intent: 'grift-team-beta', count: 1 },
    ],
  },
  {
    path: '/pricing/',
    ctas: [
      ...sharedCorCtas,
      { source: 'grift-pricing-team-beta', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-pricing-paid-trial', intent: 'grift-paid-trial', count: 1 },
      { source: 'grift-pricing-estimate-audit', intent: 'estimate-audit', count: 1 },
      { source: 'grift-pricing', intent: 'grift-team-beta', count: 1 },
    ],
  },
  {
    path: '/team-beta/',
    ctas: [
      ...sharedCorCtas,
      { source: 'grift-team-beta-page', intent: 'grift-team-beta', count: 2 },
    ],
  },
  {
    path: '/estimate-audit/',
    ctas: [
      ...sharedCorCtas,
      { source: 'grift-estimate-audit-page', intent: 'estimate-audit', count: 2 },
    ],
  },
  {
    path: '/faq/',
    ctas: [...sharedCorCtas, { source: 'grift-faq', intent: 'grift-team-beta', count: 1 }],
  },
  {
    path: '/contact/',
    ctas: [
      ...sharedCorCtas,
      { source: 'grift-contact', intent: 'grift-team-beta', count: 1 },
      { source: 'grift-contact-methods', intent: 'grift-team-beta', count: 1 },
    ],
  },
];

function expectValidCorCta(href: string): URL {
  const url = new URL(href);
  const intent = url.searchParams.get('intent');
  const source = url.searchParams.get('source');

  expect(url.origin, `${href} must use the configured Cloudia origin`).toBe(
    expectedContactUrl.origin
  );
  expect(url.pathname).toBe(expectedContactUrl.pathname);
  expect(url.username).toBe('');
  expect(url.password).toBe('');
  expect(url.hash).toBe('');
  for (const key of contractQueryKeys) {
    expect(url.searchParams.getAll(key), `${href} must include ${key} exactly once`).toHaveLength(
      1
    );
  }
  expect(intent, `${href} must use an allowed Grift product intent`).not.toBeNull();
  expect(intent !== null && allowedCorIntents.has(intent as ProductIntent)).toBe(true);
  expect(source, `${href} must include a stable Grift source`).toMatch(sourcePattern);
  expect(url.searchParams.get('utm_source')).toBe('grift');
  expect(url.searchParams.get('utm_medium')).toBe('cta');
  expect(url.searchParams.get('locale')).toBe(expectedLocale);
  expect(intent).not.toBe('contract-dev');

  return url;
}

async function expectElementsVisibleAfterScroll(page: Page, selector: string) {
  const elements = page.locator(selector);
  const count = await elements.count();
  expect(count, `${selector} must match at least one element`).toBeGreaterThan(0);

  for (let index = 0; index < count; index++) {
    const element = elements.nth(index);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveCSS('opacity', '1', { timeout: 3000 });
  }
}

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
    await expectElementsVisibleAfterScroll(page, '.section-animate');
  });

  test('fade-in-section elements become visible after scroll', async ({ page }) => {
    await expectElementsVisibleAfterScroll(page, '.fade-in-section');
  });

  test('CTA buttons exist and at least one is visible', async ({ page }) => {
    const heroCta = page.locator('a[href*="source=grift-lp-hero&"]');
    await expect(heroCta).toHaveCount(1);
    await expect(heroCta).toBeVisible();
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

test.describe('Cor contact CTA contract', () => {
  for (const { path, ctas: expectedCtas } of majorCtaPages) {
    test(`${path} keeps every Cor CTA within the product-intent contract`, async ({ page }) => {
      await page.goto(path);

      const hrefs = await page.locator('a[href]').evaluateAll(
        (anchors, contract) =>
          anchors
            .map((anchor) => new URL((anchor as HTMLAnchorElement).href))
            .filter(
              (url) =>
                contract.queryKeys.some((key) => url.searchParams.has(key)) ||
                (url.pathname === contract.expectedPathname &&
                  url.origin === contract.expectedOrigin)
            )
            .map((url) => url.href),
        {
          queryKeys: [...contractQueryKeys],
          expectedOrigin: expectedContactUrl.origin,
          expectedPathname: expectedContactUrl.pathname,
        }
      );

      expect(hrefs.length, `${path} must expose at least one Cor contact CTA`).toBeGreaterThan(0);
      const urls = hrefs.map(expectValidCorCta);

      for (const expectedCta of expectedCtas) {
        const matchingUrls = urls.filter(
          (url) => url.searchParams.get('source') === expectedCta.source
        );
        expect(
          matchingUrls,
          `${path} must render ${expectedCta.count} CTA(s) for ${expectedCta.source}`
        ).toHaveLength(expectedCta.count);
        for (const url of matchingUrls) {
          expect(url.searchParams.get('intent')).toBe(expectedCta.intent);
        }
      }

      const forbiddenIntentHrefs = await page
        .locator('a[href]')
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => (anchor as HTMLAnchorElement).href)
            .filter((href) => new URL(href).searchParams.getAll('intent').includes('contract-dev'))
        );
      expect(forbiddenIntentHrefs).toEqual([]);
    });
  }
});

test.describe('Preview release provenance', () => {
  test('emits exact same-origin metadata only for Preview builds', async ({ request }) => {
    const response = await request.get('/release.json');

    if (!expectedPreviewBuild) {
      expect(response.status()).toBe(404);
      return;
    }

    expect(response.status()).toBe(200);
    const metadata = await response.json();
    expect(Object.keys(metadata)).toEqual([
      'status',
      'service',
      'repository',
      'candidate_sha',
      'deployment_id',
      'release_id',
    ]);
    expect(metadata).toEqual({
      status: 'ok',
      service: 'grift-lp',
      repository: 'Cor-Incorporated/griftai',
      candidate_sha: process.env.PUBLIC_RELEASE_CANDIDATE_SHA ?? process.env.CF_PAGES_COMMIT_SHA,
      deployment_id: process.env.PUBLIC_RELEASE_DEPLOYMENT_ID,
      release_id: process.env.PUBLIC_RELEASE_ID,
    });
  });
});

test.describe('External link safety', () => {
  for (const { path } of majorCtaPages) {
    test(`${path} uses secure external URLs and safe new-tab attributes`, async ({ page }) => {
      await page.goto(path);

      const links = await page.locator('a[href]').evaluateAll((anchors) =>
        anchors.map((anchor) => {
          const element = anchor as HTMLAnchorElement;
          const url = new URL(element.href);
          return {
            href: url.href,
            isExternalHttp:
              ['http:', 'https:'].includes(url.protocol) && url.origin !== location.origin,
            target: element.target,
            rel: element.rel,
          };
        })
      );

      for (const link of links.filter((candidate) => candidate.isExternalHttp)) {
        const url = new URL(link.href);
        expect(url.protocol, `${link.href} must use HTTPS`).toBe('https:');
        expect(url.username).toBe('');
        expect(url.password).toBe('');
      }

      for (const link of links.filter((candidate) => candidate.target === '_blank')) {
        const relTokens = new Set(link.rel.toLowerCase().split(/\s+/).filter(Boolean));
        expect(
          relTokens.has('noopener') || relTokens.has('noreferrer'),
          `${link.href} opens a new tab without noopener or noreferrer`
        ).toBe(true);
      }
    });
  }
});

test.describe('Responsive page width', () => {
  for (const { path } of majorCtaPages) {
    test(`${path} does not create horizontal page scrolling`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });

      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const offenders = Array.from(document.body.querySelectorAll('*'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              element: `${element.tagName.toLowerCase()}#${element.id}.${Array.from(element.classList).join('.')}`,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            };
          })
          .filter((item) => item.left < -1 || item.right > root.clientWidth + 1)
          .slice(0, 10);

        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          offenders,
        };
      });

      expect(
        result.scrollWidth,
        `${path} overflows ${result.clientWidth}px viewport: ${JSON.stringify(result.offenders)}`
      ).toBeLessThanOrEqual(result.clientWidth);
    });
  }
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
    const ctas = page.locator('a[href*="source=grift-team-beta-page&"]');
    await expect(ctas).toHaveCount(2);
    await expect(ctas.first()).toBeVisible();
    // Nav link is desktop-only; assert presence in DOM
    await expect(page.locator('#site-header a[href="/team-beta"]')).toHaveCount(1);
  });

  test('estimate-audit page CTA uses estimate-audit intent', async ({ page }) => {
    await page.goto('/estimate-audit/');
    const ctas = page.locator('a[href*="source=grift-estimate-audit-page&"]');
    await expect(ctas).toHaveCount(2);
    await expect(ctas.first()).toBeVisible();
  });

  test('home shows product demo placeholder without contract-dev CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#product-demo-placeholder')).toBeVisible();
    const contractDev = page.locator('a[href*="intent=contract-dev"]');
    await expect(contractDev).toHaveCount(0);
  });
});

test.describe('Contact page messaging and SEO', () => {
  test('describes Cloudia as the primary consultation path with a form fallback', async ({
    page,
  }) => {
    await page.goto('/contact/');

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Grift Team Beta.*Cloudia.*フォーム/
    );
    await expect(
      page.getByRole('heading', {
        name: 'Grift Team Beta の相談は Cor.株式会社のAI相談窓口「Cloudia」へ。',
      })
    ).toBeVisible();
    await expect(
      page.getByText(/Cloudiaを利用できない場合は、同じページの問い合わせフォーム/)
    ).toBeVisible();
  });
});
