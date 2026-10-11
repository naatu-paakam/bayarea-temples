# Bay Area Temples

**Status:** Pilot — 14 temples, single build
**Type:** Temple directory web app (templesofindia.org-style, Bay Area scoped)
**Stack:** Vite + React + TypeScript + Tailwind + Netlify Functions (no database)

## What This Is

A devotee-built directory of Hindu temples across the San Francisco Bay Area —
ranked by public review counts, with per-temple detail pages (deities, hours,
festivals, directions), natural-language search, a festival guide, a small blog,
and a client-side visit planner.

## Local Dev

```
# 1. Install dependencies
npm install

# 2. (Optional, for LLM search) create .env.local — gitignored, never commit
echo "ANTHROPIC_API_KEY=your-key" > .env.local

# 3. Start the dev server (UI only; the search function needs netlify dev)
npm run dev          # → http://localhost:5180

# Full local run with Netlify Functions:
npm run netlify:dev  # → http://localhost:8888
```

Without an API key, natural-language search gracefully falls back to keyword
matching — the app never hard-fails.

## Project Structure

```
bayarea-temples/
├── client/src/
│   ├── pages/            Home, Temples, TempleDetail, Deities, Festivals, Blog, Article, Plan, About
│   ├── components/       Layout, TempleCard, SearchBar, Stars
│   ├── data/
│   │   ├── temples.json  Single source of truth — all temple metadata
│   │   ├── temples.ts    Types + helpers (imports temples.json)
│   │   ├── articles.json Seed blog articles
│   │   └── articles.ts   Types + helpers
│   └── services/search.ts  LLM-classify call + keyword fallback + filter engine
├── netlify/functions/
│   ├── search-classify.js  Prompt → filter JSON (server-side key only)
│   └── temples-meta.json   GENERATED at build time — compact metadata the LLM classifies against
├── scripts/
│   ├── generate-function-meta.mjs  temples.json → netlify/functions/temples-meta.json
│   └── prerender.mjs               dist → per-temple HTML pages + sitemap.xml
├── e2e/                  Playwright tests TC-001 … TC-013
├── design/
│   └── functional-specs.md
├── .env.example          Placeholder keys only — copy to .env.local
└── netlify.toml          Build + SPA fallback redirect
```

## Metadata Design

Temple metadata lives in the repo as structured data (`client/src/data/temples.json`).
At build time it fans out to two consumers:

1. **LLM search** — `scripts/generate-function-meta.mjs` compiles a compact
   `netlify/functions/temples-meta.json` that `search-classify.js` passes to the
   LLM, so prompts are classified against REAL deities/cities/festivals. The LLM
   can never invent temples; the client re-validates the filter JSON.
2. **SEO** — `scripts/prerender.mjs` emits one HTML page per temple
   (`/temples/<slug>/`) carrying title, meta description, Open Graph and JSON-LD
   tags, plus `sitemap.xml`.

## Security Model

| Key | Where it lives | Who sees it |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `.env.local` locally, Netlify dashboard in prod | Server only (Netlify Function) |
| Never in browser bundle | No `VITE_` prefix on purpose | — |

`e2e/security.spec.ts` (TC-013) fails the suite if any secret string appears in
built output. The function validates prompt length (≤ 500 chars) and only
accepts POST.

## Netlify Deployment

```
# Env var to set in Netlify dashboard (Site config → Environment variables):
ANTHROPIC_API_KEY=<key>
# Never put this in netlify.toml or any committed file.
```

Build command: `npm run build` · Publish directory: `dist` · Functions: `netlify/functions`

## Running Tests

```
npx playwright install chromium   # first time only
npm run test:e2e                   # all tests (starts vite automatically)
```

Tests cover TC-001…TC-013: homepage, search navigation, filters/sort, deity
deep-links, temple detail tabs, likes persistence, not-found states, empty-state
fallbacks, visit planner, blog, festivals, and the no-secret-in-bundle check.
