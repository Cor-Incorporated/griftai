/**
 * 福岡を代表する企業100選 公式エンブレムの掲載管理。
 * corsweb (#276) と同じく、運営（株式会社IOBI）の許諾条件に従う:
 *  - 条件②: エンブレムのクリックで選出企業の特設ページへ遷移させること（FUKUOKA100_PAGE_URL）
 *  - 条件③: 掲載期間は 2027年7月末まで（2026-07-16 和田様回答「本日からのご掲載で問題ありません」により
 *    サイト公開日から掲載可）
 *
 * 判定は「明示フラグ AND 期間」。日付だけに頼らない理由:
 * 本番デプロイは main への push でのみ走り定期ビルドが無いため、日付を跨いでも
 * 再ビルドされなければ表示は切り替わらない。日付単独では「自動で期限が切れる」という
 * 誤った安心感を与えるため、人手の操作をフラグで明示する。
 *
 * 運用:
 *  - 掲載終了（FUKUOKA100_DISPLAY_END）までに FUKUOKA100_EMBLEM_ENABLED = false へ戻し、
 *    main へ反映する。取り下げ忘れは掲載期限違反になるため、期限のリマインダ
 *    （Issue/カレンダー）を必ず併用する。
 */
export const FUKUOKA100_PAGE_URL = 'https://madeinlocal.jp/category/companies/fukuoka062';

/** 掲載開始日（ISO・JST）。IOBI 和田様の前倒し許諾（2026-07-16）に基づく。 */
export const FUKUOKA100_DISPLAY_START = '2026-07-16';

/** 掲載終了日（ISO・JST）。IOBI 回答「2026年版の掲載期限は2027年7月末まで」。この日いっぱいで終了。 */
export const FUKUOKA100_DISPLAY_END = '2027-07-31';

/** 掲載の明示スイッチ。IOBI より掲載許諾を取得済みのため有効（掲載期限到来時は false へ戻す）。 */
export const FUKUOKA100_EMBLEM_ENABLED = true;

/**
 * 掲載期間内かどうか（条件③）。フラグとは独立に公開し、期間ロジック単体を検証可能にする。
 */
export function isWithinFukuoka100DisplayPeriod(now: Date): boolean {
  const start = new Date(`${FUKUOKA100_DISPLAY_START}T00:00:00+09:00`);
  // 終端は排他的（終了日の 24:00 = 翌日 0:00 以降は非表示）。
  const end = new Date(`${FUKUOKA100_DISPLAY_END}T24:00:00+09:00`);
  return now >= start && now < end;
}

/** 福岡100選エンブレムを表示してよいか（明示フラグ AND 掲載期間内）。 */
export function isFukuoka100EmblemVisible(now: Date = new Date()): boolean {
  return FUKUOKA100_EMBLEM_ENABLED && isWithinFukuoka100DisplayPeriod(now);
}
