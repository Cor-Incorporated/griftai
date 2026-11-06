import { describe, expect, it } from 'vitest';
import { resolveAnalytics } from '../../src/config/analytics';

// GA4 と Clarity の ID はコードに書かず、ビルドの環境変数（PUBLIC_GA4_ID / PUBLIC_CLARITY_ID）から読む。
// 判定は production の resolveAnalytics を直接呼んで確かめる。
// 落ちるべき変更:
//   - ID を config に直書きに戻す（空の env でも ID が入る）
//   - 未設定の env で空文字以外を返す（BaseLayout が「空なら出さない」を判定できなくなる）
//   - 形式の崩れた値（引用符・空白・クエリ）をそのまま返す（タグの URL に混ざる）
//   - 本番のホストの一覧を落とす・広げる（localhost などでタグが出る）

describe('resolveAnalytics', () => {
  it('env に設定した 2 つの ID をそのまま返す', () => {
    expect(
      resolveAnalytics({ PUBLIC_GA4_ID: 'G-ABCDE12345', PUBLIC_CLARITY_ID: 'abcde12345' })
    ).toMatchObject({ ga4MeasurementId: 'G-ABCDE12345', clarityProjectId: 'abcde12345' });
  });

  it('未設定なら 2 つとも空（タグを出さない）。直書きの ID を持たない', () => {
    const result = resolveAnalytics({});
    expect(result.ga4MeasurementId).toBe('');
    expect(result.clarityProjectId).toBe('');
    // 以前は直書きだった 2 つの ID が、どこにも残っていない
    expect(JSON.stringify(result)).not.toContain('G-3E8328E5V6');
    expect(JSON.stringify(result)).not.toContain('wk1nad97m0');
  });

  it.each([
    ['空文字', ''],
    ['空白だけ', '   '],
    ['改行だけ', '\n'],
  ])('ID が%sなら空', (_label, value) => {
    expect(resolveAnalytics({ PUBLIC_GA4_ID: value, PUBLIC_CLARITY_ID: value })).toMatchObject({
      ga4MeasurementId: '',
      clarityProjectId: '',
    });
  });

  it('前後の空白と改行は取り除く（secret に改行が混ざる失敗への備え）', () => {
    expect(
      resolveAnalytics({ PUBLIC_GA4_ID: ' G-ABCDE12345\n', PUBLIC_CLARITY_ID: '\tabcde12345 ' })
    ).toMatchObject({ ga4MeasurementId: 'G-ABCDE12345', clarityProjectId: 'abcde12345' });
  });

  it.each([
    ['GA4 に Clarity の ID を入れ違えた', 'abcde12345'],
    ['GA4 に旧 UA の ID', 'UA-12345-1'],
    ['GA4 の値に引用符', 'G-ABC"onload="x'],
    ['GA4 の値に空白', 'G-ABC DEF'],
    ['GA4 の値にクエリ', 'G-ABC123&l=x'],
    ['GA4 の値にバッククォート（手順書のコード表記の混入）', '`G-ABC123`'],
    ['GA4 の値が小文字', 'g-abc123'],
  ])('形式の崩れた PUBLIC_GA4_ID（%s）は出さない', (_label, value) => {
    expect(resolveAnalytics({ PUBLIC_GA4_ID: value }).ga4MeasurementId).toBe('');
  });

  it.each([
    ['引用符', 'abc"def'],
    ['空白', 'abc def'],
    ['スラッシュ', 'abc/def'],
    ['クエリ', 'abc?x=1'],
    ['バッククォート', '`abcde12345`'],
  ])('形式の崩れた PUBLIC_CLARITY_ID（%s）は出さない', (_label, value) => {
    expect(resolveAnalytics({ PUBLIC_CLARITY_ID: value }).clarityProjectId).toBe('');
  });

  it('GA4 と Clarity は互いに独立（片方だけ設定してもよい）', () => {
    expect(resolveAnalytics({ PUBLIC_GA4_ID: 'G-ABCDE12345' })).toMatchObject({
      ga4MeasurementId: 'G-ABCDE12345',
      clarityProjectId: '',
    });
    expect(resolveAnalytics({ PUBLIC_CLARITY_ID: 'abcde12345' })).toMatchObject({
      ga4MeasurementId: '',
      clarityProjectId: 'abcde12345',
    });
  });

  it('タグを読み込む本番のホストは griftai.org と www.griftai.org だけ（env では変えない）', () => {
    expect(resolveAnalytics({}).productionHosts).toEqual(['griftai.org', 'www.griftai.org']);
    expect(
      resolveAnalytics({ PUBLIC_GA4_ID: 'G-ABCDE12345', PUBLIC_CLARITY_ID: 'abcde12345' })
        .productionHosts
    ).toEqual(['griftai.org', 'www.griftai.org']);
  });
});
