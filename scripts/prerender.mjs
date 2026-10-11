// Post-build prerender: emits one HTML page per temple (and per article) with
// full metadata tags (title, meta description, Open Graph, JSON-LD), plus
// sitemap.xml. Each page boots the same SPA bundle; crawlers and unfurlers
// get complete metadata without running JS.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const shell = readFileSync(join(dist, 'index.html'), 'utf8');

const scriptMatch = shell.match(/<script type="module"[^>]*src="([^"]+)"/);
const cssMatch = shell.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/);
const scriptTag = scriptMatch ? `<script type="module" src="${scriptMatch[1]}"></script>` : '';
const cssTag = cssMatch ? `<link rel="stylesheet" href="${cssMatch[1]}" />` : '';

const SITE = 'https://bayarea-temples.netlify.app';
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function page({ title, description, url, image, jsonLd, heading, sub }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
${image ? `<meta property="og:image" content="${esc(image)}" />` : ''}
${cssTag}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<div id="root"><main style="font-family:Georgia,serif;max-width:640px;margin:4rem auto;padding:0 1.5rem;text-align:center">
<h1>${esc(heading)}</h1><p>${esc(sub)}</p><p><a href="/">Browse all Bay Area temples</a></p>
</main></div>
${scriptTag}
</body>
</html>`;
}

const temples = JSON.parse(readFileSync(join(root, 'client/src/data/temples.json'), 'utf8'));
const articles = JSON.parse(
  existsSync(join(root, 'client/src/data/articles.json'))
    ? readFileSync(join(root, 'client/src/data/articles.json'), 'utf8')
    : '[]',
);

const urls = [`${SITE}/`, `${SITE}/temples/`, `${SITE}/deities/`, `${SITE}/festivals/`, `${SITE}/blog/`, `${SITE}/plan/`, `${SITE}/about/`];

for (const t of temples) {
  const url = `${SITE}/temples/${t.slug}/`;
  const title = `${t.name}, ${t.city} — Bay Area Hindu Temple`;
  const html = page({
    title,
    description: t.metaDescription,
    url,
    image: null,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'HinduTemple',
      name: t.name,
      address: t.address,
      url,
      telephone: t.phone,
      aggregateRating:
        t.rating && t.reviewCount
          ? { '@type': 'AggregateRating', ratingValue: t.rating, reviewCount: t.reviewCount }
          : undefined,
    },
    heading: t.name,
    sub: `${t.address} · ${t.rating ? `${t.rating}★ (${t.reviewCount} reviews)` : 'Community temple'}`,
  });
  const dir = join(dist, 'temples', t.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  urls.push(url);
}

for (const a of articles) {
  const url = `${SITE}/blog/${a.slug}/`;
  const html = page({
    title: `${a.title} — Bay Area Temples Blog`,
    description: a.excerpt,
    url,
    image: null,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date },
    heading: a.title,
    sub: a.excerpt,
  });
  const dir = join(dist, 'blog', a.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  urls.push(url);
}

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`prerendered ${temples.length} temples + ${articles.length} articles, sitemap with ${urls.length} urls`);
