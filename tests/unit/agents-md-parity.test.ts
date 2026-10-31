import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * リンクテスト: AGENTS.md（Codex・OpenCode・Pi・dsh など Claude Code 以外のエージェント向け）は CLAUDE.md の写し。
 * 違ってよいのは、題名・最初の説明の行・日本語の文章の段落（yomiyasu と cor-voice の使い方）の 3 か所だけ。
 * griftai の日本語の文章は太字の段落ではなく、`- Japanese text and the CEO's voice:` で始まる 1 つの箇条書きなので、
 * その始まりから次の `- ` の行の手前までを印にする（corsweb2024 の scripts/__tests__/agents-md-parity.test.mjs と同じ形）。
 * 片方だけを変えると、ずれた行を出して落ちる。
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (name: string) => readFileSync(path.join(root, name), 'utf8');

const VOICE_START = "- Japanese text and the CEO's voice:";

/** 違ってよい 3 か所を、同じ印に置き換えた行の配列。 */
function normalized(text: string, markers: { title: string; intro: string }): string[] {
  const start = text.indexOf(VOICE_START);
  expect(start, `${markers.title}: 「${VOICE_START}」で始まる行が無い`).toBeGreaterThan(-1);
  const end = text.indexOf('\n- ', start);
  expect(end, `${markers.title}: 「${VOICE_START}」の次の箇条書きが無い`).toBeGreaterThan(start);
  return `${text.slice(0, start)}<voice>${text.slice(end)}`
    .replace(`# ${markers.title}`, '# <title>')
    .replace(markers.intro, '<intro>')
    .split('\n');
}

describe('AGENTS.md ↔ CLAUDE.md', () => {
  it('題名・最初の説明の行・日本語の文章の段落のほかは同じ', () => {
    const claude = normalized(read('CLAUDE.md'), {
      title: 'CLAUDE.md',
      intro:
        'This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.',
    });
    const agents = normalized(read('AGENTS.md'), {
      title: 'AGENTS.md',
      intro:
        'This file provides guidance to Codex, OpenCode, Pi, dsh and similar agents when working with code in this repository.',
    });
    expect(agents).toEqual(claude);
  });
});
