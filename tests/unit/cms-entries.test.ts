import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  articleFrontmatterKeys,
  articleFrontmatterSchema,
  newsFrontmatterKeys,
  newsFrontmatterSchema,
} from '../../src/config/cms-schema';
import { articleFields, cmsSlug, newsFields } from '../../src/config/cms-contract';
import { isPublicCmsEntry } from '../../src/lib/cms-content';
import { isDraftMarkdown, publishedSlugs } from '../../scripts/lib/cms-publish.mjs';

const ROOT = join(import.meta.dirname, '../..');

const frontmatter = (text: string) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('missing frontmatter');
  return parse(match[1]) as Record<string, unknown>;
};

const keysOf = (fields: readonly { name: string }[]) =>
  fields.map((field) => field.name).filter((name) => name !== 'body');

describe('CMS frontmatter', () => {
  it('keeps Zod keys aligned with the CMS contract', () => {
    expect(articleFrontmatterKeys).toEqual(keysOf(articleFields));
    expect(newsFrontmatterKeys).toEqual(keysOf(newsFields));
    expect(Object.keys(articleFrontmatterSchema.shape).sort()).toEqual(
      [...articleFrontmatterKeys].sort()
    );
    expect(Object.keys(newsFrontmatterSchema.shape).sort()).toEqual(
      [...newsFrontmatterKeys].sort()
    );
  });

  it('publishes articles and news except drafts', () => {
    const cases = [
      {
        dir: 'src/content/articles',
        schema: articleFrontmatterSchema,
        published: ['git-history-facts'],
      },
      {
        dir: 'src/content/news',
        schema: newsFrontmatterSchema,
        published: ['cli-published'],
      },
    ] as const;

    for (const item of cases) {
      const absolute = join(ROOT, item.dir);
      expect(publishedSlugs(absolute)).toEqual([...item.published]);
      for (const file of readdirSync(absolute).filter((name) => name.endsWith('.md'))) {
        const slug = file.replace(/\.md$/, '');
        expect(slug).toMatch(new RegExp(cmsSlug.pattern));
        const text = readFileSync(join(absolute, file), 'utf8');
        const data = frontmatter(text);
        const parsed = item.schema.safeParse(data);
        expect(parsed.success, parsed.success ? '' : parsed.error.message).toBe(true);
        if (!parsed.success) continue;
        expect(isPublicCmsEntry({ data: parsed.data })).toBe(!isDraftMarkdown(text));
        expect(isPublicCmsEntry({ data: parsed.data })).toBe(item.published.includes(slug));
      }
    }
  });
});
