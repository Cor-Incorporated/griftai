# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japanese-first Astro landing site for **Grift** (`griftai.org`). Built on the Virex template, stripped down to a focused marketing site for Cor.inc's Grift: an OSS CLI (`grift-cli`, MIT) that extracts verifiable facts from engineers' git history (no LLM, no scores), plus a trial (PoC) for recruiting/SES agencies. Positioning since 2026-10: ADR-0005 (the former AI-estimation web app and Team Beta plans were withdrawn). Content and copy target the Japanese market.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run check        # Lint + format check + astro check (CI gate)
npm run lint         # ESLint only
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check only
```

CI runs `npm run check` then `npm run build` on every PR and push. Both must pass.

## Architecture

**Stack**: Astro 5 (SSG) + Tailwind CSS v4 (via `@tailwindcss/vite`) + TypeScript (strict) + MDX

**Published pages** (everything else is template scaffolding, not live):
- Marketing: `/` `/pricing` `/faq` `/contact` (`/team-beta` and `/estimate-audit` were removed; `public/_redirects` sends them to `/` with 301)
- Legal: `/privacy` `/terms`
- GMO SEO columns: `/column` + 10 keyword pages (`ai-estimate-automation`, `ai-tool-requirement-definition`, `automation-ai-develop-estimate`, `automation-tool-requirement`, `basis-estimate-automation`, `cost-ai-develop-estimate`, `create-estimate-automation`, `market-price-ai-develop`, `requirement-definition-ai`, `tool-upstream-process-ai`)
- Machine-readable: `/robots.txt` `/llms.txt` `/sitemap-index.xml`
- Error pages: `403` `404` `500`

**Key directories**:
- `src/config/` — Centralized site config (site metadata, navigation, features, contact, content strings). Import from `@/config`.
- `src/lib/types.ts` — Shared TypeScript types for all config and data structures.
- `src/layouts/` — `MarketingLayout` is the primary layout for public pages.
- `src/components/sections/marketing/` — Landing page sections (Hero, CTA, Features, HowItWorks, etc.).
- `src/content/` — Astro Content Collections (blog, docs, changelog, testimonials). Schema defined in `src/content.config.ts`.
- `planning/blueprint-docs/` — Design docs: persona, positioning, content strategy, beta launch decisions, legal drafts.

**Path aliases** (tsconfig.json):
- `@/*` → `src/*`
- `@components/*`, `@sections/*`, `@ui/*`, `@forms/*`, `@layout/*`, `@dashboard/*`, `@dashboard-ui/*`

**Config pattern**: Individual config files (`site.ts`, `navigation.ts`, `features.ts`, `content.ts`, `contact.ts`) are merged into a single `siteConfig` object in `src/config/index.ts`.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):
- **quality** job: `npm run check` + `npm run build` on all PRs and pushes
- **deploy** job: Cloudflare Pages via Wrangler, only on `main` push when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set
- Node 20, project name: `griftai`

## Key Conventions

- All public-facing copy is Japanese. CTA links point to `https://cor-jp.com/contact/chat`.
- Wording: call the agency trial 「テスト導入（PoC）」 and its CTA 「自社でテストしてみる」 (header: 「テストしてみる」); do not use 「試行」 (ADR-0005).
- Links to the articles on Grift's philosophy (Qiita / note) live in `griftArticles` in `src/config/site.ts`.
- Pricing: Grift CLI is free (MIT); the agency trial is "個別案内". Do not publish plan prices until the official price is decided (ADR-0005).
- Sitemap is filtered to an allowlist of published pages (configured in `astro.config.mjs`).
- Grift CLI facts (version, release date, license, links) come from `griftCli` in `src/config/site.ts`; keep them in sync with PyPI / Cor-Incorporated/grift-cli.
- Icons use `astro-icon` with `@iconify-json/lucide` and `@iconify-json/simple-icons`.
- ESLint flat config (`eslint.config.mjs`): recommended + astro plugin + typescript-eslint + prettier.
