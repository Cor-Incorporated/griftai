/**
 * 記事の書き手（代表・寺田康佑）と会社の紹介。コラムとストーリーの著者欄、Article / Person の構造化データが読む。
 *
 * 2026-10-20 の GMO 定例で、記事の書き手と会社を検索エンジンが結び付けられるよう、
 * 「個人の著者＋会社のプロフィール」の形で載せることにした（E-E-A-T）。
 * 事実の出典は cor-jp.com（Cor-Incorporated/corsweb2024）の src/config/author.ts と i18n の ja.json:
 * - personId は cor-jp.com の Person と同じ @id にし、2 つのサイトで同じ人物だと示す
 * - bio は teamData（kousuke-terada）の description、companyLead は companyPage.lead
 * 変えるときは cor-jp.com 側と合わせる。
 */
export const founder = {
  personId: 'https://cor-jp.com/#person-kousuke-terada',
  name: '寺田 康佑',
  alternateNames: ['寺田康佑', 'Kousuke Terada', 'Kosuke Terada', 'terisuke'],
  jobTitle: '代表取締役',
  /** 著者欄の写真（cor-jp.com の k-terada-128.avif と同じ画像。64px 表示の 2 倍） */
  avatar: '/images/k-terada-128.avif',
  /** 構造化データ用の写真（原寸） */
  image: 'https://cor-jp.com/assets/k-terada.avif',
  profileUrl: 'https://cor-jp.com/about/#founder-story',
  bio: '音大卒 → 楽器メーカー営業 → メガベンチャーで法人営業 → IT へ転身という異色の経歴を活かし、"技術と言葉の橋渡し" に挑戦しています。',
  /** 著者欄のリンクと Person.sameAs（cor-jp.com の sameAs と同じ並び） */
  links: [
    { label: 'X', href: 'https://x.com/cor_terisuke' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kousuketerada/' },
    { label: 'Facebook', href: 'https://www.facebook.com/kousuke.terada.35' },
    { label: 'Qiita', href: 'https://qiita.com/terisuke' },
    { label: 'note', href: 'https://note.com/cor_instrument' },
    { label: 'GitHub', href: 'https://github.com/terisuke' },
  ],
} as const;

export const company = {
  name: 'Cor.株式会社',
  url: 'https://cor-jp.com/',
  profileUrl: 'https://cor-jp.com/company/',
  lead: 'Cor.株式会社は、福岡のAI実装会社です。機密データを外に出さないローカルLLM、確かめられる根拠をつくる自社プロダクト「Grift」、設計から運用までの受託開発を軸に、教育や地域での場づくりにも取り組んでいます。',
} as const;
