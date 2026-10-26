import { describe, expect, it } from 'vitest';
import { griftCli } from '../../src/config/site';
import { tepFactsConfirmedWith } from '../../src/config/tep';

// tepFacts の数は grift-cli のコードから写したもの。サイトが掲載する版（griftCli.version）を上げたのに
// tepFacts を確かめ直していない状態を、両方の値を挙げて落とす（宣言と実体の二重管理を機械的に結ぶ）。
describe('tepFacts', () => {
  it('サイトが掲載する Grift CLI の版で確かめてある', () => {
    expect(
      tepFactsConfirmedWith,
      `tepFacts は grift-cli ${tepFactsConfirmedWith} で確かめたままだが、site.ts の griftCli.version は ${griftCli.version}。` +
        '新しい版のコードで tepFacts の数を確かめ直してから tepFactsConfirmedWith を上げる。'
    ).toBe(griftCli.version);
  });
});
