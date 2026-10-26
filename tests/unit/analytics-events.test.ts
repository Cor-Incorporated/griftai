import { describe, expect, it } from 'vitest';
import { describeTrackedClick } from '../../src/lib/analytics-events';
import { corCta } from '../../src/lib/cor-cta';
import { griftCliDeck } from '../../src/config/documents';

// 判定は production の describeTrackedClick を直接呼んで確かめる。CTA の URL も production の
// corCta で作り、URL の形が変わったら落ちるようにする。
const context = {
  placement: 'hero',
  siteOrigin: 'https://griftai.org',
  corOrigin: 'https://cor-jp.com',
};

describe('describeTrackedClick', () => {
  it('問い合わせの CTA は cta_click にし、置き場所は URL の source を使う', () => {
    const href = corCta.griftTrial('grift-lp-final');
    expect(describeTrackedClick({ ...context, href })).toEqual({
      name: 'cta_click',
      params: {
        cta_method: 'chat',
        cta_source: 'grift-lp-final',
        cta_intent: 'grift-team-beta',
        link_url: href,
      },
    });
  });

  it('source のない問い合わせの URL は、リンクの置き場所を使う', () => {
    const tracked = describeTrackedClick({ ...context, href: 'https://cor-jp.com/contact/' });
    expect(tracked?.name).toBe('cta_click');
    expect(tracked?.params).toMatchObject({ cta_source: 'hero', cta_intent: '' });
  });

  it('資料の PDF は deck_download にする', () => {
    const href = new URL(griftCliDeck.href, context.siteOrigin).href;
    expect(describeTrackedClick({ ...context, href })).toEqual({
      name: 'deck_download',
      params: { file_name: 'grift-cli-overview.pdf', placement: 'hero', link_url: href },
    });
  });

  it('電話とメールは種類だけを送り、番号とアドレスは送らない', () => {
    const tel = describeTrackedClick({ ...context, href: 'tel:05017929351' });
    const mail = describeTrackedClick({ ...context, href: 'mailto:company@cor-jp.com' });
    expect(tel?.params).toMatchObject({ cta_method: 'tel', link_url: 'tel:' });
    expect(mail?.params).toMatchObject({ cta_method: 'mail', link_url: 'mailto:' });
    expect(JSON.stringify([tel, mail])).not.toMatch(/05017929351|company@cor-jp\.com/);
  });

  it('数えないリンクは null にする', () => {
    for (const href of [
      'https://github.com/Cor-Incorporated/grift-cli',
      'https://griftai.org/faq/',
      'https://cor-jp.com/works/',
      'https://example.com/downloads/other.pdf',
      'not a url',
    ]) {
      expect(describeTrackedClick({ ...context, href }), href).toBeNull();
    }
  });
});
