#!/usr/bin/env node
/**
 * Fail if hardcoded Cor contact URLs remain outside the CTA builder fallback.
 * ADR-0002 / Issue #47
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const ALLOWED_FILES = new Set([
  // Default origin only lives in the builder (not /contact hardcode for CTAs)
  'src/lib/cor-cta.ts',
]);

const HARDCODE_RE = /https:\/\/cor-jp\.com\/contact\/?/g;
const EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.jsx']);

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
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

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  if (ALLOWED_FILES.has(rel)) {
    // Builder may mention contact path only via path default, not full prod URL with /contact
    const text = readFileSync(file, 'utf8');
    const matches = [...text.matchAll(HARDCODE_RE)];
    if (matches.length > 0) {
      violations.push({
        file: rel,
        count: matches.length,
        note: 'cor-cta.ts must not hardcode full contact URL',
      });
    }
    continue;
  }

  const text = readFileSync(file, 'utf8');
  const matches = [...text.matchAll(HARDCODE_RE)];
  if (matches.length > 0) {
    violations.push({ file: rel, count: matches.length });
  }
}

if (violations.length > 0) {
  console.error('Hardcoded Cor contact URLs found (use buildCorContactUrl / corCta):\n');
  for (const v of violations) {
    console.error(`  - ${v.file} (${v.count})${v.note ? ` — ${v.note}` : ''}`);
  }
  process.exit(1);
}

console.log('check-cta-hardcode: OK (no hardcoded cor-jp.com/contact URLs in src/)');
