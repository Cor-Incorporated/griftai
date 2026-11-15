import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// 表の文は会社サイト（corsweb2024 develop の companyPage.securityBody）の写しで、事実の正本は
// .claude/skills/cor-voice/references/facts.json の isms。2 つの表示面が正本から離れたら気づけるように、
// 登録番号の一致と、登録前の言い方（登録見込み・第2段階審査）の不在を見る。

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const factsPath = '.claude/skills/cor-voice/references/facts.json';
const targets = [
  'src/components/sections/marketing/SocialProofSection.astro',
  'src/pages/llms.txt.ts',
];
const stalePattern = /登録見込み|認証登録を見込|第2段階|第 2 段階/;

type FactsFile = { facts: Array<{ id: string; registration_number?: string }> };

const facts = JSON.parse(readFileSync(path.join(root, factsPath), 'utf8')) as FactsFile;
const isms = facts.facts.find((fact) => fact.id === 'isms');
const registrationNumber = isms?.registration_number;
if (!registrationNumber) {
  throw new Error(`${factsPath} の isms.registration_number が見つからない`);
}

const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

// 落ちたときに、file の名前・期待の値・実際に見つかった文を 1 つの message で出す。
const ismsLines = (text: string) =>
  text
    .split('\n')
    .map((line, index) => `${index + 1}: ${line.trim()}`)
    .filter((line) => line.includes('ISMS'))
    .join(' / ') || '（ISMS を含む行が無い）';

describe('ISMS の登録後の表記', () => {
  for (const file of targets) {
    it(`${file} は facts.json の登録番号を含み、登録前の言い方が無い`, () => {
      const text = read(file);
      expect(
        text.includes(registrationNumber),
        `${file}: 期待する登録番号 ${registrationNumber} が見つからない。実際の ISMS の行: ${ismsLines(text)}`
      ).toBe(true);

      const stale = text.match(stalePattern);
      expect(
        stale,
        `${file}: 登録前の言い方「${stale?.[0]}」が残っている。実際の ISMS の行: ${ismsLines(text)}`
      ).toBeNull();
    });
  }
});
