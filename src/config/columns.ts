export interface ColumnArticle {
  title: string;
  href: string;
  category: '要件定義' | '見積支援' | 'AI開発費用' | '上流工程';
  summary: string;
  featured?: boolean;
  landingTitle?: string;
  landingCategory?: '要件定義' | '見積支援' | 'AI開発費用' | '上流工程';
  landingSummary?: string;
}

export const columnArticles: ColumnArticle[] = [
  {
    title: 'AIを活用した要件定義ツールで属人化を防ぐ',
    href: '/ai-tool-requirement-definition/',
    category: '要件定義',
    summary: '要件定義の進め方、必須スキル、AIツールで属人化を防ぐ考え方を整理します。',
    featured: true,
  },
  {
    title: '要件定義プロセスの自動化ステップ',
    href: '/automation-tool-requirement/',
    category: '要件定義',
    summary: 'ヒアリングから要件抽出まで、上流工程を自動化するための流れを解説します。',
    landingTitle: '要件整理の流れをチームで揃える',
    landingSummary: 'ヒアリングから要件抽出まで、上流工程の前提を整理する流れを解説します。',
  },
  {
    title: 'AI開発の見積もり費用はどう決まる？',
    href: '/cost-ai-develop-estimate/',
    category: 'AI開発費用',
    summary: 'AI導入の主な費用項目、規模別の変動要因、予算内で進めるポイントを確認できます。',
    featured: true,
  },
  {
    title: 'AI開発の相場とは？',
    href: '/market-price-ai-develop/',
    category: 'AI開発費用',
    summary: '見積もりに影響する開発手法や技術スタックによる相場の違いをまとめています。',
  },
  {
    title: 'AI開発の見積もりを自動化する仕組み',
    href: '/automation-ai-develop-estimate/',
    category: '見積支援',
    summary: 'AIによる見積もり算出のロジックと、意思決定を速くする使い方を解説します。',
    landingTitle: 'AI開発の見積支援を使う前に',
    landingSummary: 'AIを使った見積支援で、人間が確認すべき判断材料を整理します。',
  },
  {
    title: '見積もり自動化をAIで実現する役割分担',
    href: '/ai-estimate-automation/',
    category: '見積支援',
    summary: 'AIと人間がどこを担うべきか、見積もり作成の現実的な分担を整理します。',
    featured: true,
    landingTitle: 'AIと人間の見積レビュー分担',
    landingSummary: 'AIが整理する参考情報と、人間が判断する範囲を実務目線で整理します。',
  },
  {
    title: '見積もり作成を自動化するドキュメント構成',
    href: '/create-estimate-automation/',
    category: '見積支援',
    summary: '自動見積もりドキュメントの基本構成と、作成後の調整ポイントを紹介します。',
    landingTitle: '見積根拠メモのドキュメント構成',
    landingSummary: '提案前に確認しやすい見積根拠メモの基本構成と調整ポイントを紹介します。',
  },
  {
    title: '自動化ツールで出した見積もりの根拠',
    href: '/basis-estimate-automation/',
    category: '見積支援',
    summary: 'ツールが出した見積もりの妥当性を、根拠から見極める観点をまとめています。',
    landingTitle: '見積支援ツールの出力を根拠から見る',
    landingSummary: '参考見積の妥当性を、前提・相場・実績の観点から見極める考え方です。',
  },
  {
    title: '要件定義にAIを導入する理由と体制づくり',
    href: '/requirement-definition-ai/',
    category: '上流工程',
    summary: '開発の上流工程へAIを入れる前に整えるべき体制と品質管理を解説します。',
  },
  {
    title: '上流工程を効率化するAIツールの選定基準',
    href: '/tool-upstream-process-ai/',
    category: '上流工程',
    summary: '上流工程支援ツールの主要機能と、自社に合うAIツールの選び方を確認できます。',
  },
];

export const featuredColumnArticles = columnArticles.filter((article) => article.featured);
