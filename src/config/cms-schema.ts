import { z } from 'astro/zod';
import {
  articleCategories,
  articleFields,
  newsCategories,
  newsFields,
  type CmsChoice,
} from './cms-contract';

/**
 * 空・空白だけを止める。CMS は下書きのあいだ必須項目が空でも保存できるので、ビルドでも止める。
 * メッセージに欄の名前を入れる。独自メッセージだけだと、Astro はビルドのエラーに欄の名前を付けない。
 */
const requiredText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} が空です（CMS では、レビュー中にする前に入れてください）` });

const categoryEnum = (choices: readonly CmsChoice[]) => {
  const ids = choices.map((choice) => choice.value);
  if (ids.length === 0) {
    throw new Error('CMS category list is empty');
  }
  return z.enum(ids as [string, ...string[]]);
};

const frontmatterNames = (fields: readonly { name: string }[]) =>
  fields.map((field) => field.name).filter((name) => name !== 'body');

/**
 * 記事（src/content/articles/*.md）。項目の正本は cms-contract.ts。
 * 本文は Markdown 本体で、frontmatter には入れない。
 */
export const articleFrontmatterSchema = z.object({
  title: requiredText('title（タイトル）'),
  description: requiredText('description（概要）'),
  summary: z.string().trim().min(1).optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().trim().min(1).default('寺田 康佑'),
  category: categoryEnum(articleCategories),
  tags: z.array(z.string()).default([]),
  image: z
    .object({
      url: requiredText('image.url（画像）'),
      alt: requiredText('image.alt（代替テキスト）'),
    })
    .optional(),
  featured: z.boolean().default(false),
  isDraft: z.boolean().default(false),
});

/**
 * お知らせ（src/content/news/*.md）。カテゴリの id は cor-jp.com の news と同じ並び。
 */
export const newsFrontmatterSchema = z.object({
  title: requiredText('title（タイトル）'),
  description: requiredText('description（概要）'),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.string().trim().min(1).default('寺田 康佑'),
  category: categoryEnum(newsCategories),
  tags: z.array(z.string()).default([]),
  externalUrl: z.string().url().optional(),
  source: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
  isDraft: z.boolean().default(false),
});

export const articleFrontmatterKeys = frontmatterNames(articleFields);
export const newsFrontmatterKeys = frontmatterNames(newsFields);
