/**
 * POST /.netlify/functions/search-classify  { prompt: string }
 *
 * Loads the full temple dataset and articles as context, then asks Claude to
 * return both a conversational answer and structured search filters in one
 * response.  The API key never leaves the server.
 *
 * Supports two auth modes (auto-detected from env vars):
 *   Vertex AI mode:  GOOGLE_SERVICE_ACCOUNT_JSON=<json string>   (Netlify prod)
 *                    GOOGLE_APPLICATION_CREDENTIALS=<path>        (local dev)
 *                    VERTEX_PROJECT_ID=your-gcp-project-id
 *                    VERTEX_LOCATION=us-east5                     (optional)
 *   Direct API mode: ANTHROPIC_API_KEY=sk-ant-...
 *
 * Same credentials as keep-plants-live — set in Netlify dashboard or .env.local.
 */

import crypto from 'crypto';
import fs from 'fs';
import templesData from '../../client/src/data/temples.json' with { type: 'json' };
import articlesData from '../../client/src/data/articles.json' with { type: 'json' };

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://bayarea-temples.netlify.app',
  'https://naatu-paakam.github.io',
];

function corsHeaders(event) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  const origin = event?.headers?.origin || event?.headers?.Origin;
  if (typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

const json = (statusCode, obj, event) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...corsHeaders(event) },
  body: JSON.stringify(obj),
});

// ── Vertex AI auth ────────────────────────────────────────────────────────────
function loadServiceAccount() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  }
  return null;
}

async function getVertexToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${header}.${body}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${signingInput}.${signature}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!resp.ok) throw new Error(`Vertex token exchange failed (${resp.status})`);
  return (await resp.json()).access_token;
}

// ── Known values (grounding — LLM may only pick from these) ──────────────────
const KNOWN_DEITIES   = [...new Set(templesData.flatMap((t) => t.deities))];
const KNOWN_CITIES    = [...new Set(templesData.map((t) => t.city))];
const KNOWN_REGIONS   = [...new Set(templesData.map((t) => t.region))];
const KNOWN_FESTIVALS = [...new Set(templesData.flatMap((t) => (t.festivals || []).map((f) => f.name)))];
const ALLOWED_SORTS   = ['most-reviewed', 'highest-rated', 'name'];

// ── Context builders ──────────────────────────────────────────────────────────
function buildTempleContext() {
  return templesData.map((t) => {
    const hours = Object.entries(t.hours || {}).map(([d, h]) => `${d}: ${h}`).join('; ');
    const festivals = (t.festivals || []).map((f) => `${f.name} (${f.dates}): ${f.details}`).join(' | ');
    return [
      `Temple: ${t.name}`,
      `City: ${t.city} | Region: ${t.region}`,
      `Address: ${t.address}`,
      `Deities: ${t.deities.join(', ')}`,
      `Tradition: ${t.tradition}`,
      `Rating: ${t.rating ?? 'N/A'} (${t.reviewCount ?? 0} reviews)`,
      `Hours: ${hours}`,
      `Amenities: ${(t.amenities || []).join(', ')}`,
      `Festivals: ${festivals || 'none listed'}`,
      `About: ${t.history || ''}`,
    ].join('\n');
  }).join('\n\n---\n\n');
}

function buildArticleContext() {
  return articlesData.map((a) =>
    `Article: ${a.title} (${a.category})\n${Array.isArray(a.body) ? a.body.join(' ') : a.body}`
  ).join('\n\n---\n\n');
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the knowledgeable guide for Bay Area Temples, a directory of ${templesData.length} Hindu temples in the San Francisco Bay Area.

Answer the visitor's question using ONLY the temple data and articles provided below. Be specific and helpful — 2–4 sentences. Never deflect with "you can ask me about…" — always answer directly from the data.

Special query patterns — handle these explicitly:
- "what's happening", "what events are on", "what's going on", "any events", "what's new": Answer with the most active upcoming festival from the data (currently Navarathri 2026, Oct 11–20). Set festival filter to that festival name.
- "best temples", "top temples", "highest rated": Set sort to "highest-rated".
- "near [city]" or "in [city]": Set city filter.
- Questions about a specific deity: Set deity filter.

Also extract structured search filters from the question so the app can show matching temples.

Respond with ONLY a JSON object (no prose, no markdown):
{
  "answer": "your specific 2-4 sentence response drawn from the data",
  "filters": {
    "deities": [],
    "cities": [],
    "regions": [],
    "festival": "",
    "sort": "most-reviewed",
    "keywords": ""
  }
}

Filter rules:
- deities: only from [${KNOWN_DEITIES.join(', ')}]
- cities: only from [${KNOWN_CITIES.join(', ')}]
- regions: only from [${KNOWN_REGIONS.join(', ')}]
- festival: only from [${KNOWN_FESTIVALS.join(', ')}] or ""
- sort: "highest-rated" if query asks for best/top rated; "name" if alphabetical; else "most-reviewed"
- keywords: any remaining meaningful terms not captured above

═══ TEMPLE DATA ═══
${buildTempleContext()}

═══ ARTICLES ═══
${buildArticleContext()}`;

// ── Web search ────────────────────────────────────────────────────────────────
// Uses Brave Search API if BRAVE_SEARCH_API_KEY is set, otherwise Wikipedia.
// Returns 1–3 crisp sentences, or '' on failure.
async function webSearch(query) {
  try {
    const braveKey = process.env.BRAVE_SEARCH_API_KEY;

    if (braveKey) {
      // Brave Search — structured web results (upgrade path)
      const q = encodeURIComponent(`${query} Bay Area Hindu temple`);
      const res = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${q}&count=3&search_lang=en`,
        { headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': braveKey } }
      );
      if (!res.ok) throw new Error(`Brave ${res.status}`);
      const data = await res.json();
      const snippets = (data.web?.results || [])
        .slice(0, 2).map(r => r.description || r.snippet || '').filter(Boolean);
      return snippets.join(' ').slice(0, 350) || '';
    }

    // Wikipedia — free, no key, works well for Hindu festivals & temples
    // 1. Find the most relevant article title
    const searchQ = encodeURIComponent(query.length < 20 ? `${query} Hindu festival` : query);
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQ}&srlimit=1&format=json&origin=*`,
      { headers: { 'User-Agent': 'BayAreaTemples/1.0 (bayarea-temples.netlify.app)' } }
    );
    if (!searchRes.ok) throw new Error(`Wikipedia search ${searchRes.status}`);
    const searchData = await searchRes.json();
    const title = searchData?.query?.search?.[0]?.title;
    if (!title) return '';

    // 2. Fetch the page summary (clean extract, no markup)
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { 'User-Agent': 'BayAreaTemples/1.0 (bayarea-temples.netlify.app)' } }
    );
    if (!summaryRes.ok) return '';
    const summary = await summaryRes.json();
    const extract = summary.extract || '';
    // Return first 2 sentences, max 350 chars
    const sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ').slice(0, 350);
  } catch (err) {
    console.warn('webSearch failed:', err.message);
    return '';
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'POST only' }, event);
  }

  let prompt = '';
  try {
    prompt = String(JSON.parse(event.body || '{}').prompt || '').trim().slice(0, 500);
  } catch {
    return json(400, { error: 'Invalid JSON body' }, event);
  }
  if (!prompt) return json(400, { error: 'prompt required' }, event);

  // webSearch fires after Claude so we can use the detected festival/deity as the search term

  const MODEL = 'claude-haiku-4-5';
  const requestBody = {
    model: MODEL,
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  };

  let claudeResponse;
  try {
    const serviceAccount = loadServiceAccount();

    if (serviceAccount) {
      // ── Vertex AI mode ──────────────────────────────────────────────────────
      const projectId = process.env.VERTEX_PROJECT_ID || serviceAccount.project_id;
      const location  = process.env.VERTEX_LOCATION || 'us-east5';
      const token     = await getVertexToken(serviceAccount);
      const { model, ...rest } = requestBody;
      const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${model}:rawPredict`;
      claudeResponse = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rest, anthropic_version: 'vertex-2023-10-16' }),
      });
    } else {
      // ── Direct Anthropic API mode ────────────────────────────────────────────
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('No credentials: set GOOGLE_SERVICE_ACCOUNT_JSON or ANTHROPIC_API_KEY');
        return json(503, { error: 'Ask service not configured' }, event);
      }
      claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });
    }
  } catch (err) {
    console.error('Failed to reach Claude API:', err.message);
    return json(502, { error: `Could not reach Claude API: ${err.message}` }, event);
  }

  if (!claudeResponse.ok) {
    const err = await claudeResponse.text();
    console.error('Claude API error:', claudeResponse.status, err);
    return json(502, { error: `Claude API returned ${claudeResponse.status}` }, event);
  }

  try {
    const data = await claudeResponse.json();
    const text = (data.content || []).map((b) => b.text || '').join('');

    const jsonStart = text.indexOf('{');
    const jsonEnd   = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) throw new Error('No JSON in response');

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    const filters = {
      deities:  (parsed.filters?.deities  || []).filter((d) => KNOWN_DEITIES.includes(d)),
      cities:   (parsed.filters?.cities   || []).filter((c) => KNOWN_CITIES.includes(c)),
      regions:  (parsed.filters?.regions  || []).filter((r) => KNOWN_REGIONS.includes(r)),
      festival: KNOWN_FESTIVALS.includes(parsed.filters?.festival) ? parsed.filters.festival : '',
      sort:     ALLOWED_SORTS.includes(parsed.filters?.sort) ? parsed.filters.sort : 'most-reviewed',
      keywords: typeof parsed.filters?.keywords === 'string' ? parsed.filters.keywords.slice(0, 120) : '',
    };

    // Use the detected festival / deity / keyword as the Wikipedia search term
    const searchTerm = filters.festival
      || filters.deities[0]
      || filters.keywords
      || prompt;
    const webSnippet = await webSearch(searchTerm);

    return json(200, {
      answer: String(parsed.answer || '').slice(0, 600),
      webSearch: webSnippet,
      filters,
    }, event);
  } catch (err) {
    console.error('search-classify parse error:', err.message);
    return json(502, { error: 'Ask failed — please try again' }, event);
  }
}
