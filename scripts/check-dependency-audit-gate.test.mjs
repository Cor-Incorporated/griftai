import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

test('production audit fails closed on Critical and High advisories', () => {
  assert.equal(packageJson.scripts['audit:prod'], 'npm audit --omit=dev --audit-level=high');
  assert.match(workflow, /run: npm run audit:prod/);
});

test('development dependencies are audited separately and visibly', () => {
  assert.equal(packageJson.scripts['audit:all'], 'npm audit --audit-level=high');
  assert.match(workflow, /run: npm run audit:all/);
});

test('audit policy does not weaken or bypass npm findings', () => {
  const policy = [packageJson.scripts['audit:prod'], packageJson.scripts['audit:all']].join('\n');

  assert.doesNotMatch(policy, /--force|--audit-level=(?:critical|none)|--ignore/i);
  assert.doesNotMatch(workflow, /continue-on-error:[ \t]*true[\s\S]{0,240}npm run audit:/i);
});
