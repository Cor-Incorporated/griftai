import { rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { createPreviewReleaseMetadata } from '../lib/release-metadata';

type BuildEnvironment = Record<string, string | undefined>;

function isPreviewBuild(env: BuildEnvironment): boolean {
  const explicit = env.PUBLIC_SITE_ENV;
  if (explicit) {
    if (explicit === 'preview') return true;
    if (explicit === 'production') return false;
    throw new Error(
      `Invalid PUBLIC_SITE_ENV: expected "production" or "preview", received ${JSON.stringify(explicit)}`
    );
  }

  return Boolean(env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== 'main');
}

/** Generate /release.json for Preview only and remove stale output for production builds. */
export function releaseMetadataIntegration(env: BuildEnvironment = process.env): AstroIntegration {
  const preview = isPreviewBuild(env);
  const metadata = preview ? createPreviewReleaseMetadata(env) : null;

  return {
    name: 'grift-lp-release-metadata',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const output = fileURLToPath(new URL('release.json', dir));
        await rm(output, { force: true });
        if (metadata) {
          await writeFile(output, `${JSON.stringify(metadata)}\n`, {
            encoding: 'utf8',
            mode: 0o644,
          });
        }
      },
    },
  };
}
