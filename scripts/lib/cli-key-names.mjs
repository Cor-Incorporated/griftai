/**
 * CLI の出力での名前のうち、公開文の本文に出さない機械のキー名を取り出す規則。
 *
 * 対象は、下線を含む名前（surface_profile、not_observed など）と、版の付いた出力形式の名前
 * （report-v2、project-v1 など）。英語の指標名（test co-change など）やコマンド名（grift align）は、
 * 元の語として括弧や脚注に出してよいので対象にしない。
 * scripts/check-plain-terms.mjs（ソースの検査）と e2e/smoke.spec.ts（公開ページの検査）が同じ規則を使う。
 */

const KEY_NAME = /[a-z][a-z0-9]*(?:_[a-z0-9]+)+|[a-z]+-v\d+/gi;

/** 用語の対応表にはないが、本文に出していた出力形式の名前 */
export const EXTRA_KEY_NAMES = ['report-v1', 'report-v2'];

/**
 * @param {readonly string[]} cliValues 用語の対応表の CLI の名前と、その補足
 * @returns {string[]} 本文に出さないキー名（小文字、重複なし、並べ替え済み）
 */
export function cliKeyNames(cliValues) {
  const found = cliValues.flatMap((value) => value.match(KEY_NAME) ?? []);
  return [...new Set([...found, ...EXTRA_KEY_NAMES].map((name) => name.toLowerCase()))].sort();
}

/**
 * @param {string} name cliKeyNames が返した名前
 * @returns {RegExp} 前後が英数字や下線でないところに、大文字小文字を問わず一致する
 */
export function keyNamePattern(name) {
  return new RegExp(`(?<![A-Za-z0-9_])${name.replace(/-/g, '\\-')}(?![A-Za-z0-9_])`, 'i');
}
