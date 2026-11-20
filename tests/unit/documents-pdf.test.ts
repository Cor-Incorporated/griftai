import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { griftCliDeck } from '../../src/config/documents';

// 資料の説明（ページ数・大きさ）は src/config/documents.ts にあり、実体は public/downloads の PDF。
// 同じ事実が 2 か所にあるので、PDF を差し替えて説明を直し忘れたら落ちるようにする。
// 落ちた時の message に、説明の値と PDF から読んだ値の両方を入れる。
const pdfPath = fileURLToPath(new URL(`../../public${griftCliDeck.href}`, import.meta.url));
const bytes = readFileSync(pdfPath);

function readPageCount(pdf: Buffer): number {
  // ページの木の根の /Count が、全ページ数。しおり（アウトライン）の /Count 0 などもあるので、最大の値を取る。
  const counts = [...pdf.toString('latin1').matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return counts.length === 0 ? 0 : Math.max(...counts);
}

describe('griftCliDeck と、public の PDF', () => {
  it('pages は、PDF のページ数と同じ', () => {
    const actual = readPageCount(bytes);
    expect(
      griftCliDeck.pages,
      `documents.ts の pages は ${griftCliDeck.pages}、PDF のページ数は ${actual}（${griftCliDeck.href}）`
    ).toBe(actual);
  });

  it('sizeLabel は、PDF の大きさ（KB に丸めた値）と同じ', () => {
    const actual = `約${Math.round(bytes.length / 1024)}KB`;
    expect(
      griftCliDeck.sizeLabel,
      `documents.ts の sizeLabel は ${griftCliDeck.sizeLabel}、PDF の大きさは ${bytes.length} byte（${actual}）`
    ).toBe(actual);
  });
});
