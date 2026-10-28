#!/usr/bin/env node
/**
 * CMS の config.yml・認証 Worker・管理画面が src/config/cms-contract.ts と一致するかを見る。
 * 秘密情報（OAuth の secret、account_id）がファイルに無いことも見る。
 * 推敲は yomiyasu（どのモデルでも同じスクリプト）で行い、ここから LLM は呼ばない。
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  articleFields,
  authWorker,
  cmsBackend,
  cmsCollections,
  cmsCommitMessages,
  cmsMedia,
  cmsOutput,
  cmsSite,
  cmsSlug,
  newsFields,
} from '../src/config/cms-contract.ts';

const ROOT = process.cwd();
const failures = [];

const fail = (message) => {
  failures.push(message);
};

const read = (path) => readFileSync(join(ROOT, path), 'utf8');

const same = (actual, expected, label) => {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${label}\n  actual: ${left}\n  expected: ${right}`);
};

const isRequired = (field) => field.required !== false;

/**
 * @param {unknown[]} actualFields
 * @param {readonly import('../src/config/cms-contract.ts').CmsField[]} expectedFields
 * @param {string} path
 */
const assertFields = (actualFields, expectedFields, path) => {
  if (!Array.isArray(actualFields)) {
    fail(`${path} is not a list`);
    return;
  }
  if (actualFields.length !== expectedFields.length) {
    fail(
      `${path} has ${actualFields.length} fields, contract has ${expectedFields.length} (${expectedFields
        .map((field) => field.name)
        .join(', ')})`
    );
    return;
  }
  actualFields.forEach((actual, index) => {
    const expected = expectedFields[index];
    const here = `${path}[${index}] ${expected.name}`;
    if (!actual || typeof actual !== 'object') {
      fail(`${here} is missing`);
      return;
    }
    same(actual.name, expected.name, `${here} name`);
    same(actual.label, expected.label, `${here} label`);
    same(actual.widget, expected.widget, `${here} widget`);
    same(isRequired(actual), expected.required, `${here} required`);
    if (expected.default !== undefined) same(actual.default, expected.default, `${here} default`);
    if (expected.options) {
      same(
        (actual.options ?? []).map((option) => ({ label: option.label, value: option.value })),
        expected.options.map((option) => ({ label: option.label, value: option.value })),
        `${here} options`
      );
    }
    if (expected.accept) {
      same(actual.accept, expected.accept, `${here} accept`);
      if (String(actual.accept).includes('svg')) fail(`${here} accepts svg`);
    }
    if (expected.format) same(actual.format, expected.format, `${here} format`);
    if (expected.dateType) same(actual.type, expected.dateType, `${here} type`);
    if (expected.modes) same(actual.modes, [...expected.modes], `${here} modes`);
    if (expected.fields) assertFields(actual.fields, expected.fields, `${here}.fields`);
  });
};

const configText = read('cms/public/config.yml');
if (configText.includes('api.netlify.com')) fail('config.yml points at api.netlify.com');
const config = parse(configText);

same(config.backend?.name, cmsBackend.name, 'backend.name');
same(config.backend?.repo, cmsBackend.repo, 'backend.repo');
same(config.backend?.branch, cmsBackend.branch, 'backend.branch');
same(config.backend?.base_url, cmsBackend.baseUrl, 'backend.base_url');
same(config.backend?.auth_methods, [...cmsBackend.authMethods], 'backend.auth_methods');
same(config.backend?.auth_scope, cmsBackend.authScope, 'backend.auth_scope');
same(config.backend?.squash_merges, cmsBackend.squashMerges, 'backend.squash_merges');
same(config.backend?.commit_messages, { ...cmsCommitMessages }, 'backend.commit_messages');
same(config.publish_mode, 'editorial_workflow', 'publish_mode');
same(config.app_title, cmsSite.appTitle, 'app_title');
same(config.logo?.src, cmsSite.logoSrc, 'logo.src');
same(config.site_url, cmsSite.siteUrl, 'site_url');
same(config.media_folder, cmsMedia.mediaFolder, 'media_folder');
same(config.public_folder, cmsMedia.publicFolder, 'public_folder');
same(config.media_libraries?.default?.config?.slugify_filename, true, 'slugify_filename');
same(config.media_libraries?.stock_assets, false, 'stock_assets');
same(config.media_libraries?.default?.config?.transformations?.jpeg?.format, 'webp', 'jpeg webp');
same(config.slug?.encoding, cmsSlug.encoding, 'slug.encoding');
same(config.slug?.clean_accents, cmsSlug.cleanAccents, 'slug.clean_accents');
same(config.output?.omit_empty_optional_fields, cmsOutput.omitEmptyOptionalFields, 'omit empty');
same(config.output?.yaml?.quote, cmsOutput.yamlQuote, 'yaml.quote');

if (!Array.isArray(config.collections) || config.collections.length !== cmsCollections.length) {
  fail(`collections length ${config.collections?.length} !== ${cmsCollections.length}`);
} else {
  config.collections.forEach((collection, index) => {
    const expected = cmsCollections[index];
    const here = `collections[${index}] ${expected.name}`;
    same(collection.name, expected.name, `${here} name`);
    same(collection.label, expected.label, `${here} label`);
    same(collection.label_singular, expected.labelSingular, `${here} label_singular`);
    same(collection.folder, expected.folder, `${here} folder`);
    same(collection.create, true, `${here} create`);
    same(collection.delete, true, `${here} delete`);
    same(collection.extension, 'md', `${here} extension`);
    same(collection.format, 'yaml-frontmatter', `${here} format`);
    same(collection.preview_path, expected.previewPath, `${here} preview_path`);
    same(collection.sortable_fields?.default?.field, expected.sortableField, `${here} sort`);
    same(collection.slug?.editable, ['create'], `${here} slug.editable`);
    same(collection.slug?.pattern?.[0], cmsSlug.pattern, `${here} slug.pattern`);
    same(collection.slug?.pattern?.[1], cmsSlug.patternMessage, `${here} slug message`);
    same(collection.aliases_field, false, `${here} aliases_field`);
    const fields = expected.name === 'articles' ? articleFields : newsFields;
    assertFields(collection.fields, fields, `${here}.fields`);
  });
}

const wrangler = read('workers/sveltia-cms-auth/wrangler.toml');
const tomlValue = (key) => {
  const match = wrangler.match(new RegExp(`^${key} = "([^"]*)"`, 'm'));
  return match ? match[1] : undefined;
};
same(tomlValue('name'), authWorker.name, 'wrangler name');
same(tomlValue('compatibility_date'), authWorker.compatibilityDate, 'wrangler compatibility_date');
same(tomlValue('ALLOWED_DOMAINS'), authWorker.allowedDomains, 'ALLOWED_DOMAINS');
if (/^\s*account_id\s*=/m.test(wrangler)) fail('wrangler.toml must not commit account_id');
if (/GITHUB_CLIENT_(ID|SECRET)\s*=\s*["'][^"']+["']/m.test(wrangler)) {
  fail('wrangler.toml must not commit GitHub OAuth credentials');
}
if (!authWorker.allowedDomains.trim() || authWorker.allowedDomains.includes('*')) {
  fail('ALLOWED_DOMAINS is empty or contains *');
}
if (authWorker.allowedDomains.includes('--')) fail('ALLOWED_DOMAINS contains a preview host');

const blob = (path) =>
  execFileSync('git', ['hash-object', path], { cwd: ROOT, encoding: 'utf8' }).trim();
same(blob('workers/sveltia-cms-auth/src/index.js'), authWorker.indexBlob, 'auth worker blob');
same(blob('workers/sveltia-cms-auth/LICENSE.txt'), authWorker.licenseBlob, 'auth license blob');

const indexHtml = read('cms/index.html');
if (!indexHtml.includes('noindex, nofollow')) fail('cms/index.html is missing noindex');
if (!indexHtml.includes('rel="cms-config-url" href="/config.yml"')) {
  fail('cms/index.html config link');
}
if (!indexHtml.includes(cmsSite.appTitle)) fail('cms/index.html title');

const headers = read('cms/public/_headers');
for (const piece of [
  "default-src 'none'",
  "script-src 'self'",
  'https://api.github.com',
  "frame-ancestors 'none'",
  'Cross-Origin-Opener-Policy: same-origin-allow-popups',
  'X-Robots-Tag: noindex, nofollow',
]) {
  if (!headers.includes(piece)) fail(`cms/public/_headers missing ${piece}`);
}
if (headers.includes('api.netlify.com')) fail('_headers allows api.netlify.com');
if (cmsBackend.baseUrl.startsWith('https://')) {
  const origin = new URL(cmsBackend.baseUrl).origin;
  if (!headers.includes(origin)) fail(`_headers connect-src missing ${origin}`);
}

const viteConfig = read('cms/vite.config.mjs');
if (!viteConfig.includes('port: cmsSite.devPort')) fail('cms dev port is not cmsSite.devPort');

const siteTs = read('src/config/site.ts');
if (!siteTs.includes(`'${cmsSite.siteUrl}'`)) fail('site.ts does not use cms siteUrl');

const docs = read('docs/cms.md');
for (const piece of [
  cmsBackend.baseUrl,
  authWorker.allowedDomains,
  `localhost:${cmsSite.devPort}`,
]) {
  if (!docs.includes(piece)) fail(`docs/cms.md missing ${piece}`);
}

const contentDirs = ['src/content/articles', 'src/content/news'];
for (const dir of contentDirs) {
  for (const file of readdirSync(join(ROOT, dir))) {
    if (!file.endsWith('.md')) continue;
    if (!cmsSlug.pattern || !new RegExp(cmsSlug.pattern).test(file.replace(/\.md$/, ''))) {
      fail(`${dir}/${file} slug does not match ${cmsSlug.pattern}`);
    }
    const text = read(join(dir, file));
    if (text.includes('試行')) fail(`${dir}/${file} uses 試行`);
  }
}

if (failures.length > 0) {
  console.error('check-cms: failed\n');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('check-cms: OK');
