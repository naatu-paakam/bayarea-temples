# Functional Specifications — Bay Area Temples Web App

**Version:** 1.0 — October 11, 2026
**Repo:** `naatu-paakam/bayarea-temples`
**Status:** Draft for review (spec-first; no code yet)

---

## 1. Purpose & Vision

Build a devotee-friendly web directory of Hindu temples in the San Francisco Bay Area (starting with the Tri-Valley and South/East Bay), modeled on the structure and experience of [templesofindia.org](https://templesofindia.org/), but scoped to a curated regional dataset.

**Primary goals**

1. Help devotees discover Bay Area temples — by name, deity, or city.
2. Serve festival-time planning (starting with Navarathri 2026): which temples run special poojas, when, and where.
3. Present each temple richly: photos, deities, timings, festivals, how to reach, community ratings.
4. Ship as a fast, mobile-friendly web app on the org's standard stack (Vite + React + TypeScript + Tailwind, hosted on Netlify) — single build, no database, no sign-in. The only server-side piece is a Netlify Function proxying LLM calls for natural-language search (same pattern as `keep-plants-alive`'s claude-proxy).
5. Security-first: no secrets in git, ever — `.env.example` + `.gitignore` from the first commit, server-side API keys only, automated test that no secret leaks into the HTML bundle.

---

## 2. Reference Analysis — templesofindia.org (what we studied)

A Next.js + Tailwind directory app claiming 600,000+ crowdsourced temples, with a WordPress-migrated blog. Findings that shape this spec:

### 2.1 Homepage (top to bottom)

| # | Section | Behavior |
|---|---------|----------|
| 1 | Sticky header | Logo, nav (Temples, Blog, About), Sign in button |
| 2 | Hero | Badge, large headline, subtext, prominent search bar (single field on home; Deity / City-State / Temple Name on directory), directory size claim |
| 3 | Photo carousel | Horizontally scrollable temple image strip |
| 4 | Featured Temples | Handpicked grid, "Explore all →" link |
| 5 | Trending Temples | Numbered 1–6 list, thumbnails, like counts ("most visited this week") |
| 6 | Browse by Deity | Pill chips: Balaji, Ganesha, Hanuman, Kartikeya, Krishna, Lakshmi, Murugan, Parvati, Rama, Shiva, Shirdi Sai, Vishnu |
| 7 | From the blog | Article cards: photo, category tag, read time, title, excerpt, author, date |
| 8 | About CTA card | Short pitch + "Learn more" |
| 9 | Footer | Tagline, Explore/Resources columns, copyright |

Design language: cream/near-white background, white rounded cards, dark slate-navy text, lime/chartreuse accent for CTAs and active filters, gold star ratings, green heart-like buttons. Mobile-first responsive.

### 2.2 Temple detail page

- **URL pattern:** `/temples/<slug>-<city>-<state>-<id>`
- **Hero:** photo mosaic gallery ("Show all N"), deity pill tag, H1 (name + city), location, star rating, Like button with count
- **Sticky tabs:** Overview | Rituals | Festivals | Gallery
  - Overview: special features, history (expandable), architecture, amenity chips, visit info (address, website, phone), collapsible "How to Reach"
  - Rituals: main + other deities (timings often unpopulated)
  - Festivals: placeholder when missing
  - Gallery: photo grid
- **Sidebar:** Visit Information card, Quick Actions (Get Directions, Suggest Edits, Plan Visit, Share Temple), contributor credits
- **Related Temples** carousel
- **Data quality varies widely** — sparse pages show "Image Currently Unavailable" / "Unknown" placeholders. Lesson: design graceful empty states from day one.

### 2.3 Directory / search (`/temples`)

- Three-field search: deity, location, temple name
- Filter chips: All / Featured / Popular / New (no sort control observed)
- 8-per-page card grid: image, name, city/state, like count; numbered pagination

### 2.4 Blog & community

- ~100 articles, category chips, search, pagination; article pages with likes, related tags, author bio, comments (sign-in required)
- Community: likes, Suggest Edits, Share Temple, Contribute → Google-OAuth sign-in, contributor profiles

### 2.5 What we build (single phase — no Phase 2, no database)

| templesofindia.org capability | How we build it |
|---|---|
| Homepage hero + search | ✅ — plus natural-language search via LLM (see §6.8) |
| Featured / trending sections | ✅ (trending = by review count) |
| Browse by deity chips | ✅ |
| Directory with filters + sort + pagination | ✅ (sort added — reference lacks it) |
| Temple detail pages with tabs | ✅ — each temple prerendered to its own HTML page with metadata tags (see §6.3) |
| Photo galleries | ✅ (curated images) |
| Get Directions / Share | ✅ (Maps links, Web Share API) |
| Graceful empty states | ✅ |
| Blog / knowledge hub | ✅ static, markdown-driven (no CMS) |
| Likes | ✅ localStorage, per-device (no account, no DB) |
| Suggest Edits / Contribute | ✅ Netlify Forms (no DB); `mailto:` fallback |
| Plan Visit trip planner | ✅ client-side itinerary builder, localStorage (no DB) |
| Comments / user accounts | ❌ out of scope (requires persistence) |

---

## 3. Personas

1. **Devotee visitor (primary):** Lives in the Bay Area, wants darshan timings, festival programs, and directions — especially during Navarathri, Diwali, etc.
2. **Festival planner:** "Which temples have Navarathri poojas this week?" Needs festival highlights and schedules at a glance.
3. **Newcomer / tourist:** Unfamiliar with the area; browses by deity or "most popular" and needs how-to-reach info.
4. **Contributor (Phase 2):** Devotee who wants to suggest edits, add photos, or submit a missing temple.

---

## 4. Site Map (single build)

```
/ (homepage)
  ├── /temples/            directory: natural-language + structured search, filters, sort, pagination
  ├── /temples/<slug>/     temple detail page — PRERENDERED to its own HTML file at build time,
  │                        each carrying full metadata tags (title, meta description, Open Graph,
  │                        JSON-LD) describing that temple
  ├── /deities/            browse-by-deity landing (chips link to filtered directory)
  ├── /festivals/          festival highlights (Navarathri 2026 first)
  ├── /blog/               static articles (markdown-driven, no CMS)
  ├── /blog/<slug>/        article page (prerendered)
  ├── /plan/               client-side visit planner (localStorage)
  └── /about/              about the project + data sources + contribute info
```

All routes prerender to static HTML from `src/data/temples.ts` (+ `src/data/articles/*.md`). Client-side routing takes over after load; `netlify.toml` carries the SPA fallback for deep links. No database anywhere.

---

## 5. Data Model — Temple Entity

```json
{
  "id": "shiva-vishnu-livermore",
  "name": "Shiva-Vishnu Temple",
  "city": "Livermore",
  "region": "Tri-Valley",
  "address": "1232 Arrowhead Ave, Livermore, CA 94551",
  "deities": ["Shiva", "Vishnu"],
  "tradition": "South Indian (Agamic)",
  "phone": "+1 ...",
  "website": "https://...",
  "hours": { "sunday": "9:00 AM – 8:00 PM", "...": "..." },
  "rating": 4.8,
  "reviewCount": 4800,
  "reviewSource": "Google",
  "reviewDate": "2026-10-11",
  "featured": true,
  "images": ["images/shiva-vishnu-livermore-1.jpg"],
  "history": "...",
  "architecture": "...",
  "amenities": ["Parking", "Prasadam", "..."],
  "festivals": [
    { "name": "Durga Pooja Celebrations", "dates": "Oct 11–20, 2026", "details": "..." }
  ],
  "howToReach": "...",
  "mapUrl": "https://maps.google.com/?q=...",
  "metaDescription": "Shiva-Vishnu Temple in Livermore, CA — 4.8★ (4,800 reviews). Durga Pooja Oct 11–20, 2026. Timings, festivals, directions.",
  "ogImage": "images/shiva-vishnu-livermore-1.jpg"
}
```

Per-temple SEO/metadata fields (`metaDescription`, `ogImage`) are required — every temple page is prerendered with them (see §6.3).

Fields unknown for a temple use explicit `null` and render the designed empty state — never blank gaps.

### 5.1 Seed dataset (14 temples, Oct 2026)

Ranked by review count: Shiva-Vishnu Temple Livermore (~4,800) · BAPS Milpitas (~1,040) · Shri Krishna Vrundavana San Jose (~850) · Fremont Hindu Temple (~694) · Shirdi Sai Parivaar Milpitas (~683) · Sri Satya Narayana Swamy Devasthanam Milpitas (~560) · Sunnyvale Hindu Temple (~400+) · Mandir Shreemaya Krishnadham San Jose (419) · Shiv Durga Temple Santa Clara (~250) · Balaji Matha Temple San Jose (138) · Shirdi Sai Darbar Sunnyvale (53) · Nithyanandeshwara Milpitas (49) · Sri Krishna Balaram Temple Sunnyvale · Vedanta Society SF.

---

## 6. Page Specifications

### 6.1 Homepage (`/`)

1. **Header (sticky):** logo/wordmark, nav (Temples, Festivals, Deities, About). No sign-in in Phase 1.
2. **Hero:** badge ("🪔 Navarathri 2026 — Oct 11–20"), H1, subtext, **natural-language search bar** — one field accepting plain prompts like "Shiva temples near Milpitas with Navratri poojas". The prompt goes to a Netlify Function that asks the LLM to classify it into structured filters (see §6.8); results open in `/temples/` with filters applied. Structured fields (deity / city) remain as an alternative.
3. **Festival spotlight strip (seasonal):** card(s) for the current festival with dates + "view participating temples".
4. **Featured Temples:** curated grid (6), each card: image, name, city, rating pill, review count, deity tags. "Explore all →".
5. **Most Reviewed (our "Trending"):** numbered 1–6 list with thumbnails and review counts. Ranked by `reviewCount`, recomputed at build time.
6. **Browse by Deity:** chips (Shiva, Vishnu, Krishna, Durga/Devi, Ganesha, Hanuman, Sai Baba, Murugan, Lakshmi, Rama, Balaji). Clicking filters the directory.
7. **About CTA card** + **Footer** (project blurb, data-source note, "compiled Oct 2026").

### 6.2 Directory (`/temples/`)

1. **Search:** three fields (name keyword, deity, city) + Search button; live filtering as the user types (no page reload).
2. **Filter chips:** All / Featured / Tri-Valley / South Bay / East Bay / SF & Peninsula.
3. **Sort dropdown:** Most reviewed (default) · Highest rated · Name A–Z. (The reference has no sort — we add it; it's the core of our ranking story.)
4. **Results grid:** cards with image, name, city, ★ rating, review count, deity tags, festival badge when applicable. 12 per page with pager.
5. **Empty state:** "No temples match — try clearing filters" with a reset button.
6. **Result count line:** "14 temples" updates with filters.

### 6.3 Temple detail (`/temples/<slug>/`) — one prerendered HTML page per temple

Each temple is prerendered at build time to its own HTML file (`/temples/<slug>/index.html`). Every page MUST carry metadata tags describing that temple:

- `<title>` — unique per temple (name + city + "Bay Area Hindu Temple")
- `<meta name="description">` — from `metaDescription`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- JSON-LD `HinduTemple`/`Place` schema with name, address, geo, rating, review count
- Canonical URL

Page content:

1. **Hero:** photo gallery (main + thumbnails; "Show all N" lightbox), deity pill tags, H1, city/region, ★ rating + review count + source/date note.
2. **Festival alert banner** (when a current/upcoming festival has events here): festival name, dates, key programs.
3. **Sticky tabs:** Overview | Festivals | Gallery | Visit.
   - **Overview:** about/history text, architecture notes, deity list, amenity chips.
   - **Festivals:** list of festivals with dates and program details; designed empty state ("Festival schedule not published yet — check the temple website.") when missing.
   - **Gallery:** all photos grid.
   - **Visit:** hours table, full address, phone, website link, embedded map / "Get Directions" button (Google Maps link).
4. **Quick actions:** Get Directions, Share (Web Share API with clipboard fallback), Like (heart, persisted in localStorage). Suggest Edits → Netlify Form (fields: temple id, field, suggested value, contact); `mailto:` fallback if forms unavailable.
5. **Related temples:** up to 3 cards — same deity first, then same region.
6. **Breadcrumb:** Home / Temples / <Name>. Prerender guarantees SEO without client JS (see scenarios R-01–R-04).

### 6.4 Deities (`/deities/`)

Grid of deity cards (name, count of temples). Each links to `/temples/?deity=<name>`.

### 6.5 Festivals (`/festivals/`)

1. **Current festival hero:** name, dates, description.
2. **Participating temples:** cards with their specific programs and timings.
3. **Past/annual festivals** list (Diwali, etc. — placeholder entries allowed with empty states).

### 6.6 About (`/about/`)

Project story, data sources (Google listings, temple websites), review-count methodology + date, "add a temple / suggest edit" contact, disclaimer that timings should be confirmed with temples.

### 6.7 Blog (`/blog/`, `/blog/<slug>/`) — static, markdown-driven

1. Articles live as markdown files in `src/data/articles/` with frontmatter (title, date, category, read time, cover image).
2. `/blog/`: search box + category chips (Festivals, Temple Guides, Rituals, Deities), article cards (photo, category badge, read time, title, excerpt, date), pagination.
3. `/blog/<slug>/`: prerendered HTML — hero image, rich body, related-tags, "Related articles" grid. No comments (out of scope).
4. Launch content: 3–5 seed articles (e.g. "Navarathri 2026 temple guide", "How the temples were ranked").

### 6.8 Natural-language search (LLM classification)

The search dialog accepts free-text prompts. Flow:

1. User submits a prompt, e.g. *"Shiva temples near Milpitas with Navratri poojas"*.
2. Client POSTs `{ prompt }` to `/.netlify/functions/search-classify` — **never** the LLM API directly.
3. The Netlify Function (same proxy pattern as `keep-plants-alive`'s `claude-proxy.js`) attaches the server-side API key and asks the LLM to return **only** a JSON filter object:
   ```json
   { "deities": ["Shiva"], "cities": ["Milpitas"], "regions": [],
     "festival": "Navarathri", "sort": "most-reviewed", "keywords": "" }
   ```
4. Client validates the JSON against the known schema (unknown values dropped), applies it to the local temple dataset, and navigates to `/temples/` with the filters shown as removable chips plus the original prompt quoted.
5. If the LLM call fails or returns invalid JSON, fall back to plain keyword matching on name/city/deities — search never hard-fails.

The LLM never invents temples: it only classifies into filters; results always come from the local dataset.

### 6.9 Plan visit (`/plan/`) — client-side, no DB

1. From any temple page, "Add to visit plan" stores the temple id in localStorage.
2. `/plan/` lists added temples, lets the visitor reorder them and attach a date; "Get directions" links chain into a Google Maps multi-stop URL.
3. Plan persists per-device in localStorage; "Clear plan" resets it.

---

## 7. Functional Scenarios

### Search & discovery

| ID | Scenario | Acceptance |
|----|----------|------------|
| S-01 | Visitor types "sai" in the homepage name field and submits | Directory opens pre-filtered to Shirdi Sai Parivaar + Shirdi Sai Darbar |
| S-02 | Visitor selects deity chip "Krishna" | Directory shows only temples with Krishna in `deities` |
| S-03 | Visitor types a city, e.g. "Milpitas" | Directory shows the 4 Milpitas temples |
| S-04 | Combined: deity "Shiva" + region "Tri-Valley" | Shows matching subset; result count updates |
| S-05 | Search with no matches ("xyz") | Empty state with reset button appears; no broken layout |
| S-06 | Visitor changes sort to "Highest rated" | Cards reorder by rating (review-count tiebreak) |
| S-07 | Visitor goes to page 2 of results | Pagination preserves active filters/sort in URL |

### Temple detail

| ID | Scenario | Acceptance |
|----|----------|------------|
| T-01 | Visitor opens a temple page | Hero, rating, tabs, quick actions all render; no missing-image icons (placeholder art instead) |
| T-02 | Visitor clicks Festivals tab during Navarathri | Livermore page lists Durga Pooja Oct 11–20 programs |
| T-03 | Temple with no festival data | Designed empty state, no empty tab content |
| T-04 | Visitor clicks "Get Directions" | Opens Google Maps with the temple address in a new tab |
| T-05 | Visitor clicks Share | Native share sheet on mobile; copies link on desktop |
| T-06 | Visitor clicks a Related temple | Navigates to that temple's page |
| T-07 | Visitor clicks gallery "Show all" | Lightbox opens; Esc/arrows navigate; focus trapped |

### Festival flows

| ID | Scenario | Acceptance |
|----|----------|------------|
| F-01 | Visitor opens homepage during Navarathri | Festival spotlight banner visible with dates |
| F-02 | Visitor opens /festivals/ | Sees participating temples with per-temple programs |
| F-03 | No active festival | Homepage spotlight hidden; /festivals/ shows "next festival" placeholder |

### Navigation & robustness

| ID | Scenario | Acceptance |
|----|----------|------------|
| N-01 | Visitor opens any page on a 360px-wide phone | Single-column layout, no horizontal scroll, tap targets ≥ 44px |
| N-02 | Visitor opens with images disabled / slow network | Alt text + placeholders; layout doesn't collapse |
| N-03 | Visitor uses keyboard only | All interactive elements reachable, visible focus, lightbox Esc works |
| N-04 | Search engines crawl the site | Each temple page has unique title/meta + JSON-LD; sitemap.xml lists all pages |
| N-05 | Data update | Editing `src/data/temples.ts` and rebuilding regenerates all pages consistently |

### Phase 2 — removed (single-build scope per 2026-10-11 decision)

All previously deferred items are now specified above: static blog (§6.7), localStorage likes (§6.3), Netlify Forms suggest-edits (§6.3), client-side plan visit (§6.9). Only comments and user accounts remain out of scope (§9).

### LLM search scenarios

| ID | Scenario | Acceptance |
|----|----------|------------|
| L-01 | Visitor submits "Shiva temples near Milpitas with Navratri poojas" | Function returns filter JSON; directory shows matching temples with filter chips + quoted prompt |
| L-02 | Visitor submits gibberish / unclassifiable prompt | Falls back to keyword matching; results or designed empty state, never an error screen |
| L-03 | LLM function is down or returns invalid JSON | Keyword fallback engages; search still works |
| L-04 | Visitor removes a filter chip after LLM search | Results update; URL reflects current filters |

### Prerender / SEO scenarios

| ID | Scenario | Acceptance |
|----|----------|------------|
| R-01 | Build runs | `/temples/<slug>/index.html` exists for all 14 temples, each with unique title, meta description, OG tags, JSON-LD |
| R-02 | `curl` a temple page (no JS) | Full title, description, and temple name present in raw HTML |
| R-03 | sitemap.xml | Lists homepage, directory, all temple pages, blog index + articles |
| R-04 | Social share of a temple URL | Unfurl shows temple name, description, and og:image |

### Security scenarios

| ID | Scenario | Acceptance |
|----|----------|------------|
| SEC-01 | Fresh clone, `git log -p -- .env*` | No `.env.local` or secret ever committed; only `.env.example` with placeholders |
| SEC-02 | Built bundle inspection | No `ANTHROPIC_API_KEY` (or any secret) string in emitted JS/HTML — covered by a Playwright test (`no-secret-in-bundle.spec.ts`) |
| SEC-03 | LLM API key storage | Key lives in `.env.local` (gitignored) locally and Netlify dashboard in prod; never `VITE_`-prefixed; only the Netlify Function reads it |
| SEC-04 | Search function abuse | Function validates prompt length (≤ 500 chars) and rate-limits per IP; rejects non-JSON-smuggling payloads |

---

## 8. Non-Functional Requirements & Tech Stack

**Stack (same as `keep-plants-alive`, the org standard):** Vite + React + TypeScript + Tailwind CSS, deployed on Netlify (`netlify.toml` with SPA fallback redirect + functions config). E2E tests with Playwright. No database.

**Project layout (mirrors keep-plants-alive):**
```
bayarea-temples/
├── client/src/
│   ├── pages/          Home, Temples, TempleDetail, Deities, Festivals, Blog, Article, Plan, About
│   ├── components/     SearchBar, TempleCard, FilterChips, SortDropdown, Gallery, Lightbox, ...
│   ├── data/temples.ts temple dataset (single source of truth)
│   ├── data/articles/  markdown articles with frontmatter
│   └── services/search.ts  calls /.netlify/functions/search-classify
├── netlify/functions/
│   └── search-classify.js  LLM proxy: prompt → filter JSON (server-side key only)
├── e2e/                Playwright specs (incl. no-secret-in-bundle)
├── design/
│   └── functional-specs.md
├── .env.example        placeholder keys only
├── .gitignore          .env.local, .notes, dist, node_modules
└── netlify.toml
```

1. **Security (first priority):** no secrets in git from the first commit — `.env.example` with placeholders, `.env.local` gitignored; LLM key only in Netlify dashboard + local `.env.local`, never `VITE_`-prefixed, only read by the Netlify Function; Playwright test asserts no secret strings in built output; function validates input length and rate-limits.
2. **Hosting:** Netlify; `npm run build` output deployed automatically from `main`.
3. **Prerendering:** build script emits one HTML file per temple (and per article) with full metadata tags; app hydrates client-side after load.
4. **Performance:** homepage < 1.5s first paint on 4G; images lazy-loaded and compressed; code-split per route.
5. **Responsive:** mobile-first; breakpoints at 640px and 1024px.
6. **Accessibility:** semantic HTML, alt text, color contrast AA, keyboard navigable.
7. **Data freshness:** review counts re-verified manually; each temple page shows source + observation date.
8. **Data-driven:** all content renders from `src/data/temples.ts`; adding a temple = adding one object, no hand-edited pages.

---

## 9. Out of Scope

User accounts, comments, multi-language UI, push notifications, native apps. (Comments need persistence — excluded with the no-DB principle.)

---

## 10. Open Questions

1. Photo sourcing: use temple website/Facebook photos (with credit), Wikimedia Commons, or placeholders until we photograph?
2. Should the festival section auto-highlight based on today's date, or be manually curated per festival?
3. Include churches/gurdwaras later, or keep this strictly Hindu temples?
4. Domain: keep on the Netlify URL or map a `naatupaakam.com` subdomain later?
5. LLM choice for search-classify: Claude (org already uses it) vs. a cheaper model — classification is a small task.
6. Seed blog articles: which 3–5 titles go in at launch?
