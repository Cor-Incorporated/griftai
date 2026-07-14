#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const preview =
  process.env.PUBLIC_SITE_ENV === 'preview' ||
  (!process.env.PUBLIC_SITE_ENV &&
    Boolean(process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main'));
const releasePath = join(process.cwd(), 'dist', 'release.json');
const headersPath = join(process.cwd(), 'dist', '_headers');

if (
  process.env.PUBLIC_SITE_ENV &&
  !['production', 'preview'].includes(process.env.PUBLIC_SITE_ENV)
) {
  throw new Error('PUBLIC_SITE_ENV must be production or preview');
}

if (!existsSync(headersPath)) throw new Error('dist/_headers is missing');
const headers = readFileSync(headersPath, 'utf8');
const releaseBlock = headers.match(/(?:^|\n)\/release\.json\n((?:[ \t]+[^\n]+\n?)+)/)?.[1] ?? '';
if (!/^\s+Cache-Control:\s*no-store\s*$/im.test(releaseBlock)) {
  throw new Error('/release.json must set Cache-Control: no-store');
}
if (!/^\s+X-Content-Type-Options:\s*nosniff\s*$/im.test(releaseBlock)) {
  throw new Error('/release.json must set X-Content-Type-Options: nosniff');
}
if (!/^\s+!\s+Access-Control-Allow-Origin\s*$/im.test(releaseBlock)) {
  throw new Error('/release.json must detach the default Access-Control-Allow-Origin header');
}
if (/^\s+Access-Control-Allow-Origin\s*:/im.test(releaseBlock)) {
  throw new Error('/release.json must not attach an Access-Control-Allow-Origin value');
}

if (!preview) {
  if (existsSync(releasePath)) throw new Error('production build must not emit release.json');
  console.log('check-release-artifact: OK (production omits Preview metadata)');
  process.exit(0);
}

if (!existsSync(releasePath)) throw new Error('Preview build must emit release.json');
const release = JSON.parse(readFileSync(releasePath, 'utf8'));
const expectedKeys = [
  'candidate_sha',
  'deployment_id',
  'release_id',
  'repository',
  'service',
  'status',
];
if (JSON.stringify(Object.keys(release).sort()) !== JSON.stringify(expectedKeys)) {
  throw new Error('release.json schema mismatch');
}
if (
  release.status !== 'ok' ||
  release.service !== 'grift-lp' ||
  release.repository !== 'Cor-Incorporated/griftai' ||
  release.candidate_sha !==
    (process.env.PUBLIC_RELEASE_CANDIDATE_SHA ?? process.env.CF_PAGES_COMMIT_SHA) ||
  release.deployment_id !== process.env.PUBLIC_RELEASE_DEPLOYMENT_ID ||
  release.release_id !== process.env.PUBLIC_RELEASE_ID
) {
  throw new Error('release.json provenance does not match the Preview build environment');
}

console.log('check-release-artifact: OK (Preview provenance and headers contract)');
