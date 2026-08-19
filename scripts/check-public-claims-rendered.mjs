#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/data/public-claims.json'), 'utf8'));
const claimsById = new Map(manifest.claims.map((claim) => [claim.id, claim]));
const errors = [];
const PUBLIC_ORIGIN = 'https://griftai.org';
const SCHEMA_CONTEXT = 'https://schema.org';
const guardedSchemaTypes = new Set(['WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']);

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

function metaContents(html, key, value) {
  const contents = [];
  const tags = html.match(/<meta\s+[^>]*>/g) ?? [];
  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(`${key}=["']${value.replaceAll(':', '\\:')}["']`));
    if (!keyMatch) continue;
    contents.push(normalize(tag.match(/content=["']([^"']*)["']/)?.[1] ?? ''));
  }
  return contents;
}

function allMetaContents(html) {
  return (html.match(/<meta\s+[^>]*>/g) ?? []).map((tag) =>
    normalize(tag.match(/content=["']([^"']*)["']/)?.[1] ?? '')
  );
}

function collectStrings(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, output);
  } else if (typeof value === 'string') {
    output.push(normalize(value));
  }
  return output;
}

function collectPropertyStrings(value, property, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectPropertyStrings(item, property, output);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === property && typeof item === 'string') output.push(normalize(item));
      collectPropertyStrings(item, property, output);
    }
  }
  return output;
}

function collectSchemaNames(value, schemaType, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectSchemaNames(item, schemaType, output);
  } else if (value && typeof value === 'object') {
    if (value['@type'] === schemaType && typeof value.name === 'string') {
      output.push(normalize(value.name));
    }
    for (const item of Object.values(value)) collectSchemaNames(item, schemaType, output);
  }
  return output;
}

function schemaTypes(value) {
  const values =
    typeof value === 'string'
      ? [value]
      : Array.isArray(value)
        ? value.filter((item) => typeof item === 'string')
        : [];
  return values.map((item) => item.replace(/^https?:\/\/schema\.org\//, ''));
}

function collectGuardedSchemaRecords(
  value,
  documentIndex,
  documentContext,
  output = [],
  location = { parentProperty: undefined, parentType: undefined, path: '$' }
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectGuardedSchemaRecords(item, documentIndex, documentContext, output, {
        ...location,
        path: `${location.path}[${index}]`,
      })
    );
    return output;
  }
  if (!value || typeof value !== 'object') return output;

  const types = schemaTypes(value['@type']);
  for (const schemaType of types) {
    if (guardedSchemaTypes.has(schemaType)) {
      output.push({
        documentContext,
        documentIndex,
        parentProperty: location.parentProperty,
        parentType: location.parentType,
        path: location.path,
        schemaType,
        value,
      });
    }
  }

  for (const [property, item] of Object.entries(value)) {
    collectGuardedSchemaRecords(item, documentIndex, documentContext, output, {
      parentProperty: property,
      parentType: types.join('|') || undefined,
      path: `${location.path}.${property}`,
    });
  }
  return output;
}

function countExactStrings(values, expected) {
  return values.filter((value) => value === expected).length;
}

function countVisibleText(value, expected) {
  if (expected.length === 0) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = value.indexOf(expected, offset)) !== -1) {
    count += 1;
    offset += expected.length;
  }
  return count;
}

function collectIdentifiedClaimRecords(value, output = new Map(), parent) {
  if (Array.isArray(value)) {
    for (const item of value) collectIdentifiedClaimRecords(item, output, parent);
    return output;
  }
  if (!value || typeof value !== 'object') return output;

  if (typeof value.identifier === 'string' && value.identifier.startsWith('PUB-')) {
    const claimRecords = [];
    for (const property of ['description', 'text']) {
      if (typeof value[property] === 'string') {
        claimRecords.push({
          context:
            parent?.['@type'] === 'Question' && parent.acceptedAnswer === value
              ? normalize(parent.name)
              : undefined,
          property,
          schemaType: value['@type'],
          value: normalize(value[property]),
        });
      }
    }
    if (!output.has(value.identifier)) output.set(value.identifier, []);
    output.get(value.identifier).push(...claimRecords);
  }

  for (const item of Object.values(value)) collectIdentifiedClaimRecords(item, output, value);
  return output;
}

function hasHiddenAttribute(attributes) {
  const classValue = attributes.match(/(?:^|\s)class\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
  const hiddenClassTokens = new Set(['hidden', 'invisible', 'sr-only', 'opacity-0']);
  return (
    /(?:^|\s)hidden(?:\s|=|$)/i.test(attributes) ||
    /(?:^|\s)aria-hidden\s*=\s*["']?true(?:["']|\s|$)/i.test(attributes) ||
    /(?:^|\s)style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(
      attributes
    ) ||
    classValue.split(/\s+/).some((token) => hiddenClassTokens.has(token))
  );
}

function withoutNonVisibleHtml(value) {
  let visible = value.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  let previous;
  do {
    previous = visible;
    visible = visible.replace(
      /<([a-z][\w:-]*)\b([^>]*(?:\shidden(?=\s|=|>)|\saria-hidden\s*=\s*["']?true|\sstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["']|\sclass\s*=\s*["'](?:[^"']*\s)?(?:hidden|invisible|sr-only|opacity-0)(?=\s|["']))[^>]*)>[\s\S]*?<\/\1>/gi,
      ' '
    );
  } while (visible !== previous);
  return visible;
}

function visibleText(value) {
  return normalize(withoutNonVisibleHtml(value).replace(/<[^>]+>/g, ' '));
}

function bodyTextIncludingHidden(value) {
  return normalize(
    value.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
  );
}

function collectDetailContexts(bodyRaw) {
  const detailContexts = [];
  const detailsPattern = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
  for (const match of bodyRaw.matchAll(detailsPattern)) {
    const summary = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? '';
    detailContexts.push({
      context: visibleText(summary),
      end: (match.index ?? 0) + match[0].length,
      start: match.index ?? 0,
    });
  }
  return detailContexts;
}

function collectBodyClaimMarkers(bodyRaw, detailContexts) {
  const markers = new Map();
  const pattern =
    /<([a-z][\w:-]*)\b([^>]*\bdata-public-claim-id=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/\1>/gi;
  for (const match of bodyRaw.matchAll(pattern)) {
    const marker = {
      context: detailContexts.find(
        (detail) => (match.index ?? 0) >= detail.start && (match.index ?? 0) < detail.end
      )?.context,
      hidden: hasHiddenAttribute(match[2]),
      text: visibleText(match[4]),
    };
    if (!markers.has(match[3])) markers.set(match[3], []);
    markers.get(match[3]).push(marker);
  }
  return markers;
}

function sameStringSet(actual, expected) {
  return (
    actual.length === expected.length &&
    new Set(actual).size === actual.length &&
    actual.every((value) => expected.includes(value))
  );
}

function expectedJsonLdSignatures(route, claim) {
  if (claim.id !== route.seoClaimId) return ['Answer:text'];
  return [
    'WebSite:description',
    'WebPage:description',
    ...(route.url === '/' ? ['SoftwareApplication:description'] : []),
    ...(route.url === '/column/' ? ['CollectionPage:description'] : []),
    ...(route.bodyClaimIds.includes('PUB-COLUMN-GENERAL-BOUNDARY') ? ['Article:description'] : []),
  ];
}

function requireExactKeys(routeUrl, label, value, expectedKeys) {
  const actualKeys = Object.keys(value);
  if (!sameStringSet(actualKeys, expectedKeys)) {
    errors.push(
      `${routeUrl}: ${label} property drift ` +
        `(expected=${expectedKeys.join(',')}; actual=${actualKeys.join(',') || '<none>'})`
    );
  }
}

function requireExactString(routeUrl, label, actual, expected) {
  if (typeof actual !== 'string' || normalize(actual) !== expected) {
    errors.push(`${routeUrl}: ${label} drift`);
  }
}

function requireRootSchema(routeUrl, label, record) {
  if (
    record.path !== '$' ||
    record.parentProperty !== undefined ||
    record.parentType !== undefined
  ) {
    errors.push(`${routeUrl}: ${label} must be a root JSON-LD document`);
  }
  if (record.documentContext !== SCHEMA_CONTEXT || record.value['@context'] !== SCHEMA_CONTEXT) {
    errors.push(`${routeUrl}: ${label} schema context drift`);
  }
  if (record.value['@type'] !== record.schemaType) {
    errors.push(`${routeUrl}: ${label} must declare one exact @type`);
  }
}

function validateGuardedSchemas({ expectedIdSet, expectedSeo, isColumnArticle, records, route }) {
  const byType = new Map(
    [...guardedSchemaTypes].map((schemaType) => [
      schemaType,
      records.filter((record) => record.schemaType === schemaType),
    ])
  );
  const hasBoundFaqClaim = [...expectedIdSet].some(
    (id) => claimsById.get(id)?.jsonLdQuestion !== undefined
  );
  const expectedCounts = new Map([
    ['WebSite', 1],
    ['WebPage', isColumnArticle ? 2 : 1],
    ['SoftwareApplication', route.url === '/' ? 1 : 0],
    ['FAQPage', route.url === '/' || hasBoundFaqClaim || isColumnArticle ? 1 : 0],
  ]);

  for (const [schemaType, expectedCount] of expectedCounts) {
    const actualCount = byType.get(schemaType).length;
    if (actualCount !== expectedCount) {
      errors.push(
        `${route.url}: ${schemaType} schema cardinality drift ` +
          `(expected=${expectedCount}; actual=${actualCount})`
      );
    }
  }

  const expectedCanonicalUrl = new URL(route.url, PUBLIC_ORIGIN).href;
  const websiteRecords = byType.get('WebSite');
  if (websiteRecords.length === 1) {
    const record = websiteRecords[0];
    const value = record.value;
    requireRootSchema(route.url, 'WebSite', record);
    requireExactKeys(route.url, 'WebSite', value, [
      '@context',
      '@type',
      'name',
      'description',
      'identifier',
      'url',
      'inLanguage',
    ]);
    requireExactString(route.url, 'WebSite name', value.name, 'Grift');
    requireExactString(route.url, 'WebSite description', value.description, expectedSeo);
    requireExactString(route.url, 'WebSite identifier', value.identifier, route.seoClaimId);
    requireExactString(route.url, 'WebSite url', value.url, PUBLIC_ORIGIN);
    requireExactString(route.url, 'WebSite language', value.inLanguage, 'ja-JP');
  }

  const webpageRecords = byType.get('WebPage');
  const primaryWebpages = webpageRecords.filter(
    (record) => record.value.identifier === route.seoClaimId
  );
  if (primaryWebpages.length !== 1) {
    errors.push(
      `${route.url}: primary WebPage binding must appear exactly once ` +
        `(found ${primaryWebpages.length})`
    );
  } else {
    const record = primaryWebpages[0];
    const value = record.value;
    requireRootSchema(route.url, 'primary WebPage', record);
    requireExactKeys(route.url, 'primary WebPage', value, [
      '@context',
      '@type',
      'name',
      'description',
      'identifier',
      'url',
      'inLanguage',
    ]);
    if (typeof value.name !== 'string' || value.name !== normalize(value.name) || !value.name) {
      errors.push(`${route.url}: primary WebPage name drift`);
    }
    requireExactString(route.url, 'primary WebPage description', value.description, expectedSeo);
    requireExactString(route.url, 'primary WebPage identifier', value.identifier, route.seoClaimId);
    requireExactString(route.url, 'primary WebPage url', value.url, expectedCanonicalUrl);
    requireExactString(route.url, 'primary WebPage language', value.inLanguage, 'ja-JP');
  }

  const articleWebpages = webpageRecords.filter(
    (record) => record.parentType === 'Article' && record.parentProperty === 'mainEntityOfPage'
  );
  if (articleWebpages.length !== (isColumnArticle ? 1 : 0)) {
    errors.push(
      `${route.url}: Article.mainEntityOfPage cardinality drift ` +
        `(expected=${isColumnArticle ? 1 : 0}; actual=${articleWebpages.length})`
    );
  }
  for (const record of articleWebpages) {
    requireExactKeys(route.url, 'Article.mainEntityOfPage', record.value, ['@type', '@id']);
    if (
      record.value['@type'] !== 'WebPage' ||
      record.documentContext !== SCHEMA_CONTEXT ||
      record.path !== '$.mainEntityOfPage'
    ) {
      errors.push(`${route.url}: Article.mainEntityOfPage context drift`);
    }
    requireExactString(
      route.url,
      'Article.mainEntityOfPage canonical URL',
      record.value['@id'],
      expectedCanonicalUrl
    );
  }

  if (webpageRecords.length === expectedCounts.get('WebPage')) {
    const allowedWebpageRecords = new Set([...primaryWebpages, ...articleWebpages]);
    for (const record of webpageRecords) {
      if (!allowedWebpageRecords.has(record)) {
        errors.push(`${route.url}: unbound WebPage schema at ${record.path}`);
      }
    }
  }

  const softwareRecords = byType.get('SoftwareApplication');
  if (softwareRecords.length === 1) {
    const record = softwareRecords[0];
    const value = record.value;
    requireRootSchema(route.url, 'SoftwareApplication', record);
    requireExactKeys(route.url, 'SoftwareApplication', value, [
      '@context',
      '@type',
      'name',
      'applicationCategory',
      'operatingSystem',
      'description',
      'identifier',
      'offers',
      'provider',
    ]);
    requireExactString(route.url, 'SoftwareApplication name', value.name, 'Grift');
    requireExactString(
      route.url,
      'SoftwareApplication category',
      value.applicationCategory,
      'BusinessApplication'
    );
    requireExactString(route.url, 'SoftwareApplication OS', value.operatingSystem, 'Web');
    requireExactString(
      route.url,
      'SoftwareApplication description',
      value.description,
      expectedSeo
    );
    requireExactString(
      route.url,
      'SoftwareApplication identifier',
      value.identifier,
      route.seoClaimId
    );
    if (!value.offers || typeof value.offers !== 'object' || Array.isArray(value.offers)) {
      errors.push(`${route.url}: SoftwareApplication offers drift`);
    }
    if (!value.provider || typeof value.provider !== 'object' || Array.isArray(value.provider)) {
      errors.push(`${route.url}: SoftwareApplication provider drift`);
    }
  }

  const faqRecords = byType.get('FAQPage');
  if (faqRecords.length === 1) {
    const record = faqRecords[0];
    const value = record.value;
    requireRootSchema(route.url, 'FAQPage', record);
    requireExactKeys(route.url, 'FAQPage', value, ['@context', '@type', 'mainEntity']);
    if (!Array.isArray(value.mainEntity) || value.mainEntity.length === 0) {
      errors.push(`${route.url}: FAQPage mainEntity must be a non-empty array`);
    } else {
      const questions = [];
      for (const [index, question] of value.mainEntity.entries()) {
        const label = `FAQPage.mainEntity[${index}]`;
        if (!question || typeof question !== 'object' || Array.isArray(question)) {
          errors.push(`${route.url}: ${label} must be a Question object`);
          continue;
        }
        requireExactKeys(route.url, label, question, ['@type', 'name', 'acceptedAnswer']);
        if (question['@type'] !== 'Question') {
          errors.push(`${route.url}: ${label} type drift`);
        }
        if (
          typeof question.name !== 'string' ||
          question.name !== normalize(question.name) ||
          !question.name
        ) {
          errors.push(`${route.url}: ${label} question text drift`);
        } else {
          questions.push(question.name);
        }

        const answer = question.acceptedAnswer;
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
          errors.push(`${route.url}: ${label}.acceptedAnswer must be an Answer object`);
          continue;
        }
        const answerKeys =
          answer.identifier === undefined ? ['@type', 'text'] : ['@type', 'identifier', 'text'];
        requireExactKeys(route.url, `${label}.acceptedAnswer`, answer, answerKeys);
        if (answer['@type'] !== 'Answer') {
          errors.push(`${route.url}: ${label}.acceptedAnswer type drift`);
        }
        if (
          typeof answer.text !== 'string' ||
          answer.text !== normalize(answer.text) ||
          !answer.text
        ) {
          errors.push(`${route.url}: ${label}.acceptedAnswer text drift`);
        }
        if (
          answer.identifier !== undefined &&
          (typeof answer.identifier !== 'string' || !expectedIdSet.has(answer.identifier))
        ) {
          errors.push(`${route.url}: ${label}.acceptedAnswer identifier drift`);
        }
      }
      if (new Set(questions).size !== questions.length) {
        errors.push(`${route.url}: FAQPage contains duplicate normalized questions`);
      }
    }
  }
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
  const expectedIds = [...new Set([route.seoClaimId, ...route.bodyClaimIds])];
  const expectedIdSet = new Set(expectedIds);

  const registryMatches = [
    ...html.matchAll(/<script[^>]*data-public-claim-registry[^>]*>([\s\S]*?)<\/script>/g),
  ];
  if (registryMatches.length !== 1) {
    errors.push(
      `${route.url}: rendered claim registry must appear exactly once ` +
        `(found ${registryMatches.length})`
    );
  } else {
    try {
      const registryRaw = registryMatches[0][1];
      const registry = JSON.parse(registryRaw);
      if (registry.route?.url !== route.url) errors.push(`${route.url}: registry route drift`);
      const renderedIdList = (registry.claims ?? []).map((claim) => claim.id);
      if (!sameStringSet(renderedIdList, expectedIds)) {
        errors.push(`${route.url}: rendered registry claim ID set drift`);
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

  const metaDescriptionGroups = [
    ['name=description', metaContents(html, 'name', 'description')],
    ['property=og:description', metaContents(html, 'property', 'og:description')],
    ['property=twitter:description', metaContents(html, 'property', 'twitter:description')],
  ];
  for (const [label, contents] of metaDescriptionGroups) {
    if (contents.length !== 1) {
      errors.push(`${route.url}: ${label} must appear exactly once (found ${contents.length})`);
    } else if (contents[0] !== expectedSeo) {
      errors.push(`${route.url}: ${label} drift`);
    }
  }
  const metaDescriptions = metaDescriptionGroups.flatMap(([, contents]) => contents);
  const metaStrings = allMetaContents(html);

  const jsonLdStrings = [];
  const jsonLdDescriptions = [];
  const jsonLdQuestionNames = [];
  const jsonLdClaims = new Map();
  const guardedSchemaRecords = [];
  let jsonLdDocumentIndex = 0;
  for (const raw of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
  )) {
    const documentIndex = jsonLdDocumentIndex;
    jsonLdDocumentIndex += 1;
    try {
      const document = JSON.parse(raw[1]);
      if (
        !document ||
        typeof document !== 'object' ||
        Array.isArray(document) ||
        document['@context'] !== SCHEMA_CONTEXT
      ) {
        errors.push(`${route.url}: every JSON-LD document requires the exact schema.org context`);
      }
      collectStrings(document, jsonLdStrings);
      collectPropertyStrings(document, 'description', jsonLdDescriptions);
      collectSchemaNames(document, 'Question', jsonLdQuestionNames);
      collectIdentifiedClaimRecords(document, jsonLdClaims);
      collectGuardedSchemaRecords(
        document,
        documentIndex,
        typeof document?.['@context'] === 'string' ? normalize(document['@context']) : undefined,
        guardedSchemaRecords
      );
    } catch (error) {
      errors.push(`${route.url}: invalid JSON-LD (${error.message})`);
    }
  }
  const isColumnArticle = route.bodyClaimIds.includes('PUB-COLUMN-GENERAL-BOUNDARY');
  validateGuardedSchemas({
    expectedIdSet,
    expectedSeo,
    isColumnArticle,
    records: guardedSchemaRecords,
    route,
  });
  if (!jsonLdDescriptions.includes(expectedSeo)) {
    errors.push(`${route.url}: JSON-LD description is not the SEO claim`);
  }
  for (const actual of jsonLdDescriptions) {
    if (actual !== expectedSeo) {
      errors.push(`${route.url}: unregistered JSON-LD description drift (${actual})`);
    }
  }

  const bodyRaw = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
  const bodyText = visibleText(bodyRaw);
  const bodyTextWithHidden = bodyTextIncludingHidden(bodyRaw);
  const detailContexts = collectDetailContexts(bodyRaw);
  const bodyMarkers = collectBodyClaimMarkers(bodyRaw, detailContexts);

  for (const markerId of bodyMarkers.keys()) {
    if (!expectedIdSet.has(markerId)) {
      errors.push(`${route.url}: foreign or unknown body claim marker ${markerId}`);
    }
  }
  for (const identifiedId of jsonLdClaims.keys()) {
    if (!claimsById.has(identifiedId) || !expectedIdSet.has(identifiedId)) {
      errors.push(`${route.url}: foreign or unknown JSON-LD claim identifier ${identifiedId}`);
    }
  }

  for (const claim of manifest.claims) {
    const expected = normalize(claim.text);
    const surfaceCounts = {
      body: countVisibleText(bodyText, expected),
      'json-ld': countExactStrings(jsonLdStrings, expected),
      meta: countExactStrings(metaStrings, expected),
    };
    const bodyCountWithHidden = countVisibleText(bodyTextWithHidden, expected);
    if (bodyCountWithHidden !== surfaceCounts.body) {
      errors.push(
        `${route.url}: ${claim.id} canonical body text is hidden or otherwise non-visible ` +
          `(all=${bodyCountWithHidden}; visible=${surfaceCounts.body})`
      );
    }
    const observedSurfaces = [];
    if (surfaceCounts.meta > 0) observedSurfaces.push('meta');
    if (surfaceCounts['json-ld'] > 0) observedSurfaces.push('json-ld');
    if (surfaceCounts.body > 0) observedSurfaces.push('body');

    if (!expectedIdSet.has(claim.id)) {
      if (observedSurfaces.length > 0) {
        errors.push(
          `${route.url}: foreign claim ${claim.id} appears on ${observedSurfaces.join(',')}`
        );
      }
      continue;
    }

    if (!sameStringSet(observedSurfaces, claim.surfaces)) {
      errors.push(
        `${route.url}: ${claim.id} surface drift ` +
          `(declared=${claim.surfaces.join(',')}; rendered=${observedSurfaces.join(',') || '<none>'})`
      );
    }

    const expectedSurfaceCounts = {
      body: claim.surfaces.includes('body') ? 1 : 0,
      'json-ld': claim.surfaces.includes('json-ld')
        ? expectedJsonLdSignatures(route, claim).length
        : 0,
      meta: claim.surfaces.includes('meta') ? 3 : 0,
    };
    for (const surface of ['meta', 'json-ld', 'body']) {
      if (surfaceCounts[surface] !== expectedSurfaceCounts[surface]) {
        errors.push(
          `${route.url}: ${claim.id} ${surface} text cardinality drift ` +
            `(expected=${expectedSurfaceCounts[surface]}; actual=${surfaceCounts[surface]})`
        );
      }
    }

    if (claim.surfaces.includes('body')) {
      const markers = bodyMarkers.get(claim.id) ?? [];
      if (markers.length !== 1) {
        errors.push(
          `${route.url}: ${claim.id} must have exactly one bound body marker ` +
            `(found ${markers.length})`
        );
      }
      for (const marker of markers) {
        if (marker.hidden) errors.push(`${route.url}: ${claim.id} body marker is hidden`);
        if (marker.text !== expected) {
          errors.push(`${route.url}: ${claim.id} bound body text drift`);
        }
        if (
          claim.jsonLdQuestion !== undefined &&
          marker.context !== normalize(claim.jsonLdQuestion)
        ) {
          errors.push(`${route.url}: ${claim.id} bound body question context drift`);
        }
      }
    }

    if (claim.jsonLdQuestion !== undefined) {
      const expectedQuestion = normalize(claim.jsonLdQuestion);
      const bodyQuestionCount = detailContexts.filter(
        (detail) => detail.context === expectedQuestion
      ).length;
      const jsonLdQuestionCount = jsonLdQuestionNames.filter(
        (question) => question === expectedQuestion
      ).length;
      if (bodyQuestionCount !== 1) {
        errors.push(
          `${route.url}: ${claim.id} body question must appear exactly once ` +
            `(found ${bodyQuestionCount})`
        );
      }
      if (jsonLdQuestionCount !== 1) {
        errors.push(
          `${route.url}: ${claim.id} JSON-LD question must appear exactly once ` +
            `(found ${jsonLdQuestionCount})`
        );
      }
    }

    if (claim.surfaces.includes('json-ld')) {
      const identifiedRecords = jsonLdClaims.get(claim.id) ?? [];
      const expectedSignatures = expectedJsonLdSignatures(route, claim);
      const actualSignatures = identifiedRecords.map(
        (record) => `${record.schemaType}:${record.property}`
      );
      if (!sameStringSet(actualSignatures, expectedSignatures)) {
        errors.push(
          `${route.url}: ${claim.id} JSON-LD binding signature drift ` +
            `(expected=${expectedSignatures.join(',')}; actual=${actualSignatures.join(',') || '<none>'})`
        );
      }
      for (const record of identifiedRecords) {
        if (record.value !== expected) {
          errors.push(`${route.url}: ${claim.id} bound JSON-LD text drift`);
        }
        if (
          claim.jsonLdQuestion !== undefined &&
          record.context !== normalize(claim.jsonLdQuestion)
        ) {
          errors.push(`${route.url}: ${claim.id} bound JSON-LD question context drift`);
        }
      }
    }

    if (claim.surfaces.includes('meta') && !metaDescriptions.includes(expected)) {
      errors.push(`${route.url}: ${claim.id} has no bound description metadata`);
    }
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
