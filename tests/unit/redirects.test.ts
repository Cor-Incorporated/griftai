import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Cloudflare Pages の _redirects は astro preview では効かないため、ルールそのものを検査する。
const redirectsPath = fileURLToPath(new URL('../../public/_redirects', import.meta.url));

function parseRules(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
}

describe('public/_redirects', () => {
  const rules = parseRules(readFileSync(redirectsPath, 'utf-8'));

  it.each(['/team-beta', '/team-beta/', '/estimate-audit', '/estimate-audit/'])(
    'permanently redirects the withdrawn page %s to the top page',
    (from) => {
      expect(rules).toContainEqual({ from, to: '/', status: '301' });
    }
  );
});
