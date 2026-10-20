/**
 * Content Strings Configuration
 *
 * @description
 * Configurable text content for various site sections.
 * Modify these to customize messaging without touching component code.
 */

import type { AnnouncementConfig, ContentStrings } from '../lib/types';
import { corCta } from '../lib/cor-cta';

/** Announcement bar configuration */
export const announcement: AnnouncementConfig = {
  /** Show/hide the announcement bar */
  enabled: false,

  /** Unique ID - change this to reset dismissal for new announcements */
  id: 'grift-beta-2026',

  /** Announcement text */
  text: 'Grift — 経歴は盛れる。証拠は盛れない。紹介会社さま向けのテスト導入を受付中',

  /** Optional link URL */
  href: corCta.griftTrial('grift-announcement'),

  /** Optional link text */
  linkText: '自社でテストしてみる',

  /** Visual style: 'primary' | 'secondary' | 'gradient' */
  variant: 'secondary',

  /** Allow users to dismiss the announcement */
  dismissible: true,
};

/** Configurable content strings for various sections */
export const content: ContentStrings = {
  newsletter: {
    title: 'Griftの最新情報を受け取る',
    description:
      'Grift CLI のリリース情報や、推薦の根拠づくりに関するお知らせをお届けします。配信は月1〜2回程度です。',
    placeholder: 'メールアドレスを入力',
    buttonText: '登録する',
    successMessage: '登録ありがとうございます。次回の配信をお待ちください。',
    errorMessage: '送信に失敗しました。時間を置いて再度お試しください。',
    privacyNote: '現在はAI受付経由でのご連絡を受け付けています。',
  },
};
