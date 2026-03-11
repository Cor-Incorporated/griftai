/**
 * Contact Page Configuration
 *
 * @description
 * Contact information, methods, and FAQ data for the contact page.
 * Modify these values to customize your contact page content.
 */

import type { ContactInfo, ContactMethod, ContactFAQ } from '../lib/types';

/** Contact information used across contact page and legal pages */
export const contact: ContactInfo = {
  email: '',
  supportEmail: '',
  salesEmail: '',
  address: {
    street: '天神2丁目3-10 天神パインクレスト719号',
    city: '福岡市中央区',
    state: '福岡県',
    zip: '810-0001',
    country: 'Japan',
  },
};

/** Contact methods displayed on the contact page */
export const contactMethods: ContactMethod[] = [
  {
    icon: 'lucide:building-2',
    label: 'Cor.inc',
    value: 'コーポレートサイトを見る',
    href: 'https://cor-jp.com/',
  },
  {
    icon: 'lucide:mail',
    label: '問い合わせ',
    value: '相談・お問い合わせはこちら',
    href: 'https://cor-jp.com/contact/',
  },
];

/** FAQ items displayed on the contact page */
export const contactFAQs: ContactFAQ[] = [
  {
    question: '問い合わせはどこに送られますか？',
    answer: '初期ベータでは、すべて Cor.inc の既存問い合わせ窓口に集約します。',
  },
  {
    question: 'LP 内にフォームはありますか？',
    answer:
      '初期リリースでは設置しません。後から差し替えやすいように実装しつつ、現在は既存の問い合わせ導線を使います。',
  },
  {
    question: 'Enterprise 相談も同じ窓口ですか？',
    answer: 'はい。Enterprise に関する相談も Cor.inc の問い合わせフォームから受け付けます。',
  },
];
