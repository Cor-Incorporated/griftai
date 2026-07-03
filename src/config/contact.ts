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
    label: 'Cor.株式会社',
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
    answer: 'ベータ提供中は、すべて Cor.株式会社 の既存問い合わせ窓口に集約します。',
  },
  {
    question: '問い合わせ方法は何ですか？',
    answer:
      '現在は Cor.株式会社 の問い合わせフォームからご連絡いただけます。案件概要やチーム規模を添えていただくとスムーズです。',
  },
  {
    question: '個別相談も同じ窓口ですか？',
    answer: 'はい。導入条件や個別相談も Cor.株式会社 の問い合わせフォームから受け付けます。',
  },
];
