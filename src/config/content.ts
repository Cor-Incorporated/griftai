/**
 * Content Strings Configuration
 *
 * @description
 * Configurable text content for various site sections.
 * Modify these to customize messaging without touching component code.
 */

import type { AnnouncementConfig, ContentStrings } from '../lib/types';

/** Announcement bar configuration */
export const announcement: AnnouncementConfig = {
  /** Show/hide the announcement bar */
  enabled: false,

  /** Unique ID - change this to reset dismissal for new announcements */
  id: 'grift-beta-2026',

  /** Announcement text */
  text: 'AI見積自動化ツール Grift — プライベートアルファテスト募集中',

  /** Optional link URL */
  href: 'https://cor-jp.com/contact/',

  /** Optional link text */
  linkText: '実際の案件で試してみる',

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
      '新機能のリリース、ベータ版の改善情報、AI見積に関するノウハウをお届けします。配信は月1〜2回程度です。',
    placeholder: 'メールアドレスを入力',
    buttonText: '登録する',
    successMessage: '登録ありがとうございます。次回の配信をお待ちください。',
    errorMessage: '送信に失敗しました。時間を置いて再度お試しください。',
    privacyNote: '現在はお問い合わせフォーム経由でのご連絡を受け付けています。',
  },
};
