/**
 * TEP（Technical Evidence Pipeline）の説明に使う言葉と、TEP が数えるものの一覧。
 * /tep/、トップの「観測すること」（ProductShowcase）、FAQ、llms.txt、構造化データがここを読む。
 *
 * 読み手の中心は、紹介会社・SES の営業と案件の担当（非エンジニア）、自社開発企業の採用担当、エンジニア本人。
 * 本文は平易な言い方（plain）を主にし、サイトの用語（site。2026-10-25 の #77 で決めた訳語）は括弧に添える。
 * CLI のキー名（下線を含む名前と、report-v2 のような版付きの出力形式の名前。規則は
 * scripts/lib/cli-key-names.mjs）は、このファイルの `cli` / `cliNote` の値にだけ書き、ページはここから読んで出す。
 * ほかの場所にキー名を書くと `npm run check:terms`（scripts/check-plain-terms.mjs）と e2e が落ちる。
 * 英語の指標名（test co-change など）とコマンド名は、元の語として括弧や脚注に出してよい。
 *
 * 事実の出典は Cor-Incorporated/grift-cli（v0.9.1。tag v0.9.1 = commit a9b468d のコードで 2026-10-28 に確かめた）。
 * どの版で確かめたかは tepFactsConfirmedWith に書き、site.ts の griftCli.version と一致することを
 * tests/unit/tep-facts.test.ts が検査する。数は tepFacts にまとめた:
 * - 変えた部分: src/tep_core/v2_constants.py の SURFACES と path_surface.py（ファイルの場所と拡張子で分ける）
 * - 変更のペース: rhythm.py（間隔の中央値と 90 パーセンタイル、短い間隔と長い間隔の割合）
 * - テストの付け方: verification_profile.py
 * - いまのコードの新しさ: survival.py（いまの行の経過日数に exp(-日数/180) の重みを付けた平均）。
 *   180 日後に残った行の割合ではない。サイトの用語は 2026-10-26 に「定着率」から「コードの新しさ」へ改めた
 *   （「定着」とは逆向きに読めるため。grift-cli 0.9.0 の metrics-guide と同じ語で、英語は Code recency）
 * - 関わり方: role_profile.py（同意の記録がある identity のときだけ出る）
 * - 案件との並び: docs/alignment-schema.md の comparison と complementarity.py の MIN_TEAM_SIZE
 * サイトの用語と CLI の語の対応は、CLI 側の docs/metrics-guide.md の対応表（0.8.0 から）にもある。
 * 4 つの観点の平易な言い方とサイトの用語は、grift-cli 0.9.0 の Markdown の見出し（docs/metrics-guide.md の
 * 「Markdown の観点の呼び名」）と同じ。0.9.0 で CLI 側がサイトの言い方にそろえた（grift-cli の CHANGELOG 0.9.0）。
 */

/**
 * tepFacts を grift-cli のどの版のコードで確かめたか。
 * site.ts の griftCli.version を上げたら、tepFacts の数を新しい版で確かめ直してから、ここも上げる。
 * 2 つがずれると tests/unit/tep-facts.test.ts が両方の値を挙げて落ちる。
 */
export const tepFactsConfirmedWith = '0.9.1';

/** grift-cli のコードで決まっている数（確かめた版は tepFactsConfirmedWith）。本文に出す数はここから読む */
export const tepFacts = {
  /** これより少ない件数では割合を出さない（MIN_POPULATION_FOR_RATES） */
  minCount: 20,
  /** 帰属の分類の数（origin） */
  originClassCount: 11,
  /** 変えた部分の区分の数（SURFACES） */
  surfaceCount: 11,
  /** 変更のペースを数える窓の日数（RHYTHM_WINDOW_DAYS） */
  rhythmWindowDays: 180,
  /** 短い間隔とみなす日数（burst_share の境界） */
  burstGapDays: 2,
  /** 長い間隔とみなす日数（long_gap_share の境界） */
  longGapDays: 30,
  /** やり直しを数える窓の日数（rework） */
  reworkWindowDays: 21,
  /** いまのコードの新しさで重みの目安にする日数（survival の TAU_DAYS） */
  survivalTauDays: 180,
  /** チームで集計する最少の人数（MIN_TEAM_SIZE） */
  minTeamSize: 3,
  /**
   * 「何件のうち何件か」の説明に使う架空の例。実在の人やリポジトリの値ではない。
   * Grift CLI の README の例（架空の例「40 件のうち 12 件」）とそろえている。
   * 以前は公開リポジトリ click の値（検証用に選んだ 1 人分）を載せていたが、実在の人の数値を
   * 公開面に出さない方針（2026-10-25、README と同じ）に合わせて差し替えた。
   */
  cochangeExample: { numerator: 12, denominator: 40, ratio: '0.3' },
} as const;

/** TEP が数えるもの 1 つ */
export interface TepObservation {
  /** 本文で使う平易な名前 */
  plain: string;
  /** サイトの用語。平易な名前と同じときは省く */
  site?: string;
  /** 何を数えるか */
  counts: string;
  /** これだけでは分からないこと */
  cannotTell: string;
  /** CLI の出力での名前 */
  cli: string;
  /** CLI の名前の補足（括弧に添える） */
  cliNote?: string;
}

/** 1 つの問いに答える観測のまとまり */
export interface TepObservationGroup {
  /** ページ内リンクの id */
  id: string;
  /** このまとまりが答える問い */
  question: string;
  /** 扱いの補足（合否に使わない、指定したときだけ など） */
  note?: string;
  observations: readonly TepObservation[];
}

/** 本文での名前。サイトの用語があれば括弧に添える（例: テストも一緒に変えた割合（テスト併修率）） */
export const tepLabel = (item: { plain: string; site?: string }): string =>
  item.site && item.site !== item.plain ? `${item.plain}（${item.site}）` : item.plain;

/** CLI の名前に補足を添えた文字列（llms.txt など、文字だけで出す場所で使う） */
export const tepCliText = (item: { cli: string; cliNote?: string }): string =>
  item.cliNote ? `${item.cli}（${item.cliNote}）` : item.cli;

export const tepObservationGroups: readonly TepObservationGroup[] = [
  {
    id: 'who',
    question: '誰の変更か',
    observations: [
      {
        plain: '誰の変更かの区別',
        site: '帰属の区別',
        counts: `コミット（変更を記録した1件）ごとに、本人の変更、ほかの人の変更、自動で動くプログラム（bot）の変更、自動で作られたファイルや外から取り込んだコード、コピー元のリポジトリ（fork元）から引き継いだ記録などを、${tepFacts.originClassCount}の分類で分けて数えます。`,
        cannotTell: 'コードの良し悪しは分かりません。',
        cli: 'origin',
        cliNote: `${tepFacts.originClassCount}分類`,
      },
    ],
  },
  {
    id: 'work',
    question: 'どの部分を変えたか',
    observations: [
      {
        plain: '変えた部分の区分',
        site: '作業領域',
        counts: `変えたファイルの場所と種類から、画面、サーバー側、データ、基盤、テスト、文書、自動化の設定（CI/CD）、監視、設定ファイル、生成物・外部のコード、そのほかの${tepFacts.surfaceCount}の区分に分けて、区分ごとに変えたコミットの件数を数えます。`,
        cannotTell:
          'ファイルの名前から機械的に分けるので、職種や得意分野を決めるものではありません。',
        cli: 'surface_profile',
      },
    ],
  },
  {
    id: 'pace',
    question: 'どんなペースで変えたか',
    observations: [
      {
        plain: '変更のペース',
        site: '変更リズム',
        counts: `直近${tepFacts.rhythmWindowDays}日のうち、変更を記録した日が何日あったかを数えます。変更と変更のあいだが何日空いたかも、真ん中の値と長いほうから1割にあたる値で示し、${tepFacts.burstGapDays}日以内の間隔と${tepFacts.longGapDays}日以上の間隔の割合も出します。`,
        cannotTell:
          '労働時間や勤怠、意欲、納期を守ったかは分かりません。毎日小さな変更を記録すれば日数は増え、まとめて記録すれば減ります。',
        cli: 'change_rhythm',
      },
    ],
  },
  {
    id: 'test',
    question: 'テストと一緒に変えたか',
    observations: [
      {
        plain: 'テストも一緒に変えた割合',
        site: 'テスト併修率',
        counts:
          '本番のコード（テストと文書以外）を変えたコミットのうち、同じコミットでテストも変えたものの割合です。',
        cannotTell:
          'テストが通ったか、テストやコードの質は分かりません。文書や設計が中心の仕事のように、テストが前提でない仕事では低く出るのが自然です。',
        cli: 'test co-change',
      },
      {
        plain: 'テストの付け方',
        site: '検証の形',
        counts:
          'テストを触ったコミットの割合、テストの種類（単体・結合・E2E・契約）、不具合の修正（fix・revert）のうちテストも一緒に変えたものの割合を出します。',
        cannotTell: 'テストの担当（QA）に向いているかは分かりません。',
        cli: 'verification_profile',
      },
    ],
  },
  {
    id: 'with',
    question: 'どんなリポジトリでどう関わったか',
    observations: [
      {
        plain: 'リポジトリの様子',
        site: 'リポジトリの文脈',
        counts:
          '関わった人の数、いちばん多く変更した人が占める割合（名前は出しません）、取り込み（マージ）の記録の割合、使っている言語、活動の密度など、数値が出たリポジトリの様子を並べます。',
        cannotTell: '個人の能力や、チームの優劣は分かりません。分類であって、序列ではありません。',
        cli: 'context profile',
      },
      {
        plain: '関わり方',
        counts:
          '本人の同意が記録されているときだけ、新しいファイルを作ったコミット、既にあるファイルを直したコミット、取り込み（マージ）のコミット、本人が付けたリリースの印の数などを出します。',
        cannotTell:
          '職種を決めるものではありません。CLIが確かめるのは同意が記録されていることで、同意そのものではありません。',
        cli: 'role_profile',
      },
    ],
  },
  {
    id: 'rework',
    question: 'すぐに直したか',
    note: '傾向の記録で、合否には使いません。',
    observations: [
      {
        plain: '修正でのやり直し',
        site: '手戻り率',
        counts: `${tepFacts.reworkWindowDays}日以内に触ったファイルを、修正（fix）や取り消し（revert）などの件名で、もう一度変えたコミットの割合です。`,
        cannotTell:
          'バグの件数や品質ではありません。件名の付け方で出方が変わるので、人と比べたり合否に使ったりしません。',
        cli: 'corrective rework',
      },
      {
        plain: '同じファイルへの戻り',
        site: '磨き直し',
        counts: `本番のコードの同じファイルに、${tepFacts.reworkWindowDays}日以内にもう一度手を入れたコミットの割合です。`,
        cannotTell: '手戻りや不具合の件数ではありません。',
        cli: 'path retouch',
      },
    ],
  },
  {
    id: 'age',
    question: 'いまのコードはどれくらい新しいか',
    note: '計測を指定したときだけ出します。',
    observations: [
      {
        plain: 'コードの新しさ',
        counts: `いまのコードに残っている行が、書かれてからどれくらい経っているかを、${tepFacts.survivalTauDays}日を目安に重みを付けて平均した値です。1に近いほど、最近書かれた行が多いことを表します。`,
        cannotTell: `${tepFacts.survivalTauDays}日後に残った行の割合や、コードの品質ではありません。リポジトリ全体の値で、一人ひとりの値ではありません。`,
        cli: 'survival',
        cliNote: '--survival を付けたとき',
      },
    ],
  },
];

/** 項目ごとの並びの 5 通り（サイトの用語のまま使う） */
export interface TepComparison {
  site: string;
  meaning: string;
  cli: string;
}

export const tepComparisons: readonly TepComparison[] = [
  {
    site: '重なり',
    meaning: '記録が案件の求める項目や範囲と重なっている',
    cli: 'overlap',
  },
  {
    site: '範囲外',
    meaning: '記録の値が案件の書いた範囲の外にある。能力が足りないという意味ではない',
    cli: 'outside_declared_range',
  },
  {
    site: '0件',
    meaning: '数えた範囲で、その項目の記録が0件だった',
    cli: 'observed_zero',
  },
  {
    site: '未観測',
    meaning: '記録が渡されていない、件数が少ないなどで、比べられなかった',
    cli: 'not_observed',
  },
  {
    site: '要求なし',
    meaning: '案件側がその項目を求めていない',
    cli: 'not_declared',
  },
];

/** 並びの言い方（例: 重なり・範囲外・0件・未観測・要求なしの5通り）。FAQ・トップの流れ・llms.txt も使う */
export const tepComparisonSummary = `${tepComparisons.map((item) => item.site).join('・')}の${tepComparisons.length}通り`;

/** 案件の要求と記録を並べるときの道具 */
export interface TepAlignmentTool {
  /** 手順と結びつけるための id */
  id: 'project' | 'align' | 'team';
  plain: string;
  site: string;
  description: string;
  /** 手順に添えるコマンド */
  command: string;
  cli: string;
  cliNote?: string;
}

export const tepAlignmentTools: readonly TepAlignmentTool[] = [
  {
    id: 'project',
    plain: '案件側が書き出す要求',
    site: '案件側の宣言',
    description:
      '案件で求める作業の区分、テストの種類、変更のペースなどを、案件側が項目ごとに書き出します。書かなかった項目は「要求なし」として扱い、0や不足にはなりません。',
    command: 'grift project',
    cli: 'grift project',
    cliNote: 'project-v1',
  },
  {
    id: 'align',
    plain: '項目ごとの並び',
    site: '軸ごとの並び',
    description: `案件側の要求と候補者の記録を項目ごとに並べ、${tepComparisonSummary}で示します。総合点・順位・合否・推薦は計算しません。`,
    command: 'grift align',
    cli: 'grift align',
    cliNote: 'alignment-v1',
  },
  {
    id: 'team',
    plain: 'チームで見るとき',
    site: 'チーム単位の充足',
    description: `要求を満たす人数だけを出し、一人ひとりの数値は出しません。${tepFacts.minTeamSize}人未満のチームでは集計しません。${tepFacts.minTeamSize - 1}人だと、誰が満たしていないかが分かってしまうためです。`,
    command: 'grift align --team',
    cli: 'grift align --team',
  },
];

/** id で道具を引く（並び順に頼らない） */
export const tepAlignmentTool = (id: TepAlignmentTool['id']): TepAlignmentTool => {
  const tool = tepAlignmentTools.find((item) => item.id === id);
  if (!tool) throw new Error(`tepAlignmentTools has no item with id "${id}"`);
  return tool;
};

/** 用語の対応表の 1 行 */
export interface TepTerm {
  plain: string;
  site: string;
  cli: string;
  cliNote?: string;
}

/**
 * 用語の対応表（このページの言い方・サイトの用語・CLI の出力での名前）。/tep/ の表と llms.txt の表が読む。
 * 観測と並びの道具の行は上の一覧から作るので、言い換えを変えるときは上だけを直す。
 */
export const tepTerms: readonly TepTerm[] = [
  {
    plain: 'git履歴から数えた値',
    site: '検査値',
    cli: 'observed value',
    cliNote: 'kind: observed の value と unit',
  },
  ...tepObservationGroups.flatMap((group) =>
    group.observations.map((item) => ({
      plain: item.plain,
      site: item.site ?? item.plain,
      cli: item.cli,
      cliNote: item.cliNote,
    }))
  ),
  ...tepAlignmentTools.map((tool) => ({
    plain: tool.plain,
    site: tool.site,
    cli: tool.cli,
    cliNote: tool.cliNote,
  })),
  {
    plain: '数えられなかったもの',
    site: '未観測',
    cli: 'not_observed',
    cliNote: '理由のコード付き',
  },
  {
    plain: 'git履歴から確かめられる事実を取り出す方法',
    site: 'TEP',
    cli: 'Technical Evidence Pipeline',
  },
];
