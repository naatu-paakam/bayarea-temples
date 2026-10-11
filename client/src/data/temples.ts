import templesData from './temples.json';

export interface TempleFestival {
  name: string;
  dates: string;
  details: string;
}

export interface Temple {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: 'Tri-Valley' | 'South Bay' | 'East Bay' | 'Peninsula' | 'San Francisco';
  address: string;
  deities: string[];
  tradition: string;
  phone: string | null;
  website: string | null;
  hours: Record<string, string> | null;
  rating: number | null;
  reviewCount: number | null;
  reviewSource: string;
  reviewDate: string;
  featured: boolean;
  history: string;
  amenities: string[];
  festivals: TempleFestival[];
  howToReach: string | null;
  metaDescription: string;
}

export const REVIEW_DISCLAIMER =
  'Review counts are approximate, compiled from public Google listings in October 2026.';

// Single source of truth lives in temples.json (also consumed by scripts/ and
// netlify/functions via the generated temples-meta.json).
export const temples = templesData as Temple[];

export const allDeities = Array.from(new Set(temples.flatMap((t) => t.deities))).sort();

export const allRegions = Array.from(new Set(temples.map((t) => t.region)));

export const allCities = Array.from(new Set(temples.map((t) => t.city))).sort();

export function getTempleBySlug(slug: string): Temple | undefined {
  return temples.find((t) => t.slug === slug);
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
