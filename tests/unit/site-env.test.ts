import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRobotsMetaContent, isPreviewSite } from '../../src/lib/site-env';

describe('isPreviewSite', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to production (indexable)', () => {
    expect(isPreviewSite()).toBe(false);
    expect(getRobotsMetaContent()).toContain('index, follow');
  });

  it('treats PUBLIC_SITE_ENV=preview as preview', () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    expect(isPreviewSite()).toBe(true);
    expect(getRobotsMetaContent()).toBe('noindex, nofollow');
  });

  it('treats PUBLIC_SITE_ENV=production as production even if branch is set', () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'production');
    vi.stubEnv('CF_PAGES_BRANCH', 'feat/something');
    expect(isPreviewSite()).toBe(false);
  });

  it('treats non-main CF_PAGES_BRANCH as preview when SITE_ENV unset', () => {
    vi.stubEnv('CF_PAGES_BRANCH', 'feat/p0-cor-cta');
    expect(isPreviewSite()).toBe(true);
  });

  it('treats main CF_PAGES_BRANCH as production when SITE_ENV unset', () => {
    vi.stubEnv('CF_PAGES_BRANCH', 'main');
    expect(isPreviewSite()).toBe(false);
  });
});
