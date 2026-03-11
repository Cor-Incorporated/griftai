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
  text: '日本市場向け Grift Beta を公開中',

  /** Optional link URL */
  href: 'https://cor-jp.com/contact/',

  /** Optional link text */
  linkText: 'ベータ相談はこちら',

  /** Visual style: 'primary' | 'secondary' | 'gradient' */
  variant: 'secondary',

  /** Allow users to dismiss the announcement */
  dismissible: true,
};

/** Configurable content strings for various sections */
export const content: ContentStrings = {
  newsletter: {
    title: '更新情報を受け取る',
    description: '初期ベータの更新、価格改定、公開機能の情報をお送りします。',
    placeholder: 'メールアドレスを入力',
    buttonText: '登録する',
    successMessage: '登録を受け付けました。',
    errorMessage: '送信に失敗しました。時間を置いて再度お試しください。',
    privacyNote: '初期リリースでは LP 内フォームを使わず、外部導線へ集約します。',
  },
};
