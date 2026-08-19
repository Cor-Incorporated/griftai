#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = join(ROOT, 'src/data/public-claims.json');
const ASTRO_CONFIG_PATH = join(ROOT, 'astro.config.mjs');
const SHA_RE = /^[0-9a-f]{40}$/;
const ID_RE = /^PUB-[A-Z0-9-]+$/;

const expectedState = new Map([
  ['general-method', 'general-guidance'],
  ['Grift-current', 'live-verified'],
  ['planned-beta', 'beta-validation'],
  ['human-final', 'human-decision-required'],
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
    re: /(?:瞬時|専門(?:的な)?知識がなくても|専門(?:的な)?知識を持っていなくても|自動で起票|精度の高い|誰もが一定の品質|正確でスピーディー|スピーディーかつ正確|意思決定の圧倒的|圧倒的なスピード|翌朝には根拠のある概算|自動的に必要な項目をヒアリング|高精度な要件定義|客観的で高精度|適正に管理できます|受注率のアップ|AIに代替することで)/g,
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

if (!existsSync(MANIFEST_PATH)) fail(['src/data/public-claims.json is missing']);

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const errors = [];

if (manifest.schemaVersion !== 1) errors.push('schemaVersion must be 1');
if (!SHA_RE.test(manifest.baselineSourceRevision ?? '')) {
  errors.push('baselineSourceRevision must be an exact 40-character SHA');
}

const allowedClasses = new Set(manifest.classes ?? []);
if (allowedClasses.size !== 4) errors.push('exactly four claim classes are required');

const claimsById = new Map();
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
  }
  if (!Array.isArray(claim.sourcePaths) || claim.sourcePaths.length === 0) {
    errors.push(`${claim.id}: sourcePaths must not be empty`);
  }
  if (!Array.isArray(claim.sourceUrls) || claim.sourceUrls.length === 0) {
    errors.push(`${claim.id}: sourceUrls must not be empty`);
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
for (const route of manifest.routes ?? []) {
  route.url = normalizePathname(route.url);
  if (routeUrls.has(route.url)) errors.push(`duplicate route: ${route.url}`);
  routeUrls.add(route.url);
  if (!existsSync(join(ROOT, route.sourcePath ?? ''))) {
    errors.push(`${route.url}: missing sourcePath ${route.sourcePath ?? '<missing>'}`);
  }
  const requiredIds = [route.seoClaimId, ...(route.bodyClaimIds ?? [])];
  for (const id of requiredIds) {
    const claim = claimsById.get(id);
    if (!claim) {
      errors.push(`${route.url}: unknown claim id ${id}`);
      continue;
    }
    if (!claim.sourceUrls.map(normalizePathname).includes(route.url)) {
      errors.push(`${route.url}: ${id} does not list this source URL`);
    }
    if (!claim.sourcePaths.includes(route.sourcePath)) {
      errors.push(`${route.url}: ${id} does not list ${route.sourcePath}`);
    }
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

for (const route of manifest.routes ?? []) {
  const source = readFileSync(join(ROOT, route.sourcePath), 'utf8');
  for (const rule of riskyProductRules) {
    rule.re.lastIndex = 0;
    if (rule.re.test(source)) errors.push(`${route.sourcePath}: ${rule.name}`);
  }
}

if (errors.length > 0) fail(errors);

console.log(
  `public claim source guard: OK (${claimsById.size} claims, ${routeUrls.size} public routes)`
);
