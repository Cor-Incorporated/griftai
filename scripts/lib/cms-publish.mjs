import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** frontmatter の isDraft: true。引用符なしの真偽値だけを下書きとみなす。 */
export const DRAFT_LINE = /^isDraft:\s*true\s*$/m;

/**
 * @param {string} text
 */
export function isDraftMarkdown(text) {
  return DRAFT_LINE.test(text);
}

/**
 * 公開する Markdown のスラッグ。サイトマップと公開ページの対象を揃える。
 * @param {string} dir
 * @returns {string[]}
 */
export function publishedSlugs(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .filter((file) => !isDraftMarkdown(readFileSync(join(dir, file), 'utf8')))
    .map((file) => file.slice(0, -3))
    .sort();
}
