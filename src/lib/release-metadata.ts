export const GRIFT_LP_REPOSITORY = 'Cor-Incorporated/griftai';
export const GRIFT_LP_SERVICE = 'grift-lp';

const CANDIDATE_SHA_PATTERN = /^[0-9a-f]{40}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;

export interface GriftLpReleaseMetadata {
  status: 'ok';
  service: typeof GRIFT_LP_SERVICE;
  repository: typeof GRIFT_LP_REPOSITORY;
  candidate_sha: string;
  deployment_id: string;
  release_id: string;
}

export interface ReleaseMetadataEnvironment {
  PUBLIC_RELEASE_CANDIDATE_SHA?: string;
  CF_PAGES_COMMIT_SHA?: string;
  PUBLIC_RELEASE_DEPLOYMENT_ID?: string;
  PUBLIC_RELEASE_ID?: string;
}

function requireSafeId(name: string, value: string | undefined): string {
  if (!value || !SAFE_ID_PATTERN.test(value)) {
    throw new Error(`${name} must match ${SAFE_ID_PATTERN.source}`);
  }
  return value;
}

/** Build the exact public provenance document for a Preview deployment. */
export function createPreviewReleaseMetadata(
  env: ReleaseMetadataEnvironment
): GriftLpReleaseMetadata {
  const candidateSha = env.PUBLIC_RELEASE_CANDIDATE_SHA ?? env.CF_PAGES_COMMIT_SHA;
  if (!candidateSha || !CANDIDATE_SHA_PATTERN.test(candidateSha)) {
    throw new Error('PUBLIC_RELEASE_CANDIDATE_SHA or CF_PAGES_COMMIT_SHA must be 40 lowercase hex');
  }

  return {
    status: 'ok',
    service: GRIFT_LP_SERVICE,
    repository: GRIFT_LP_REPOSITORY,
    candidate_sha: candidateSha,
    deployment_id: requireSafeId('PUBLIC_RELEASE_DEPLOYMENT_ID', env.PUBLIC_RELEASE_DEPLOYMENT_ID),
    release_id: requireSafeId('PUBLIC_RELEASE_ID', env.PUBLIC_RELEASE_ID),
  };
}
