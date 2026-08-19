import catalogJson from '../data/public-claims.json';

export type PublicClaimClass = 'general-method' | 'Grift-current' | 'planned-beta' | 'human-final';

export interface PublicClaimEvidence {
  sourceRevision: string;
  deployedRevision: string;
  observedAt: string;
  evidenceRef: string;
}

export interface PublicClaim {
  id: string;
  class: PublicClaimClass;
  state: string;
  text: string;
  jsonLdQuestion?: string;
  sourcePaths: string[];
  sourceUrls: string[];
  surfaces: Array<'meta' | 'json-ld' | 'body'>;
  evidence?: PublicClaimEvidence;
}

export interface PublicClaimRoute {
  url: string;
  sourcePath: string;
  seoClaimId: string;
  bodyClaimIds: string[];
}

interface PublicClaimCatalog {
  schemaVersion: number;
  baselineSourceRevision: string;
  classes: PublicClaimClass[];
  claims: PublicClaim[];
  routes: PublicClaimRoute[];
}

export const publicClaimCatalog = catalogJson as PublicClaimCatalog;

const claimsById = new Map(publicClaimCatalog.claims.map((claim) => [claim.id, claim]));
const routesByUrl = new Map(publicClaimCatalog.routes.map((route) => [route.url, route]));

export function getPublicClaim(id: string): PublicClaim {
  const claim = claimsById.get(id);
  if (!claim) {
    throw new Error(`Unknown public claim: ${id}`);
  }
  return claim;
}

export function getPublicClaimRoute(url: string): PublicClaimRoute | undefined {
  return routesByUrl.get(url);
}

export function getPublicClaimRegistry(url: string) {
  const route = getPublicClaimRoute(url);
  if (!route) return undefined;

  const ids = [route.seoClaimId, ...route.bodyClaimIds];
  const claims = [...new Set(ids)].map(getPublicClaim);

  return {
    schemaVersion: publicClaimCatalog.schemaVersion,
    baselineSourceRevision: publicClaimCatalog.baselineSourceRevision,
    route,
    claims,
  };
}
