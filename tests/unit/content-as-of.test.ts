import { describe, expect, it } from 'vitest';
import { contentAsOf, griftCli } from '../../src/config/site';

// contentAsOf はトップと llms.txt の「情報は〇〇時点のもの」の日付。掲載している Grift CLI の版の公開日より前だと、
// まだ公開されていなかった版を、その時点の情報として載せることになる（2026-10-27: 0.9.0 の公開日 2026-10-27 に対して
// 2026-10-26 のまま本番に出ていた）。版を上げたら contentAsOf も公開日以降にする。日付は YYYY-MM-DD なので文字列で比べられる。
describe('contentAsOf', () => {
  it('掲載している Grift CLI の版の公開日より前にならない', () => {
    expect(
      contentAsOf >= griftCli.releasedOn,
      `contentAsOf は ${contentAsOf}、griftCli.releasedOn（v${griftCli.version}）は ${griftCli.releasedOn}。`
    ).toBe(true);
  });
});
