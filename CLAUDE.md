# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japanese-first Astro landing site for **Grift Beta** (`griftai.org`). Built on the Virex template, stripped down to a focused marketing site for Cor.inc's AI estimation product. Content and copy target the Japanese market.

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
- `/` `/pricing` `/faq` `/contact` `/privacy` `/terms`
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
- Pricing is labeled as Beta pricing, not final.
- Sitemap is filtered to only the 6 published pages (configured in `astro.config.mjs`).
- Icons use `astro-icon` with `@iconify-json/lucide` and `@iconify-json/simple-icons`.
- ESLint flat config (`eslint.config.mjs`): recommended + astro plugin + typescript-eslint + prettier.
