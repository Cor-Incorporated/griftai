#!/usr/bin/env node
/**
 * Fail if CLI key names appear in public copy outside the TEP glossary.
 *
 * 公開文の読み手には非エンジニア（紹介会社・SES の営業、案件の担当）がいる。CLI の出力での名前
 * （surface_profile のようなキー名、report-v2 のような出力形式の名前）は src/config/tep.ts の
 * 用語の対応表にだけ書き、ページはそこから読んで出す（2026-10-25 の #77 でトップと FAQ に
 * キー名がそのまま入ったため）。禁止する語は対応表の `cli: '...'` の値から取り出すので、
 * 対応表に語を足せば、ここでの検査にも加わる。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const GLOSSARY = 'src/config/tep.ts';
const SCAN_ROOTS = ['src/pages', 'src/components', 'src/config', 'src/content/stories'];
const EXTENSIONS = ['.astro', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx'];
// 対応表の行にはないが、本文に出していた出力形式の名前
const EXTRA_NAMES = ['report-v1', 'report-v2'];

const glossaryText = readFileSync(join(ROOT, GLOSSARY), 'utf8');
const cliValues = [...glossaryText.matchAll(/cli: '([^']+)'/g)].map((match) => match[1]);
// 下線を含む語（not_observed など）と、版の付いた出力形式の名前（project-v1 など）
const keyNames = [
  ...new Set([
    ...cliValues.flatMap(
      (value) => value.match(/[a-z][a-z0-9]*(?:_[a-z0-9]+)+|[a-z]+-v\d+/g) ?? []
    ),
    ...EXTRA_NAMES,
  ]),
];

if (cliValues.length === 0) {
  console.error(`check-plain-terms: no cli values found in ${GLOSSARY}`);
  process.exit(1);
}

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const patterns = keyNames.map((name) => ({ name, re: new RegExp(`\\b${name}\\b`) }));
const violations = [];

for (const root of SCAN_ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    const rel = relative(ROOT, file).replaceAll('\\', '/');
    if (rel === GLOSSARY) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const { name, re } of patterns) {
        if (re.test(line)) violations.push(`${rel}:${index + 1}: ${name}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('CLI key names found outside the TEP glossary:\n');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error(
    `\nWrite plain words in the copy and keep CLI names in ${GLOSSARY} (rendered on /tep/ and llms.txt).`
  );
  process.exit(1);
}

console.log(`check-plain-terms: OK (${keyNames.length} CLI names, only in ${GLOSSARY})`);
