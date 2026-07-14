import { describe, expect, it } from 'vitest';
import {
  createPreviewReleaseMetadata,
  GRIFT_LP_REPOSITORY,
  GRIFT_LP_SERVICE,
} from '../../src/lib/release-metadata';

const SHA = '0123456789abcdef0123456789abcdef01234567';

describe('createPreviewReleaseMetadata', () => {
  it('returns the exact UAT runner schema', () => {
    const metadata = createPreviewReleaseMetadata({
      PUBLIC_RELEASE_CANDIDATE_SHA: SHA,
      PUBLIC_RELEASE_DEPLOYMENT_ID: 'pages-preview-62.1',
      PUBLIC_RELEASE_ID: 'cloudia-grift-uat-20260714',
    });

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
      service: GRIFT_LP_SERVICE,
      repository: GRIFT_LP_REPOSITORY,
      candidate_sha: SHA,
      deployment_id: 'pages-preview-62.1',
      release_id: 'cloudia-grift-uat-20260714',
    });
  });

  it('accepts the Cloudflare commit SHA when the explicit SHA is absent', () => {
    expect(
      createPreviewReleaseMetadata({
        CF_PAGES_COMMIT_SHA: SHA,
        PUBLIC_RELEASE_DEPLOYMENT_ID: 'pages-preview-62',
        PUBLIC_RELEASE_ID: 'release-1',
      }).candidate_sha
    ).toBe(SHA);
  });

  it.each([
    [{}, /candidate/i],
    [{ PUBLIC_RELEASE_CANDIDATE_SHA: 'ABC' }, /candidate/i],
    [{ PUBLIC_RELEASE_CANDIDATE_SHA: SHA }, /PUBLIC_RELEASE_DEPLOYMENT_ID/],
    [
      {
        PUBLIC_RELEASE_CANDIDATE_SHA: SHA,
        PUBLIC_RELEASE_DEPLOYMENT_ID: '../unsafe',
        PUBLIC_RELEASE_ID: 'release-1',
      },
      /PUBLIC_RELEASE_DEPLOYMENT_ID/,
    ],
    [
      {
        PUBLIC_RELEASE_CANDIDATE_SHA: SHA,
        PUBLIC_RELEASE_DEPLOYMENT_ID: 'pages-preview-62',
      },
      /PUBLIC_RELEASE_ID/,
    ],
  ])('fails closed for missing or invalid Preview provenance %#', (env, error) => {
    expect(() => createPreviewReleaseMetadata(env)).toThrow(error);
  });
});
