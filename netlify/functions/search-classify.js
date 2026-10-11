// POST /.netlify/functions/search-classify  { prompt: string }
// Classifies a natural-language temple search prompt into structured filters using
// the LLM. The API key lives ONLY here (server-side, from process.env) — the
// browser bundle must never reference it (no VITE_ prefix, see .env.example).
//
// Grounding: temples-meta.json (generated at build time from the repo's own
// temples.json) is passed to the LLM so it may only choose from REAL deities,
// cities, regions and festivals — it can never invent temples. The client
// applies the returned filters to its local dataset; the LLM output is
// validated again client-side.
import meta from './temples-meta.json' with { type: 'json' };

const ALLOWED_SORTS = ['most-reviewed', 'highest-rated', 'name'];

const SYSTEM_PROMPT = `You classify Hindu-temple search queries into JSON filters.
Respond with ONLY a JSON object, no prose. Schema:
{"deities": string[], "cities": string[], "regions": string[], "festival": string, "sort": "most-reviewed"|"highest-rated"|"name", "keywords": string}
Rules:
- deities/cities/regions must come ONLY from the allowed lists below (exact spelling). Ignore anything not in the lists.
- festival: a festival name from the list below if the query mentions one, else "".
- sort: "highest-rated" if the query says best/top rated; "name" if alphabetical; else "most-reviewed".
- keywords: leftover meaningful words not captured above, else "".
Temple metadata:
${JSON.stringify(meta.temples.map((t) => ({ name: t.name, city: t.city, region: t.region, deities: t.deities, festivals: t.festivals })))}
Allowed deities: ${[...new Set(meta.temples.flatMap((t) => t.deities))].join(', ')}
Allowed cities: ${[...new Set(meta.temples.map((t) => t.city))].join(', ')}
Allowed regions: ${[...new Set(meta.temples.map((t) => t.region))].join(', ')}`;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }
  let prompt = '';
  try {
    prompt = String(JSON.parse(event.body || '{}').prompt || '').trim().slice(0, 500);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid JSON body' }) };
  }
  if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: 'prompt required' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'search service not configured' }) };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`LLM API ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd < 0) throw new Error('no JSON in LLM response');
    const filters = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    if (!ALLOWED_SORTS.includes(filters.sort)) filters.sort = 'most-reviewed';
    return { statusCode: 200, body: JSON.stringify({ filters }) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'classification failed' }) };
  }
}
