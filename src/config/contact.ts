/**
 * Contact Page Configuration
 *
 * @description
 * Contact information, methods, and FAQ data for the contact page.
 * Modify these values to customize your contact page content.
 */

import type { ContactInfo, ContactMethod, ContactFAQ } from '../lib/types';
import { corCta, getCorUrl } from '../lib/cor-cta';

/** Contact information used across contact page and legal pages */
export const contact: ContactInfo = {
  email: '',
  supportEmail: '',
  salesEmail: '',
  phone: '050-1792-9351',
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
    href: getCorUrl('/'),
  },
  {
    icon: 'lucide:message-circle',
    label: 'AI受付',
    value: 'AI受付で相談する',
    href: corCta.teamBeta('grift-contact-methods'),
  },
  {
    icon: 'lucide:phone',
    label: '電話',
    value: `AI受付の電話窓口（${contact.phone}）へ発信する`,
    href: `tel:${contact.phone.replaceAll('-', '')}`,
  },
];

/** FAQ items displayed on the contact page */
export const contactFAQs: ContactFAQ[] = [
  {
    question: '問い合わせはどこに送られますか？',
    answer: 'Griftからのお問い合わせは、Cor.株式会社のAI受付に集約します。',
  },
  {
    question: '問い合わせ方法は何ですか？',
    answer:
      'AI受付に相談内容を入力してご連絡いただけます。案件概要やチーム規模を添えていただくとスムーズです。',
  },
  {
    question: '電話でも相談できますか？',
    answer: `はい。Cor.株式会社コールセンター（${contact.phone}）へお電話ください。`,
  },
];
