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
4. Ship as a fast, mobile-friendly web app on the org's standard stack (Vite + React + TypeScript + Tailwind, hosted on Netlify) — no backend, no sign-in in Phase 1.

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

### 2.5 What we adopt vs. defer

| templesofindia.org capability | Phase 1 (static) | Phase 2 (needs backend) |
|---|---|---|
| Homepage hero + search | ✅ | |
| Featured / trending sections | ✅ (trending = by review count) | |
| Browse by deity chips | ✅ | |
| Directory with filters + sort + pagination | ✅ (sort added — reference lacks it) | |
| Temple detail pages with tabs | ✅ | |
| Photo galleries | ✅ (curated images) | |
| Get Directions / Share | ✅ (Maps links, Web Share API) | |
| Graceful empty states | ✅ | |
| Blog / knowledge hub | | ✅ |
| Likes, comments | | ✅ |
| Suggest Edits / Contribute / sign-in | | ✅ (Phase 1: `mailto:` fallback) |
| Plan Visit trip planner | | ✅ |

---

## 3. Personas

1. **Devotee visitor (primary):** Lives in the Bay Area, wants darshan timings, festival programs, and directions — especially during Navarathri, Diwali, etc.
2. **Festival planner:** "Which temples have Navarathri poojas this week?" Needs festival highlights and schedules at a glance.
3. **Newcomer / tourist:** Unfamiliar with the area; browses by deity or "most popular" and needs how-to-reach info.
4. **Contributor (Phase 2):** Devotee who wants to suggest edits, add photos, or submit a missing temple.

---

## 4. Site Map (Phase 1)

```
/ (homepage)
  ├── /temples/            directory: search + filters + sort + pagination
  ├── /temples/<slug>/     temple detail page (one per temple)
  ├── /deities/            browse-by-deity landing (chips link to filtered directory)
  ├── /festivals/          festival highlights (Navarathri 2026 first)
  └── /about/              about the project + data sources + contribute info
```

All pages are React routes (client-side routing with a Netlify SPA fallback redirect) driven by a single dataset (`src/data/temples.ts`, replacing the earlier `data/temples.json` idea).

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
  "mapUrl": "https://maps.google.com/?q=..."
}
```

Fields unknown for a temple use explicit `null` and render the designed empty state — never blank gaps.

### 5.1 Seed dataset (14 temples, Oct 2026)

Ranked by review count: Shiva-Vishnu Temple Livermore (~4,800) · BAPS Milpitas (~1,040) · Shri Krishna Vrundavana San Jose (~850) · Fremont Hindu Temple (~694) · Shirdi Sai Parivaar Milpitas (~683) · Sri Satya Narayana Swamy Devasthanam Milpitas (~560) · Sunnyvale Hindu Temple (~400+) · Mandir Shreemaya Krishnadham San Jose (419) · Shiv Durga Temple Santa Clara (~250) · Balaji Matha Temple San Jose (138) · Shirdi Sai Darbar Sunnyvale (53) · Nithyanandeshwara Milpitas (49) · Sri Krishna Balaram Temple Sunnyvale · Vedanta Society SF.

---

## 6. Page Specifications

### 6.1 Homepage (`/`)

1. **Header (sticky):** logo/wordmark, nav (Temples, Festivals, Deities, About). No sign-in in Phase 1.
2. **Hero:** badge ("🪔 Navarathri 2026 — Oct 11–20"), H1, subtext, search bar (fields: temple name keyword; deity; city). Submitting goes to `/temples/` with query params.
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

### 6.3 Temple detail (`/temples/<slug>/`)

1. **Hero:** photo gallery (main + thumbnails; "Show all N" lightbox), deity pill tags, H1, city/region, ★ rating + review count + source/date note.
2. **Festival alert banner** (when a current/upcoming festival has events here): festival name, dates, key programs.
3. **Sticky tabs:** Overview | Festivals | Gallery | Visit.
   - **Overview:** about/history text, architecture notes, deity list, amenity chips.
   - **Festivals:** list of festivals with dates and program details; designed empty state ("Festival schedule not published yet — check the temple website.") when missing.
   - **Gallery:** all photos grid.
   - **Visit:** hours table, full address, phone, website link, embedded map / "Get Directions" button (Google Maps link).
4. **Quick actions:** Get Directions, Share (Web Share API with clipboard fallback). Suggest Edits → `mailto:` with prefilled temple id (Phase 2: form).
5. **Related temples:** up to 3 cards — same deity first, then same region.
6. **Breadcrumb:** Home / Temples / <Name>. SEO: unique `<title>`, meta description, JSON-LD (`HinduTemple`/`Place` schema).

### 6.4 Deities (`/deities/`)

Grid of deity cards (name, count of temples). Each links to `/temples/?deity=<name>`.

### 6.5 Festivals (`/festivals/`)

1. **Current festival hero:** name, dates, description.
2. **Participating temples:** cards with their specific programs and timings.
3. **Past/annual festivals** list (Diwali, etc. — placeholder entries allowed with empty states).

### 6.6 About (`/about/`)

Project story, data sources (Google listings, temple websites), review-count methodology + date, "add a temple / suggest edit" contact, disclaimer that timings should be confirmed with temples.

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

### Phase 2 (specified now, built later)

| ID | Scenario |
|----|----------|
| P-01 | Devotee likes a temple (requires sign-in; like counts persist) |
| P-02 | Devotee suggests an edit via form (moderation queue) |
| P-03 | Devotee submits a missing temple |
| P-04 | Blog: article list, categories, article page, related articles |
| P-05 | "Plan visit" — multi-temple itinerary for a festival day |

---

## 8. Non-Functional Requirements & Tech Stack

**Stack (same as `keep-plants-alive`, the org standard):** Vite + React + TypeScript + Tailwind CSS, deployed on Netlify (`netlify.toml` with SPA fallback redirect). E2E tests with Playwright. Supabase reserved for Phase 2 (likes, contributions).

1. **Hosting:** Netlify; `npm run build` output deployed automatically from `main`.
2. **Performance:** homepage < 1.5s first paint on 4G; images lazy-loaded and compressed; code-split per route.
3. **Responsive:** mobile-first; breakpoints at 640px and 1024px.
4. **Accessibility:** semantic HTML, alt text, color contrast AA, keyboard navigable.
5. **Data freshness:** review counts re-verified manually; each temple page shows source + observation date.
6. **Data-driven:** all content renders from `src/data/temples.ts`; adding a temple = adding one object, no hand-edited pages.

---

## 9. Out of Scope (Phase 1)

User accounts, likes, comments, blog CMS, contribution workflows, trip planner, multi-language UI, push notifications, native apps.

---

## 10. Open Questions

1. Photo sourcing: use temple website/Facebook photos (with credit), Wikimedia Commons, or placeholders until we photograph?
2. Should the festival section auto-highlight based on today's date, or be manually curated per festival?
3. Include churches/gurdwaras later, or keep this strictly Hindu temples?
4. Domain: keep on the Netlify URL or map a `naatupaakam.com` subdomain later?
