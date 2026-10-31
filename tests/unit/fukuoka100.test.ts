import { describe, expect, it } from 'vitest';
import { isWithinFukuoka100DisplayPeriod } from '../../src/lib/fukuoka100';

// 掲載期間の境界は production の isWithinFukuoka100DisplayPeriod を直接呼んで検証する
// （テスト内でロジックを再実装すると、定数を書き換えても落ちない空虚なテストになる）
describe('isWithinFukuoka100DisplayPeriod', () => {
  it('開始日の0時(JST)から表示可能', () => {
    expect(isWithinFukuoka100DisplayPeriod(new Date('2026-07-16T00:00:00+09:00'))).toBe(true);
    expect(isWithinFukuoka100DisplayPeriod(new Date('2026-07-15T23:59:59+09:00'))).toBe(false);
  });

  it('終了日いっぱいで終了（翌日0時以降は非表示）', () => {
    expect(isWithinFukuoka100DisplayPeriod(new Date('2027-07-31T23:59:59+09:00'))).toBe(true);
    expect(isWithinFukuoka100DisplayPeriod(new Date('2027-08-01T00:00:00+09:00'))).toBe(false);
  });
});
