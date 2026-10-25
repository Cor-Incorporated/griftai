#!/usr/bin/env node
/**
 * Fail if CLI key names appear in public copy outside the TEP glossary values.
 *
 * 公開文の読み手には非エンジニア（紹介会社・SES の営業、案件の担当）がいる。CLI のキー名
 * （下線を含む名前と、report-v2 のような版付きの出力形式の名前。規則は scripts/lib/cli-key-names.mjs）は
 * src/config/tep.ts の `cli` / `cliNote` の値にだけ書き、ページはそこから読んで出す
 * （2026-10-25 の #77 で、トップと FAQ にキー名がそのまま入ったため）。
 * 禁止する名前はその値から取り出すので、対応表に名前を足せば、ここでの検査にも加わる。
 * src/config/tep.ts のほかの文（ページに出る説明）も、コメントと `cli` / `cliNote` の値を除いて検査する。
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cliKeyNames, keyNamePattern } from './lib/cli-key-names.mjs';

const ROOT = process.cwd();
const GLOSSARY = 'src/config/tep.ts';
const SCAN_ROOTS = [
  'src/pages',
  'src/components',
  'src/layouts',
  'src/config',
  'src/content/stories',
];
const EXTENSIONS = ['.astro', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx'];
// `cli` / `cliNote` の文字列の値（' と " のどちらでも読む）
const CLI_VALUE = /\bcli(?:Note)?:\s*(['"])((?:\\.|(?!\1).)*)\1/g;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const glossaryText = readFileSync(join(ROOT, GLOSSARY), 'utf8');
const cliValues = [...glossaryText.matchAll(CLI_VALUE)].map((match) => match[2]);
if (cliValues.length === 0) fail(`check-plain-terms: no cli values found in ${GLOSSARY}`);
// テンプレートリテラルの cli は読めないので、黙って検査から漏れないよう止める
if (/\bcli:\s*`/.test(glossaryText)) {
  fail(
    `check-plain-terms: write cli values in ${GLOSSARY} as plain strings, not template literals`
  );
}
const keyNames = cliKeyNames(cliValues);
const patterns = keyNames.map((name) => ({ name, re: keyNamePattern(name) }));

// 対応表のファイルは、コメントと cli / cliNote の値を空白にしてから検査する（行番号は保つ）
const blankKeepingLines = (text) => text.replace(/[^\n]/g, ' ');
const glossaryProse = glossaryText
  .replace(/\/\*[\s\S]*?\*\//g, blankKeepingLines)
  .replace(/\/\/[^\n]*/g, blankKeepingLines)
  .replace(CLI_VALUE, (match) =>
    match.replace(/(['"])((?:\\.|(?!\1).)*)\1$/, (value) => blankKeepingLines(value))
  );

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
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

const violations = [];
for (const root of SCAN_ROOTS) {
  if (!existsSync(join(ROOT, root))) fail(`check-plain-terms: scan root ${root} does not exist`);
  for (const file of walk(join(ROOT, root))) {
    const rel = relative(ROOT, file).replaceAll('\\', '/');
    const text = rel === GLOSSARY ? glossaryProse : readFileSync(file, 'utf8');
    text.split('\n').forEach((line, index) => {
      for (const { name, re } of patterns) {
        if (re.test(line)) violations.push(`${rel}:${index + 1}: ${name}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('CLI key names found outside the glossary values:\n');
  for (const violation of violations) console.error(`  - ${violation}`);
  fail(
    `\nWrite plain words in the copy and keep CLI key names in the cli / cliNote values of ${GLOSSARY} (rendered on /tep/ and llms.txt).`
  );
}

console.log(
  `check-plain-terms: OK (${keyNames.length} CLI key names, only in ${GLOSSARY} cli values)`
);
console.log(`  ${keyNames.join(', ')}`);
