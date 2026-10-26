/**
 * 数えるクリック（問い合わせへの CTA と、資料のダウンロード）を GA4 と Clarity のイベントにする。
 * BaseLayout.astro の document へのクリックのリスナーから呼ぶ。
 *
 * 資料はフォームなしでダウンロードできる（2026-10-20 の GMO 定例）ので、申し込みの数としては残らない。
 * ダウンロードのクリックを数えて、問い合わせより軽い次の一歩がどれだけ選ばれたかを見る。
 */

export type CtaMethod = 'chat' | 'tel' | 'mail';

export type TrackedClick =
  | {
      name: 'cta_click';
      params: { cta_method: CtaMethod; cta_source: string; cta_intent: string; link_url: string };
    }
  | {
      name: 'deck_download';
      params: { file_name: string; placement: string; link_url: string };
    };

export interface ClickContext {
  /** クリックされたリンクの href（絶対 URL） */
  href: string;
  /** リンクの置き場所（近くの section の id など）。問い合わせの CTA は URL の source を優先する */
  placement: string;
  /** このサイトのオリジン（location.origin） */
  siteOrigin: string;
  /** Cor.株式会社のサイトのオリジン（getCorBaseUrl()） */
  corOrigin: string;
}

const DOWNLOAD_PATH = /^\/downloads\/[^/]+\.pdf$/i;

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const contactClick = (
  method: CtaMethod,
  source: string,
  intent: string,
  linkUrl: string
): TrackedClick => ({
  name: 'cta_click',
  params: { cta_method: method, cta_source: source, cta_intent: intent, link_url: linkUrl },
});

export function describeTrackedClick(context: ClickContext): TrackedClick | null {
  const url = parseUrl(context.href);
  if (!url) return null;

  // 電話番号とメールアドレスは GA4 に送らない（個人を特定できる情報を送らない決まり）。種類だけを残す
  if (url.protocol === 'tel:') return contactClick('tel', context.placement, '', 'tel:');
  if (url.protocol === 'mailto:') return contactClick('mail', context.placement, '', 'mailto:');

  const corOrigin = parseUrl(context.corOrigin)?.origin;
  if (url.origin === corOrigin && url.pathname.startsWith('/contact')) {
    return contactClick(
      'chat',
      url.searchParams.get('source') ?? context.placement,
      url.searchParams.get('intent') ?? '',
      url.href
    );
  }

  if (url.origin === parseUrl(context.siteOrigin)?.origin && DOWNLOAD_PATH.test(url.pathname)) {
    return {
      name: 'deck_download',
      params: {
        file_name: url.pathname.split('/').pop() ?? '',
        placement: context.placement,
        link_url: url.href,
      },
    };
  }

  return null;
}
