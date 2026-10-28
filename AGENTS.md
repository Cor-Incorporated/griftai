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
- Legal: `/privacy` `/terms`
- Grift stories (fictional): `/column/<id>/` from `src/content/stories/*.md` (linked from the top page's 課題 cards; always shown as 架空の物語)
- GMO SEO columns: `/column` + 10 keyword pages (`ai-estimate-automation`, `ai-tool-requirement-definition`, `automation-ai-develop-estimate`, `automation-tool-requirement`, `basis-estimate-automation`, `cost-ai-develop-estimate`, `create-estimate-automation`, `market-price-ai-develop`, `requirement-definition-ai`, `tool-upstream-process-ai`)
- Machine-readable: `/robots.txt` `/llms.txt` `/sitemap-index.xml`
- Error pages: `403` `404` `500`

**Key directories**:
- `src/config/` — Centralized site config (site metadata, navigation, features, contact, content strings). Import from `@/config`.
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
- Japanese text and the CEO's voice: when you write or edit Japanese text (pages, components, config strings, stories, llms.txt, PR descriptions, commit messages), follow `.claude/skills/yomiyasu/SKILL.md` (nanaism/yomiyasu v2.1.3, MIT, vendored unchanged) and `.claude/skills/cor-voice/SKILL.md` (register and the CEO's (寺田康佑) way of writing), and pass `run` and `verify` of `python3 -I .claude/skills/yomiyasu/scripts/yomiyasu_check.py`. Not needed for reports after code changes. Keep `.claude/skills/cor-voice/` identical to the copy in Cor-Incorporated/corsweb2024. For the GMO column pages, keep the keyword phrases in titles and headings.
- Article pages (GMO columns, `/column/<id>/` stories) end with `ArticleAuthor` (the author 寺田康佑 and a short company profile; facts in `src/config/author.ts`, mirrored from cor-jp.com) and `DocumentDownload` (the Grift CLI deck PDF in `public/downloads/`, described in `src/config/documents.ts`; downloadable without a form, decided at the 2026-10-20 GMO meeting). GMO columns start with `KeyPoints` (the card summary from `src/config/columns.ts`). The Article JSON-LD author is the founder Person with the same `@id` as on cor-jp.com.
- Wording: call the agency trial 「テスト導入（PoC）」 and its CTA 「自社でテストしてみる」 (header: 「テストしてみる」); do not use 「試行」 (ADR-0005).
- Links to the articles on Grift's philosophy (Qiita / note) live in `griftArticles` in `src/config/site.ts`.
- Pricing: Grift CLI is free (MIT); the agency trial is "個別案内". Do not publish plan prices until the official price is decided (ADR-0005).
- Sitemap is filtered to an allowlist of published pages (configured in `astro.config.mjs`).
- Grift CLI facts (version, release date, license, links) come from `griftCli` in `src/config/site.ts`; keep them in sync with PyPI / Cor-Incorporated/grift-cli.
- Plain words for non-engineers: what Grift CLI counts, the numbers fixed by the CLI (`tepFacts`), and the glossary (plain wording ↔ site term ↔ CLI name) live in `src/config/tep.ts`, read by `/tep`, the top page's ProductShowcase, the FAQ, llms.txt and the structured data. CLI key names (snake_case keys and versioned output names such as `report-v2`; the rule is in `scripts/lib/cli-key-names.mjs`) go only in the `cli` / `cliNote` values of that file. English metric names and commands may still appear as the original term in parentheses. `npm run check:terms` (`scripts/check-plain-terms.mjs`) checks the source (pages, components, layouts, config including the rest of `tep.ts`, stories), and the e2e smoke test checks every page in the sitemap except `/tep/`.
- Icons use `astro-icon` with `@iconify-json/lucide` and `@iconify-json/simple-icons`.
- ESLint flat config (`eslint.config.mjs`): recommended + astro plugin + typescript-eslint + prettier.
