#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, 'src/data/public-claims.json');
const ASTRO_CONFIG_PATH = join(ROOT, 'astro.config.mjs');
const GITLEAKS_IGNORE_PATH = join(ROOT, '.gitleaksignore');
const SHA_RE = /^[0-9a-f]{40}$/;
const ID_RE = /^PUB-[A-Z0-9-]+$/;

const expectedInheritedGitleaksFingerprints = [
  '18d3e7b94bd29c21e988effe323a437882d4a966:src/content/blog/environment-variables-guide.md:generic-api-key:27',
  '18d3e7b94bd29c21e988effe323a437882d4a966:src/content/blog/environment-variables-guide.md:generic-api-key:39',
  '18d3e7b94bd29c21e988effe323a437882d4a966:src/content/blog/environment-variables-guide.md:generic-api-key:135',
  '18d3e7b94bd29c21e988effe323a437882d4a966:src/content/blog/environment-variables-guide.md:stripe-access-token:75',
];

const expectedClasses = ['general-method', 'Grift-current', 'planned-beta', 'human-final'];
const expectedState = new Map([
  ['general-method', 'general-guidance'],
  ['Grift-current', 'live-verified'],
  ['planned-beta', 'beta-validation'],
  ['human-final', 'human-decision-required'],
]);
const expectedSurfaces = new Set(['meta', 'json-ld', 'body']);
const publishableSourceRoots = ['src'];
const publishableExtensions = new Set([
  '.astro',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
]);

const riskyProductRules = [
  {
    name: 'product-absolute-automation',
    re: /(?:Grift|Cor株式会社(?:が提供する|のサービス)?)[^<]{0,260}?(?:瞬時|専門(?:的な)?知識がなくても|精度の高い|正確な仕様|自動(?:で|的に)(?:照合|算出|生成|起票|登録)|適正な(?:相場|価格)|根本から管理|ワンストップで実現|誰もが)/g,
  },
  {
    name: 'automatic-ticket-dispatch',
    re: /(?:(?:Slack|Jira)[\s\S]{0,160}(?:自動(?:起票|登録|送信|連携)|自動的に)|(?:自動(?:起票|登録|送信|連携)|自動的に)[\s\S]{0,160}(?:Slack|Jira))/g,
  },
  {
    name: 'instant-objective-product-result',
    re: /(?:Grift|Cor株式会社)[^<]{0,260}(?:客観的|適正)[^<]{0,100}(?:瞬時|完了します|実現します)/g,
  },
  {
    name: 'unbounded-column-result',
    re: /(?:瞬時|専門(?:的な)?知識がなくても|専門(?:的な)?知識を持っていなくても|自動で起票|精度の高い|誰もが一定の品質|正確でスピーディー|スピーディーかつ正確|意思決定の圧倒的|圧倒的なスピード|翌朝には根拠のある概算|自動的に必要な項目をヒアリング|高精度な要件定義|客観的で高精度|適正に管理できます|受注率のアップ|AIに代替することで|稟議をスムーズに通過|属人化が解消され|費用を大幅に削減できます|完全にフィットした高い競争力|成功への第一歩)/g,
  },
  {
    name: 'unbounded-provider-promise',
    re: /(?:Cor株式会社[^<]{0,120}(?:にお任せ|課題を解決し|成功へと導き)|(?:にお任せ|課題を解決し|成功へと導き)[^<]{0,120}Cor株式会社)/g,
  },
];

function fail(errors) {
  console.error('public claim source guard: FAIL\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

function normalizePathname(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function sameStringSet(actual, expected) {
  return (
    actual.length === expected.length &&
    new Set(actual).size === actual.length &&
    actual.every((value) => expected.includes(value))
  );
}

function extension(path) {
  const index = path.lastIndexOf('.');
  return index === -1 ? '' : path.slice(index);
}

function collectPublishableSources(relativeDirectory, output = []) {
  const absoluteDirectory = join(ROOT, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return output;

  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      collectPublishableSources(relativePath, output);
    } else if (entry.isFile() && publishableExtensions.has(extension(entry.name))) {
      output.push(relativePath);
    }
  }
  return output;
}

if (!existsSync(MANIFEST_PATH)) fail(['src/data/public-claims.json is missing']);

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const errors = [];

if (!existsSync(GITLEAKS_IGNORE_PATH)) {
  errors.push('.gitleaksignore is missing');
} else {
  const fingerprints = readFileSync(GITLEAKS_IGNORE_PATH, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!sameStringSet(fingerprints, expectedInheritedGitleaksFingerprints)) {
    errors.push('.gitleaksignore must contain only the four exact immutable-ancestor fingerprints');
  }
}

if (manifest.schemaVersion !== 1) errors.push('schemaVersion must be 1');
if (!SHA_RE.test(manifest.baselineSourceRevision ?? '')) {
  errors.push('baselineSourceRevision must be an exact 40-character SHA');
}

const declaredClasses = Array.isArray(manifest.classes) ? manifest.classes : [];
if (!Array.isArray(manifest.classes) || !sameStringSet(declaredClasses, expectedClasses)) {
  errors.push(`claim classes must be exactly: ${expectedClasses.join(', ')}`);
}
const allowedClasses = new Set(expectedClasses);

const claimsById = new Map();
const claimTexts = new Map();
for (const claim of manifest.claims ?? []) {
  if (!ID_RE.test(claim.id ?? '')) errors.push(`invalid claim id: ${claim.id ?? '<missing>'}`);
  if (claimsById.has(claim.id)) errors.push(`duplicate claim id: ${claim.id}`);
  claimsById.set(claim.id, claim);

  if (!allowedClasses.has(claim.class))
    errors.push(`${claim.id}: unsupported class ${claim.class}`);
  if (expectedState.get(claim.class) !== claim.state) {
    errors.push(`${claim.id}: ${claim.class} requires state=${expectedState.get(claim.class)}`);
  }
  if (typeof claim.text !== 'string' || claim.text.trim().length < 10) {
    errors.push(`${claim.id}: claim text is missing or too short`);
  } else {
    const normalizedText = claim.text.replace(/\s+/g, ' ').trim();
    if (claimTexts.has(normalizedText)) {
      errors.push(`${claim.id}: duplicate claim text with ${claimTexts.get(normalizedText)}`);
    }
    claimTexts.set(normalizedText, claim.id);
  }
  if (!Array.isArray(claim.sourcePaths) || claim.sourcePaths.length === 0) {
    errors.push(`${claim.id}: sourcePaths must not be empty`);
  }
  if (!Array.isArray(claim.sourceUrls) || claim.sourceUrls.length === 0) {
    errors.push(`${claim.id}: sourceUrls must not be empty`);
  }
  if (!Array.isArray(claim.surfaces) || claim.surfaces.length === 0) {
    errors.push(`${claim.id}: surfaces must not be empty`);
  } else {
    if (new Set(claim.surfaces).size !== claim.surfaces.length) {
      errors.push(`${claim.id}: surfaces must not contain duplicates`);
    }
    for (const surface of claim.surfaces) {
      if (!expectedSurfaces.has(surface)) {
        errors.push(`${claim.id}: unsupported surface ${surface}`);
      }
    }
  }
  if (
    claim.jsonLdQuestion !== undefined &&
    (typeof claim.jsonLdQuestion !== 'string' || claim.jsonLdQuestion.trim().length < 5)
  ) {
    errors.push(`${claim.id}: jsonLdQuestion must be a non-empty question`);
  }
  if (claim.jsonLdQuestion !== undefined && !(claim.surfaces ?? []).includes('json-ld')) {
    errors.push(`${claim.id}: jsonLdQuestion requires a json-ld surface`);
  }
  for (const sourcePath of claim.sourcePaths ?? []) {
    const absolute = join(ROOT, sourcePath);
    if (!existsSync(absolute)) {
      errors.push(`${claim.id}: missing source path ${sourcePath}`);
      continue;
    }
    if (!readFileSync(absolute, 'utf8').includes(claim.id)) {
      errors.push(`${claim.id}: ${sourcePath} does not reference the stable claim id`);
    }
  }

  if (claim.class === 'Grift-current') {
    const evidence = claim.evidence ?? {};
    if (!SHA_RE.test(evidence.sourceRevision ?? '')) {
      errors.push(`${claim.id}: Grift-current requires exact evidence.sourceRevision`);
    }
    if (!SHA_RE.test(evidence.deployedRevision ?? '')) {
      errors.push(`${claim.id}: Grift-current requires exact evidence.deployedRevision`);
    }
    if (Number.isNaN(Date.parse(evidence.observedAt ?? ''))) {
      errors.push(`${claim.id}: Grift-current requires evidence.observedAt`);
    }
    if (!evidence.evidenceRef || /TODO|UNVERIFIED|NOT_PROVEN/i.test(evidence.evidenceRef)) {
      errors.push(`${claim.id}: Grift-current requires a proven evidenceRef`);
    }
  }
}

const routeUrls = new Set();
const referencedUrlsByClaim = new Map([...claimsById.keys()].map((id) => [id, new Set()]));
for (const route of manifest.routes ?? []) {
  const routeUrl = normalizePathname(route.url);
  const routeSourcePath = join(ROOT, route.sourcePath ?? '');
  if (routeUrls.has(routeUrl)) errors.push(`duplicate route: ${routeUrl}`);
  routeUrls.add(routeUrl);
  if (!existsSync(routeSourcePath)) {
    errors.push(`${routeUrl}: missing sourcePath ${route.sourcePath ?? '<missing>'}`);
  }
  const requiredIds = [route.seoClaimId, ...(route.bodyClaimIds ?? [])];
  if (new Set(route.bodyClaimIds ?? []).size !== (route.bodyClaimIds ?? []).length) {
    errors.push(`${routeUrl}: bodyClaimIds must not contain duplicates`);
  }
  for (const id of requiredIds) {
    const claim = claimsById.get(id);
    if (!claim) {
      errors.push(`${routeUrl}: unknown claim id ${id}`);
      continue;
    }
    referencedUrlsByClaim.get(id).add(routeUrl);
    if (!(claim.sourceUrls ?? []).map(normalizePathname).includes(routeUrl)) {
      errors.push(`${routeUrl}: ${id} does not list this source URL`);
    }
    if (!(claim.sourcePaths ?? []).includes(route.sourcePath)) {
      errors.push(`${routeUrl}: ${id} does not list ${route.sourcePath}`);
    }
  }

  const seoClaim = claimsById.get(route.seoClaimId);
  if (seoClaim) {
    if (seoClaim.jsonLdQuestion !== undefined) {
      errors.push(`${routeUrl}: SEO claim ${seoClaim.id} must not declare jsonLdQuestion`);
    }
    for (const surface of ['meta', 'json-ld']) {
      if (!(seoClaim.surfaces ?? []).includes(surface)) {
        errors.push(`${routeUrl}: SEO claim ${seoClaim.id} must declare ${surface}`);
      }
    }
  }
  for (const id of route.bodyClaimIds ?? []) {
    const claim = claimsById.get(id);
    if (claim && !(claim.surfaces ?? []).includes('body')) {
      errors.push(`${routeUrl}: body claim ${id} must declare body`);
    }
    if (claim && id !== route.seoClaimId && (claim.surfaces ?? []).includes('json-ld')) {
      if (typeof claim.jsonLdQuestion !== 'string') {
        errors.push(`${routeUrl}: JSON-LD body claim ${id} requires jsonLdQuestion`);
      } else if (existsSync(routeSourcePath)) {
        const routeSource = readFileSync(routeSourcePath, 'utf8');
        if (!routeSource.includes(claim.jsonLdQuestion)) {
          errors.push(`${routeUrl}: ${id} jsonLdQuestion is missing from ${route.sourcePath}`);
        }
      }
    }
  }
}

for (const claim of claimsById.values()) {
  const declaredUrls = (claim.sourceUrls ?? []).map(normalizePathname);
  const referencedUrls = [...(referencedUrlsByClaim.get(claim.id) ?? [])];
  if (!sameStringSet(declaredUrls, referencedUrls)) {
    errors.push(
      `${claim.id}: sourceUrls must exactly match classified routes ` +
        `(declared=${declaredUrls.join(',') || '<none>'}; referenced=${referencedUrls.join(',') || '<none>'})`
    );
  }
}

const astroConfig = readFileSync(ASTRO_CONFIG_PATH, 'utf8');
const allowedBlock = astroConfig.match(/const allowedPaths = new Set\(\[([\s\S]*?)\]\)/)?.[1];
if (!allowedBlock) {
  errors.push('could not read public sitemap paths from astro.config.mjs');
} else {
  const sitemapRoutes = new Set(
    [...allowedBlock.matchAll(/'([^']+)'/g)].map((match) => normalizePathname(match[1]))
  );
  for (const route of sitemapRoutes) {
    if (!routeUrls.has(route)) errors.push(`public sitemap route is unclassified: ${route}`);
  }
  for (const route of routeUrls) {
    if (!sitemapRoutes.has(route)) errors.push(`claim route is not public in sitemap: ${route}`);
  }
}

const publishableSources = [
  ...new Set(publishableSourceRoots.flatMap((root) => collectPublishableSources(root))),
];
for (const sourcePath of publishableSources) {
  const source = readFileSync(join(ROOT, sourcePath), 'utf8');
  for (const rule of riskyProductRules) {
    rule.re.lastIndex = 0;
    if (rule.re.test(source)) errors.push(`${sourcePath}: ${rule.name}`);
  }
}

if (errors.length > 0) fail(errors);

console.log(
  `public claim source guard: OK (${claimsById.size} claims, ${routeUrls.size} public routes)`
);
