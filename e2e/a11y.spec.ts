import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility — WCAG 2 AA', () => {
  test('homepage has no critical a11y violations', async ({ page }) => {
    await page.goto('/');
    // Scroll full page to trigger all lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('pricing page has no critical a11y violations', async ({ page }) => {
    await page.goto('/pricing/');

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('TEP page has no critical a11y violations', async ({ page }) => {
    await page.goto('/tep/');
    // 折りたたみの用語の対応表も開いて検査する
    await page.locator('details#terms').evaluate((details) => {
      (details as HTMLDetailsElement).open = true;
    });

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('faq page has no critical a11y violations', async ({ page }) => {
    await page.goto('/faq/');

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });
});

test.describe('Text resize', () => {
  for (const { path, label } of [
    { path: '/', label: /推薦・採用の根拠/ },
    { path: '/tep/', label: '使い方' },
    { path: '/pricing/', label: 'テスト導入を相談する' },
    { path: '/faq/', label: /推薦や採用の業務で使えるか/ },
  ]) {
    test(`${path} fits narrow screens at 200% text size`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 740 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(async () => {
        await document.fonts.ready;
        const textElements = [...document.querySelectorAll<HTMLElement>('main *')].filter(
          (element) =>
            [...element.childNodes].some(
              (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()
            )
        );
        const sizes = textElements.map((element) => {
          const style = getComputedStyle(element);
          return [parseFloat(style.fontSize), parseFloat(style.lineHeight)];
        });
        for (const [index, element] of textElements.entries()) {
          const [size, lineHeight] = sizes[index];
          element.style.setProperty('font-size', `${size * 2}px`, 'important');
          if (Number.isFinite(lineHeight)) {
            element.style.setProperty('line-height', `${lineHeight * 2}px`, 'important');
          }
        }
      });

      const target = page
        .getByRole(path === '/pricing/' ? 'link' : 'heading', { name: label })
        .first();
      if (path === '/pricing/') {
        await target.focus();
        await expect(target).toBeFocused();
      } else {
        await target.scrollIntoViewIfNeeded();
      }
      const dimensions = await target.evaluate((element) => ({
        width: document.documentElement.scrollWidth,
        right: element.getBoundingClientRect().right,
        viewport: innerWidth,
      }));
      expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
    });
  }
});

test('skip link is visible above the sticky header and moves focus to the content', async ({
  page,
}) => {
  await page.goto('/tep/');
  const skip = page.getByRole('link', { name: 'メインコンテンツへ移動' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await skip.click({ trial: true });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  const breadcrumb = page.getByRole('link', { name: 'トップ', exact: true }).first();
  await expect(breadcrumb).toBeFocused();
  await breadcrumb.click({ trial: true });
});

test('open mobile navigation keeps page links out of the tab order', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'モバイルメニューを開く' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('dialog', { name: 'モバイルナビゲーション' });
  await expect(menu.getByRole('button', { name: 'モバイルメニューを閉じる' })).toBeFocused();
  const menuItems = await menu.getByRole('link').count();
  for (let index = 0; index <= menuItems + 1; index++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => {
        const active = document.activeElement;
        return active === document.body || active?.closest('dialog[open]') !== null;
      })
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
});

test.describe('Focused links beside the fixed home CTA', () => {
  for (const { width, names } of [
    { width: 320, names: ['事例を読む', 'FAQをすべて見る'] },
    { width: 1280, names: ['→ GitHubでGrift CLIを見る'] },
  ]) {
    test(`${width}px: the floating CTA leaves focused links visible`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const floatingCta = page.locator('#floating-cta');

      for (const name of names) {
        const link = page.getByRole('link', { name, exact: true });
        for (let step = 0; step < 85; step++) {
          await page.keyboard.press('Tab');
          if (await link.evaluate((element) => element === document.activeElement)) break;
        }
        await expect(link).toBeFocused();
        await expect(floatingCta).toHaveAttribute('aria-hidden', 'false');
        await expect
          .poll(() =>
            link.evaluate((element) => {
              const bar = document.getElementById('floating-cta');
              if (!bar) throw new Error('Floating CTA is missing');
              return element.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
            })
          )
          .toBeLessThanOrEqual(0);
      }
    });
  }
});

test('the floating CTA can be tabbed to and dismissed without losing focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const floatingCta = page.locator('#floating-cta');
  const contact = floatingCta.getByRole('link', { name: 'テスト導入を相談する' });
  const close = floatingCta.getByRole('button', { name: '閉じる' });
  let previousFocus = null;

  for (let step = 0; step < 85; step++) {
    previousFocus = await page.evaluateHandle(() => document.activeElement);
    await page.keyboard.press('Tab');
    if (
      (await contact.count()) &&
      (await contact.evaluate((element) => element === document.activeElement))
    )
      break;
  }
  await expect(contact).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(floatingCta).toHaveAttribute('aria-hidden', 'true');
  const restored = await previousFocus?.evaluate((element) => element === document.activeElement);
  expect(restored).toBe(true);
});
