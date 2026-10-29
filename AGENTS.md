# AGENTS.md

This file provides guidance to Codex, OpenCode, Pi, dsh and similar agents when working with code in this repository.

## Project Overview

Japanese-first Astro landing site for **Grift** (`griftai.org`). Built on the Virex template, stripped down to a focused marketing site for Cor.inc's Grift: an OSS CLI (`grift-cli`, MIT) that extracts verifiable facts from engineers' git history (no LLM, no scores), plus a trial (PoC) for recruiting/SES agencies and in-house hiring teams at companies that build their own software (ADR-0005 revision 2026-10-26). Positioning since 2026-10: ADR-0005 (the former AI-estimation web app and Team Beta plans were withdrawn). Content and copy target the Japanese market.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run check        # Lint + format check + astro check + check:cta + check:metrics + check:terms (CI gate)
npm run lint         # ESLint only
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check only
npm run check:cta    # No hard-coded Cor contact URLs outside the CTA builder (scripts/check-cta-hardcode.mjs)
npm run check:metrics # No unvalidated marketing metrics in public copy (scripts/check-forbidden-metrics.mjs)
npm run check:terms  # Plain words for non-engineers (scripts/check-plain-terms.mjs, see Key Conventions)
npm run test:unit    # Vitest
npm run test:e2e     # Playwright smoke test (e2e/smoke.spec.ts); run after a build
npm run test:e2e:a11y # Playwright accessibility test (e2e/a11y.spec.ts)
npm run test         # test:unit + build + test:e2e
```

CI runs `npm run check`, `npm run test:unit`, `npm run build` and the Playwright smoke test on every PR and on pushes to `main`, `feat/**`, `fix/**` and `chore/**` (see CI/CD). They must pass.

## Architecture

**Stack**: Astro 5 (SSG) + Tailwind CSS v4 (via `@tailwindcss/vite`) + TypeScript (strict) + MDX

**Published pages** (everything else is template scaffolding, not live):
- Marketing: `/` `/tep` `/pricing` `/faq` `/contact` (`/team-beta` and `/estimate-audit` were removed; `public/_redirects` sends them to `/` with 301). `/tep` explains TEP (the method behind Grift) for non-engineer readers
- Articles and news (Sveltia CMS, ADR-0007): `/articles` `/articles/<slug>` `/news` `/news/<slug>` from `src/content/articles` and `src/content/news`. Drafts (`isDraft: true`) are not published. The admin UI is `cms/` on a separate origin and is not deployed yet (`docs/cms.md`)
- Legal: `/privacy` `/terms`
- Grift stories (fictional): `/column/<id>/` from `src/content/stories/*.md` (linked from the top page's 課題 cards; always shown as 架空の物語)
- GMO SEO columns: `/column` + 10 keyword pages (`ai-estimate-automation`, `ai-tool-requirement-definition`, `automation-ai-develop-estimate`, `automation-tool-requirement`, `basis-estimate-automation`, `cost-ai-develop-estimate`, `create-estimate-automation`, `market-price-ai-develop`, `requirement-definition-ai`, `tool-upstream-process-ai`)
- Machine-readable: `/robots.txt` `/llms.txt` `/sitemap-index.xml`
- Error pages: `403` `404` `500`

**Key directories**:
- `src/config/` — Centralized site config (site metadata, navigation, features, contact, content strings). Import from `@/config`. Article and news CMS fields: `cms-contract.ts` (source) and `cms-schema.ts` (Zod).
- `cms/` — Sveltia CMS admin (separate Vite build, not served from griftai.org). `workers/sveltia-cms-auth/` — GitHub OAuth broker. See `docs/cms.md` and ADR-0007.
- `src/lib/types.ts` — Shared TypeScript types for all config and data structures.
- `src/layouts/` — `MarketingLayout` is the primary layout for public pages.
- `src/components/sections/marketing/` — Landing page sections (Hero, CTA, Features, HowItWorks, etc.).
- `src/content/` — Astro Content Collections, schema in `src/content.config.ts`. Only `stories` is read by published pages; `blog`, `docs`, `changelog` and `testimonials` are Virex leftovers (issue #32).
- `docs/adr/` — Decisions (index: `docs/adr/README.md`). ADR-0005 and ADR-0006 hold the current positioning and first view; ADR-0001 and ADR-0003 (Team Beta) are superseded.
- `planning/blueprint-docs/` and `docs/lp-storytelling-research.md` — Historical (2026-03): written for the withdrawn AI-estimation web app and Grift Beta, including plan prices. Do not take copy, prices or features from them. `docs/01`–`09` describe the Virex template.

**Path aliases** (tsconfig.json):
- `@/*` → `src/*`
- `@components/*`, `@sections/*`, `@ui/*`, `@forms/*`, `@layout/*`, `@dashboard/*`, `@dashboard-ui/*`

**Config pattern**: Individual config files (`site.ts`, `navigation.ts`, `features.ts`, `content.ts`, `contact.ts`) are merged into a single `siteConfig` object in `src/config/index.ts`.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`), on every PR and on pushes to `main`, `feat/**`, `fix/**` and `chore/**`:
- **quality** job: `npm run check` + `npm run test:unit` + `npm run build`
- **e2e-smoke** job: Playwright smoke test against the built site (`npm run test:e2e`)
- **a11y** job: Playwright accessibility test, non-blocking (`continue-on-error`)
- **deploy_gate** + **deploy** jobs: Cloudflare Pages via Wrangler, only on a `main` push after quality and e2e-smoke pass, and only when the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set. They are not set, so the deploy job is skipped (checked 2026-10-27, run 40422259042)
- Production and PR previews are actually deployed by the Cloudflare Pages Git integration (project `griftai`; the "Cloudflare Pages" check on each commit and PR), not by this workflow
- Node 20, project name: `griftai`

Open PRs against `main`; merging to `main` deploys production.

## Key Conventions

- All public-facing copy is Japanese. CTA links point to `https://cor-jp.com/contact/chat`.
- Japanese text and the CEO's voice: when you write or edit Japanese text (pages, components, config strings, stories, llms.txt, PR descriptions, commit messages), follow `.claude/skills/yomiyasu/SKILL.md` (nanaism/yomiyasu v2.1.3, MIT; scripts and body vendored unchanged, Cor.-specific sections appended at the end of SKILL.md) and `.claude/skills/cor-voice/SKILL.md` (register and the CEO's (寺田康佑) way of writing), and pass `run` and `verify` of `python3 -I .claude/skills/yomiyasu/scripts/yomiyasu_check.py`. Not needed for reports after code changes. Keep `.claude/skills/cor-voice/` identical to the copy in Cor-Incorporated/corsweb2024. For the GMO column pages, keep the keyword phrases in titles and headings.
- Article pages (GMO columns, `/column/<id>/` stories) end with `ArticleAuthor` (the author 寺田康佑 and a short company profile; facts in `src/config/author.ts`, mirrored from cor-jp.com) and `DocumentDownload` (the Grift CLI deck PDF in `public/downloads/`, described in `src/config/documents.ts`; downloadable without a form, decided at the 2026-10-20 GMO meeting). GMO columns start with `KeyPoints` (the card summary from `src/config/columns.ts`). The Article JSON-LD author is the founder Person with the same `@id` as on cor-jp.com.
- Wording: call the agency trial 「テスト導入（PoC）」 and its CTA 「自社でテストしてみる」 (header: 「テストしてみる」); do not use 「試行」 (ADR-0005).
- Links to the articles on Grift's philosophy (Qiita / note) live in `griftArticles` in `src/config/site.ts`.
- Pricing: Grift CLI is free (MIT); the agency trial is "個別案内". Do not publish plan prices until the official price is decided (ADR-0005).
- Sitemap is filtered to an allowlist of published pages (configured in `astro.config.mjs`).
- Grift CLI facts (version, release date, license, links) come from `griftCli` in `src/config/site.ts`; keep them in sync with PyPI / Cor-Incorporated/grift-cli.
- Plain words for non-engineers: what Grift CLI counts, the numbers fixed by the CLI (`tepFacts`), and the glossary (plain wording ↔ site term ↔ CLI name) live in `src/config/tep.ts`, read by `/tep`, the top page's ProductShowcase, the FAQ, llms.txt and the structured data. CLI key names (snake_case keys and versioned output names such as `report-v2`; the rule is in `scripts/lib/cli-key-names.mjs`) go only in the `cli` / `cliNote` values of that file. English metric names and commands may still appear as the original term in parentheses. `npm run check:terms` (`scripts/check-plain-terms.mjs`) checks the source (pages, components, layouts, config including the rest of `tep.ts`, stories), and the e2e smoke test checks every page in the sitemap except `/tep/`.
- Icons use `astro-icon` with `@iconify-json/lucide` and `@iconify-json/simple-icons`.
- ESLint flat config (`eslint.config.mjs`): recommended + astro plugin + typescript-eslint + prettier.

## Japanese outbound text in any harness (generated)

Codex, OpenCode, Pi, dsh and Grok read this section from AGENTS.md, Claude Code from CLAUDE.md, and Cursor the same text from `.cursor/rules/cor-voice.mdc`.

<!-- BEGIN cor-voice harness entry (generated from .claude/skills/cor-voice-gate/references/harness-entry.md by .claude/skills/cor-voice-gate/scripts/render_harness_entries.py; edit the source and run --write) -->
日本語の対外文（記事、ニュース、SNS、顧客・候補者・取引先へのメールと返信、提案、社内の手順書と説明、PR の説明）を書くとき・直すときの手順です。規則の本文は次の 3 つのスキルにあり、ここには写しません。

1. 書く前に `.claude/skills/cor-voice/SKILL.md` の 1〜6 章（6A を含む）を読みます。推敲の規則と検査は `.claude/skills/yomiyasu/SKILL.md`、公開・送信の前のゲートは `.claude/skills/cor-voice-gate/SKILL.md` です。
2. cor-voice の 2 章で場面（会社として、代表の名前で、技術の記事、メールと返信）を選び、yomiyasu の文書の種類（記事は article、メールは mail、手順書は manual、LP と告知は promo）を決めます。
3. 依頼と資料にない事実は足しません。数字、日付、期間、社名と顧客名、価格、実績、人の発言、依頼に無い frontmatter の項目がこれに当たります。足りない値は本文で作らず、本文の外に「確かめたい点」として書きます。
4. 下書きをファイルに保存し、次の 3 つを通します。候補が出たら直して、もう一度通します。
   - `python3 -I .claude/skills/cor-voice-gate/scripts/cor_voice_lint.py check --scene <company|founder|tech|mail> <下書き>`
   - `python3 -I .claude/skills/yomiyasu/scripts/yomiyasu_check.py run --material <依頼と資料> --final <下書き> --doc-type <種類> --fact-gaps`（直す前の原文があれば `--source <原文>` も付けます）
   - `python3 -I .claude/skills/yomiyasu/scripts/yomiyasu_check.py verify --final <下書き>`
5. 公開、送信、投稿、push はしません。返すのは、仕上げた本文と確かめたい点です。本文はファイルにも残し、最後の返答に本文とそのパスを書きます。作業の報告や検査の記録を本文に混ぜません。
<!-- END cor-voice harness entry -->
