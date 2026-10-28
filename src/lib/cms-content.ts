import { articleCategories, newsCategories, type CmsChoice } from '../config/cms-contract';

/** 公開ページに出すエントリ。isDraft が true のファイルはビルド対象にしない。 */
export function isPublicCmsEntry(entry: { data: { isDraft?: boolean } }): boolean {
  return entry.data.isDraft !== true;
}

/** YAML の日付は UTC の 0 時になる。表示は暦日のまま出す。 */
export function formatCmsDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}年${month}月${day}日`;
}

export function cmsCategoryLabel(choices: readonly CmsChoice[], value: string): string {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}

export function articleCategoryLabel(value: string): string {
  return cmsCategoryLabel(articleCategories, value);
}

export function newsCategoryLabel(value: string): string {
  return cmsCategoryLabel(newsCategories, value);
}
