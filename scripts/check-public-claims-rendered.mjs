#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/data/public-claims.json'), 'utf8'));
const claimsById = new Map(manifest.claims.map((claim) => [claim.id, claim]));
const globalSeoDescription = normalize(claimsById.get('PUB-HOME-BETA-SCOPE').text);
const errors = [];

function normalize(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16))
    )
    .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 10)))
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#x27;', "'")
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlPathFor(url) {
  return url === '/' ? join(ROOT, 'dist/index.html') : join(ROOT, 'dist', url, 'index.html');
}

function metaContent(html, key, value) {
  const tags = html.match(/<meta\s+[^>]*>/g) ?? [];
  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(`${key}=["']${value.replaceAll(':', '\\:')}["']`));
    if (!keyMatch) continue;
    return normalize(tag.match(/content=["']([^"']*)["']/)?.[1] ?? '');
  }
  return undefined;
}

function collectDescriptions(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectDescriptions(item, output);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'description' && typeof item === 'string') output.push(normalize(item));
      collectDescriptions(item, output);
    }
  }
  return output;
}

for (const route of manifest.routes) {
  const path = htmlPathFor(route.url);
  if (!existsSync(path)) {
    errors.push(`${route.url}: rendered file is missing (${path})`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const seoClaim = claimsById.get(route.seoClaimId);
  const expectedSeo = normalize(seoClaim.text);

  const registryRaw = html.match(
    /<script[^>]*data-public-claim-registry[^>]*>([\s\S]*?)<\/script>/
  )?.[1];
  if (!registryRaw) {
    errors.push(`${route.url}: rendered claim registry is missing`);
  } else {
    try {
      const registry = JSON.parse(registryRaw);
      if (registry.route?.url !== route.url) errors.push(`${route.url}: registry route drift`);
      const renderedIds = new Set((registry.claims ?? []).map((claim) => claim.id));
      for (const id of new Set([route.seoClaimId, ...route.bodyClaimIds])) {
        if (!renderedIds.has(id)) errors.push(`${route.url}: registry is missing ${id}`);
      }
      for (const rendered of registry.claims ?? []) {
        const source = claimsById.get(rendered.id);
        if (!source || JSON.stringify(rendered) !== JSON.stringify(source)) {
          errors.push(`${route.url}: rendered registry drift for ${rendered.id}`);
        }
      }
    } catch (error) {
      errors.push(`${route.url}: invalid rendered claim registry (${error.message})`);
    }
  }

  const metaDescriptions = [
    metaContent(html, 'name', 'description'),
    metaContent(html, 'property', 'og:description'),
    metaContent(html, 'property', 'twitter:description'),
  ];
  for (const [index, actual] of metaDescriptions.entries()) {
    if (actual !== expectedSeo) errors.push(`${route.url}: meta description ${index + 1} drift`);
  }

  const jsonLdDescriptions = [];
  for (const raw of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      collectDescriptions(JSON.parse(raw[1]), jsonLdDescriptions);
    } catch (error) {
      errors.push(`${route.url}: invalid JSON-LD (${error.message})`);
    }
  }
  if (!jsonLdDescriptions.includes(expectedSeo)) {
    errors.push(`${route.url}: JSON-LD description is not the SEO claim`);
  }
  const allowedJsonLdDescriptions = new Set([globalSeoDescription, expectedSeo]);
  for (const actual of jsonLdDescriptions) {
    if (!allowedJsonLdDescriptions.has(actual)) {
      errors.push(`${route.url}: unregistered JSON-LD description drift (${actual})`);
    }
  }

  const bodyRaw = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
  const bodyText = normalize(
    bodyRaw
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
  for (const id of route.bodyClaimIds) {
    const expected = normalize(claimsById.get(id).text);
    if (!bodyText.includes(expected)) errors.push(`${route.url}: body is missing ${id}`);
  }
}

if (errors.length > 0) {
  console.error('public claim rendered guard: FAIL\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `public claim rendered guard: OK (${manifest.claims.length} claims, ${manifest.routes.length} public routes)`
);
