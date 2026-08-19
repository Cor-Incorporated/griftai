import { describe, expect, it } from 'vitest';
import {
  getPublicClaim,
  getPublicClaimRegistry,
  publicClaimCatalog,
} from '../../src/lib/public-claims';

describe('public claim catalog', () => {
  it('classifies every public sitemap route', () => {
    expect(publicClaimCatalog.routes).toHaveLength(19);

    for (const route of publicClaimCatalog.routes) {
      const registry = getPublicClaimRegistry(route.url);
      expect(registry?.route).toEqual(route);
      expect(registry?.claims.map((claim) => claim.id)).toContain(route.seoClaimId);
      expect(registry?.claims.map((claim) => claim.id)).toEqual(
        expect.arrayContaining(route.bodyClaimIds)
      );
    }
  });

  it('keeps the human-final decision boundary explicit', () => {
    const claim = getPublicClaim('PUB-COLUMN-HUMAN-FINAL');

    expect(claim.class).toBe('human-final');
    expect(claim.state).toBe('human-decision-required');
    expect(claim.text).toContain('人間が確認して決定します');
  });

  it('does not present beta claims as current verified capability', () => {
    const betaClaims = publicClaimCatalog.claims.filter((claim) =>
      claim.sourceUrls.some((url) => url.includes('column') || url === '/')
    );

    expect(betaClaims.some((claim) => claim.class === 'planned-beta')).toBe(true);
    expect(betaClaims.some((claim) => claim.class === 'Grift-current')).toBe(false);
  });
});
