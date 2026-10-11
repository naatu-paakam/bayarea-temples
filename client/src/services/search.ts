import { temples, type Temple } from '../data/temples';

export interface SearchFilters {
  deities: string[];
  cities: string[];
  regions: string[];
  festival: string;
  sort: 'most-reviewed' | 'highest-rated' | 'name';
  keywords: string;
}

export const EMPTY_FILTERS: SearchFilters = {
  deities: [],
  cities: [],
  regions: [],
  festival: '',
  sort: 'most-reviewed',
  keywords: '',
};

const KNOWN_DEITIES = Array.from(new Set(temples.flatMap((t) => t.deities)));
const KNOWN_CITIES = Array.from(new Set(temples.map((t) => t.city)));
const KNOWN_REGIONS = Array.from(new Set(temples.map((t) => t.region)));

function sanitizeFilters(raw: unknown): SearchFilters {
  const f = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const pick = (v: unknown, known: string[]): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && known.includes(x)) : [];
  const sort = f['sort'];
  return {
    deities: pick(f['deities'], KNOWN_DEITIES),
    cities: pick(f['cities'], KNOWN_CITIES),
    regions: pick(f['regions'], KNOWN_REGIONS),
    festival: typeof f['festival'] === 'string' ? f['festival'].slice(0, 60) : '',
    sort: sort === 'highest-rated' || sort === 'name' ? sort : 'most-reviewed',
    keywords: typeof f['keywords'] === 'string' ? f['keywords'].slice(0, 120) : '',
  };
}

/** Plain keyword fallback — always works, no network needed. */
export function keywordSearch(prompt: string): SearchFilters {
  const q = prompt.toLowerCase();
  return {
    ...EMPTY_FILTERS,
    deities: KNOWN_DEITIES.filter((d) => q.includes(d.toLowerCase())),
    cities: KNOWN_CITIES.filter((c) => q.includes(c.toLowerCase())),
    keywords: prompt.slice(0, 120),
  };
}

/**
 * Ask the LLM (via the Netlify Function proxy — the browser never sees the API key)
 * to classify a natural-language prompt into structured filters.
 * Falls back to keyword matching on any failure.
 */
export async function classifySearch(prompt: string): Promise<{ filters: SearchFilters; viaLLM: boolean }> {
  const trimmed = prompt.trim().slice(0, 500);
  if (!trimmed) return { filters: EMPTY_FILTERS, viaLLM: false };
  try {
    const res = await fetch('/.netlify/functions/search-classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: trimmed }),
    });
    if (!res.ok) throw new Error(`function returned ${res.status}`);
    const data = await res.json();
    return { filters: sanitizeFilters(data.filters), viaLLM: true };
  } catch {
    return { filters: keywordSearch(trimmed), viaLLM: false };
  }
}

export function applyFilters(templesList: Temple[], f: SearchFilters): Temple[] {
  let out = templesList.filter((t) => {
    if (f.deities.length > 0 && !f.deities.some((d) => t.deities.includes(d))) return false;
    if (f.cities.length > 0 && !f.cities.includes(t.city)) return false;
    if (f.regions.length > 0 && !f.regions.includes(t.region)) return false;
    if (f.festival) {
      const needle = f.festival.toLowerCase();
      if (!t.festivals.some((x) => `${x.name} ${x.dates} ${x.details}`.toLowerCase().includes(needle)))
        return false;
    }
    if (f.keywords) {
      const needle = f.keywords.toLowerCase();
      const hay = `${t.name} ${t.city} ${t.address} ${t.deities.join(' ')} ${t.tradition}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  out = [...out];
  if (f.sort === 'highest-rated') out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else if (f.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  return out;
}
