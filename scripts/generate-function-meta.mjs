// Generates netlify/functions/temples-meta.json — the compact per-temple metadata
// bundle that search-classify.js passes to the LLM so it classifies prompts
// against REAL values (deities, cities, regions, festivals) and can never
// invent temples. Run as part of `npm run build` (prebuild step).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const temples = JSON.parse(readFileSync(join(root, 'client/src/data/temples.json'), 'utf8'));

const meta = temples.map((t) => ({
  id: t.id,
  slug: t.slug,
  name: t.name,
  city: t.city,
  region: t.region,
  deities: t.deities,
  festivals: t.festivals.map((f) => ({ name: f.name, dates: f.dates })),
  rating: t.rating,
  reviewCount: t.reviewCount,
}));

mkdirSync(join(root, 'netlify/functions'), { recursive: true });
writeFileSync(
  join(root, 'netlify/functions/temples-meta.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), temples: meta }, null, 2) + '\n',
);
console.log(`wrote netlify/functions/temples-meta.json (${meta.length} temples)`);
