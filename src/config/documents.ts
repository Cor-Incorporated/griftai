/**
 * ダウンロードできる資料。2026-10-20 の GMO 定例で、問い合わせより心理的な負担の小さい
 * 「資料のダウンロード」をページの次の一歩にすることを決めた（代表の判断で、申し込みなしで直接ダウンロードする形）。
 *
 * PDF は 2026-11-20 に、12 ページの新しい版（Grift CLI v0.9.1・2026年10月28日時点）へ差し替えた。
 * 同じ URL・同じ file 名で差し替えたので、Qiita の記事（2026-08-24）など外からの link はそのまま使える。
 * 差し替えたら pages・sizeLabel・preparedOn・note・contents を、新しい PDF の実の値に直す。
 */
export const griftCliDeck = {
  href: '/downloads/grift-cli-overview.pdf',
  title: 'Grift CLI 紹介資料',
  format: 'PDF',
  pages: 12,
  sizeLabel: '約472KB',
  preparedOn: '2026-11-20',
  note: '2026年10月28日時点（Grift CLI v0.9.1）の資料です。最新の使い方はGitHubのREADMEをご覧ください。',
  contents: [
    'git履歴から何を取り出し、何を出さないか',
    '推薦までの流れと、読み手別の使い方',
    '提供状況（正式版は2027年の提供開始を目指しています）と、料金の考え方',
    'テスト導入のご相談と、Cor.株式会社の会社概要',
  ],
} as const;
