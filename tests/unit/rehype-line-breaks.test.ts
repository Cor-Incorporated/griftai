import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { lineBreakLocaleOf, rehypeLineBreaks, textContent } from '../../src/lib/rehype-line-breaks';

type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  value?: string;
};

const h = (tagName: string, children: Node[], properties: Record<string, unknown> = {}): Node => ({
  type: 'element',
  tagName,
  properties,
  children,
});

const t = (value: string): Node => ({ type: 'text', value });

function render(markdown: string, path: string): Node {
  const file = { path };
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeLineBreaks);
  const tree = processor.runSync(processor.parse(markdown), file) as unknown as Node;
  return tree;
}

/** 手で組んだ hast（<br>・heading-link など、markdown の変換では作れない物）に印を付ける。 */
function runTree(tree: Node, path: string): Node {
  rehypeLineBreaks()(tree, { path });
  return tree;
}

function findAll(node: Node, predicate: (node: Node) => boolean, out: Node[] = []): Node[] {
  if (predicate(node)) out.push(node);
  for (const child of node.children ?? []) findAll(child, predicate, out);
  return out;
}

describe('lineBreakLocaleOf', () => {
  it.each([
    ['/repo/src/content/articles/a.md', 'ja'],
    ['/repo/src/content/news/b.md', 'ja'],
    ['/repo/src/content/stories/story-x.md', 'ja'],
  ])('%s は対象（ja で固定）', (path) => {
    expect(lineBreakLocaleOf(path)).toBe('ja');
  });

  it.each(['/repo/src/pages/index.astro', '/repo/src/content/blog/a.md', '/repo/docs/a.md'])(
    '%s は対象の外',
    (path) => {
      expect(lineBreakLocaleOf(path)).toBeNull();
    }
  );
});

describe('rehypeLineBreaks', () => {
  it('日本語の段落を文と塊の span に分け、文字を変えない', () => {
    const markdown = '必要な記録はgit履歴にある。いつも使っている書式もある。';
    const tree = render(markdown, '/repo/src/content/articles/a.md');
    const before = textContent(tree);
    const sentences = findAll(tree, (node) =>
      node.properties?.className?.toString().includes('lb-sentence')
    );
    expect(sentences).toHaveLength(2);
    expect(textContent(tree)).toBe(before);
    expect(before).toBe(markdown);
  });

  it('link・強調・行の中の code・脚注の印の途中で切らず、文字を変えない', () => {
    const markdown =
      'これは[長い、名前のリンク](/x/)と**強調、の文**と`inline、code`と脚注[^1]です。次の文です。\n\n[^1]: 脚注の文。';
    const tree = render(markdown, '/repo/src/content/news/b.md');
    const before = textContent(tree);
    expect(textContent(tree)).toBe(before);
    const clauses = findAll(tree, (node) =>
      node.properties?.className?.toString().includes('lb-clause')
    );
    const linkClause = clauses.find(
      (clause) => findAll(clause, (node) => node.tagName === 'a').length > 0
    );
    expect(linkClause).toBeDefined();
    expect(findAll(linkClause as Node, (node) => node.tagName === 'a')[0].children?.[0].value).toBe(
      '長い、名前のリンク'
    );
    // 脚注の一覧には印を付けない
    const footnotes = findAll(
      tree,
      (node) => node.tagName === 'section' && node.properties?.dataFootnotes !== undefined
    );
    expect(footnotes).toHaveLength(1);
    expect(
      findAll(footnotes[0], (node) =>
        node.properties?.className?.toString().includes('lb-sentence')
      )
    ).toHaveLength(0);
  });

  it('段落の中の <br> を残し、<br> の前で文を終える', () => {
    const tree = runTree(
      h('div', [h('p', [t('一文目です。'), h('br', []), t('二文目です。')])]),
      '/repo/src/content/stories/story-x.md'
    );
    const before = textContent(tree);
    const sentences = findAll(tree, (node) =>
      node.properties?.className?.toString().includes('lb-sentence')
    );
    expect(sentences).toHaveLength(2);
    expect(findAll(tree, (node) => node.tagName === 'br')).toHaveLength(1);
    expect(textContent(tree)).toBe(before);
  });

  it('題は句点と読点の後だけの塊に分ける', () => {
    const tree = runTree(
      h('h2', [t('まずは記録。次に、並べる。')]),
      '/repo/src/content/articles/a.md'
    );
    const clauses = findAll(tree, (node) =>
      node.properties?.className?.toString().includes('lb-clause')
    );
    expect(clauses.map((clause) => clause.children?.map((child) => child.value).join(''))).toEqual([
      'まずは記録。',
      '次に、並べる。', // 「次に、」は 5 字以下の出だしなので次の塊と続ける（R1）
    ]);
    // 題には文の span を付けない
    expect(
      findAll(tree, (node) => node.properties?.className?.toString().includes('lb-sentence'))
    ).toHaveLength(0);
  });

  it('手で入れた <br> を持つ題は、そのまま使う', () => {
    const tree = runTree(
      h('h1', [t('経歴は盛れる。'), h('br', []), t('証拠は盛れない。')]),
      '/repo/src/content/articles/a.md'
    );
    expect(
      findAll(tree, (node) => node.properties?.className?.toString().includes('lb-clause'))
    ).toHaveLength(0);
    expect(textContent(tree)).toBe('経歴は盛れる。証拠は盛れない。');
  });

  it('画像だけの段落・table・pre・code には印を付けない', () => {
    const markdown =
      '![図](/img.png)\n\n| A | B |\n| --- | --- |\n| あ。 | い。 |\n\n```js\nconst a = 1;\n```\n';
    const tree = render(markdown, '/repo/src/content/articles/a.md');
    expect(
      findAll(tree, (node) => node.properties?.className?.toString().includes('lb-sentence'))
    ).toHaveLength(0);
  });

  it('対象の外の path には何もしない', () => {
    const tree = h('root', [h('p', [t('文は分けません。変わりません。')])]);
    runTree(tree, '/repo/src/pages/index.astro');
    expect(
      findAll(tree, (node) => node.properties?.className?.toString().includes('lb-sentence'))
    ).toHaveLength(0);
  });
});
