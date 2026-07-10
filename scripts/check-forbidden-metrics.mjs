#!/usr/bin/env node
/**
 * Fail if unvalidated marketing metrics reappear in public copy.
 * ADR-0001 / Issue #49
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = [
  join(ROOT, 'src/pages'),
  join(ROOT, 'src/components'),
  join(ROOT, 'src/config'),
];
const EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx']);

const FORBIDDEN = [
  { name: '営業時間80%削減系', re: /営業時間の?80\s*%/ },
  { name: '80%を実力へ系', re: /80\s*%を[、,].*実力/ },
  { name: '提案3日→1日系', re: /3日.{0,12}1日/ },
  { name: '提案リードタイム3日', re: /提案リードタイムが平均3日/ },
  {
    name: 'アルファ無料主訴求',
    re: /アルファテスト.{0,20}無料|今すぐ無料で試す|実際の案件で無料で/,
  },
];

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
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walk(full));
    } else if ([...EXTENSIONS].some((ext) => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file).replaceAll('\\', '/');
    for (const rule of FORBIDDEN) {
      if (rule.re.test(text)) {
        violations.push({ file: rel, rule: rule.name });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Forbidden unvalidated metrics / free-alpha copy found:\n');
  for (const v of violations) {
    console.error(`  - ${v.file}: ${v.rule}`);
  }
  console.error('\nSee ADR-0001. Remove claims until verified data exists.');
  process.exit(1);
}

console.log('check-forbidden-metrics: OK');
