/**
 * ダウンロードできる資料。2026-10-20 の GMO 定例で、問い合わせより心理的な負担の小さい
 * 「資料のダウンロード」をページの次の一歩にすることを決めた（代表の判断で、申し込みなしで直接ダウンロードする形）。
 *
 * PDF は代表が Qiita の記事（2026-08-24）から公開している Grift CLI の紹介資料と同じもの。
 * 資料の中の版とコマンドは作成時点（Grift CLI v0.5）のもので、今の版（griftCli.version）とは違う。
 * 差し替えたら preparedOn と note を直す。
 */
export const griftCliDeck = {
  href: '/downloads/grift-cli-overview.pdf',
  title: 'Grift CLI 紹介資料',
  format: 'PDF',
  pages: 20,
  sizeLabel: '約510KB',
  preparedOn: '2026-08-23',
  note: '2026年8月時点（Grift CLI v0.5）の資料です。最新の使い方はGitHubのREADMEをご覧ください。',
  contents: [
    'git履歴から何を取り出し、何を出さないか',
    '測る項目と、数値の読み方（分子と分母）',
    'エンジニア本人と紹介会社さまの使い方',
    'よくある質問',
  ],
} as const;
