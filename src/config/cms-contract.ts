/**
 * 記事とお知らせの CMS 項目の正本。
 *
 * cor-jp.com（corsweb2024 ADR-0018）と同じく、Sveltia CMS の config.yml と
 * Zod スキーマが同じ項目を持つ。scripts/check-cms.mjs が config.yml・
 * wrangler.toml・管理画面の見出しを、このファイルと照合する。
 * 言語別フォルダは置かない。griftai.org の公開文は日本語だけだから。
 */

export interface CmsChoice {
  label: string;
  value: string;
}

export interface CmsField {
  name: string;
  label: string;
  widget: string;
  required: boolean;
  default?: string | boolean;
  options?: readonly CmsChoice[];
  fields?: readonly CmsField[];
  accept?: string;
  format?: string;
  dateType?: string;
  modes?: readonly string[];
}

export interface CmsCollection {
  name: string;
  label: string;
  labelSingular: string;
  folder: string;
  previewPath: string;
  sortableField: string;
  fields: readonly CmsField[];
}

export const cmsBackend = {
  name: 'github',
  repo: 'Cor-Incorporated/griftai',
  branch: 'main',
  /**
   * 認証 Worker の URL。本番の workers.dev は未デプロイなので、手元の wrangler dev だけを指す。
   * api.netlify.com は使わない（トークンを Netlify に渡さない）。
   */
  baseUrl: 'http://127.0.0.1:8787',
  authMethods: ['oauth'] as const,
  authScope: 'public_repo',
  squashMerges: false,
};

export const authWorker = {
  /** 上流 sveltia/sveltia-cms-auth の取り込みコミット。src/index.js は改変しない。 */
  upstreamCommit: '4fd08b5d4e009a85fa473fd523824ca9dfee9533',
  indexBlob: '8c4c3beb721245c30b43e8b5e8444be7038f1789',
  licenseBlob: '0d1f75bec76122bd15bcdf7a895119b2fe5a7f71',
  name: 'grift-sveltia-cms-auth',
  compatibilityDate: '2023-03-24',
  /**
   * トークンを渡してよい CMS のホスト名。本番の管理画面ホストは未確定なので、手元の loopback だけ。
   * 空・*・プレビュー用ホストにはしない。
   */
  allowedDomains: 'localhost,127.0.0.1',
};

export const cmsSite = {
  appTitle: 'Grift コンテンツ管理',
  siteUrl: 'https://griftai.org',
  logoSrc: '/logo.svg',
  devPort: 5174,
};

export const cmsMedia = {
  mediaFolder: 'public/images/cms',
  publicFolder: '/images/cms',
  accept: 'image/avif,image/webp,image/jpeg,image/png,image/heic',
};

export const cmsSlug = {
  encoding: 'ascii',
  cleanAccents: true,
  pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  patternMessage: '英小文字・数字・ハイフンだけで入力してください（例: git-history-facts）',
};

export const cmsOutput = {
  omitEmptyOptionalFields: true,
  yamlQuote: 'none',
};

export const cmsCommitMessages = {
  create: 'docs(cms): {{slug}} を追加',
  update: 'docs(cms): {{slug}} を更新',
  delete: 'docs(cms): {{slug}} を削除',
  uploadMedia: 'docs(cms): 画像 {{path}} を追加',
  deleteMedia: 'docs(cms): 画像 {{path}} を削除',
};

export const articleCategories = [
  { label: 'プロダクト', value: 'product' },
  { label: '使い方', value: 'practice' },
  { label: 'ノート', value: 'note' },
] as const satisfies readonly CmsChoice[];

export const newsCategories = [
  { label: 'お知らせ', value: 'info' },
  { label: 'メディア', value: 'media' },
  { label: 'アップデート', value: 'update' },
  { label: 'イベント', value: 'event' },
  { label: '受賞', value: 'award' },
  { label: 'プレスリリース', value: 'press' },
] as const satisfies readonly CmsChoice[];

const imageFields = [
  {
    name: 'url',
    label: '画像',
    widget: 'image',
    required: true,
    accept: cmsMedia.accept,
  },
  {
    name: 'alt',
    label: '代替テキスト',
    widget: 'string',
    required: true,
  },
] as const satisfies readonly CmsField[];

const dateField = (name: string, label: string, required: boolean, withNow: boolean): CmsField => ({
  name,
  label,
  widget: 'datetime',
  required,
  dateType: 'date',
  format: 'YYYY-MM-DD',
  ...(withNow ? { default: '{{now}}' } : {}),
});

export const articleFields = [
  { name: 'title', label: 'タイトル', widget: 'string', required: true },
  { name: 'description', label: '概要', widget: 'text', required: true },
  { name: 'summary', label: '記事の要点', widget: 'text', required: false },
  dateField('pubDate', '公開日', true, true),
  dateField('updatedDate', '更新日', false, false),
  { name: 'author', label: '著者', widget: 'string', required: false, default: '寺田 康佑' },
  {
    name: 'category',
    label: 'カテゴリ',
    widget: 'select',
    required: true,
    options: articleCategories,
  },
  { name: 'tags', label: 'タグ', widget: 'list', required: false },
  {
    name: 'image',
    label: 'アイキャッチ画像',
    widget: 'object',
    required: false,
    fields: imageFields,
  },
  { name: 'featured', label: '注目に表示', widget: 'boolean', required: false, default: false },
  { name: 'isDraft', label: '下書き', widget: 'hidden', required: false, default: false },
  {
    name: 'body',
    label: '本文',
    widget: 'markdown',
    required: true,
    modes: ['raw', 'rich_text'],
  },
] as const satisfies readonly CmsField[];

export const newsFields = [
  { name: 'title', label: 'タイトル', widget: 'string', required: true },
  { name: 'description', label: '概要', widget: 'text', required: true },
  dateField('publishedAt', '公開日', true, true),
  dateField('updatedAt', '更新日', false, false),
  { name: 'author', label: '著者', widget: 'string', required: false, default: '寺田 康佑' },
  {
    name: 'category',
    label: 'カテゴリ',
    widget: 'select',
    required: true,
    options: newsCategories,
  },
  { name: 'tags', label: 'タグ', widget: 'list', required: false },
  { name: 'externalUrl', label: '掲載元のURL', widget: 'string', required: false },
  { name: 'source', label: '掲載元の名前', widget: 'string', required: false },
  { name: 'featured', label: '注目に表示', widget: 'boolean', required: false, default: false },
  { name: 'isDraft', label: '下書き', widget: 'hidden', required: false, default: false },
  {
    name: 'body',
    label: '本文',
    widget: 'markdown',
    required: true,
    modes: ['raw', 'rich_text'],
  },
] as const satisfies readonly CmsField[];

export const cmsCollections: readonly CmsCollection[] = [
  {
    name: 'articles',
    label: '記事',
    labelSingular: '記事',
    folder: 'src/content/articles',
    previewPath: '/articles/{{slug}}/',
    sortableField: 'pubDate',
    fields: articleFields,
  },
  {
    name: 'news',
    label: 'お知らせ',
    labelSingular: 'お知らせ',
    folder: 'src/content/news',
    previewPath: '/news/{{slug}}/',
    sortableField: 'publishedAt',
    fields: newsFields,
  },
];
