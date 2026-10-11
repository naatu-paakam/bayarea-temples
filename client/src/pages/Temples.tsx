import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TempleCard from '../components/TempleCard';
import { temples, allDeities, allCities, allRegions, REVIEW_DISCLAIMER } from '../data/temples';
import { applyFilters, type SearchFilters } from '../services/search';

const REGION_FILTERS = ['All', 'Featured', ...allRegions];

export default function Temples() {
  const [params] = useSearchParams();
  const [deity, setDeity] = useState(params.get('deity') ?? '');
  const [city, setCity] = useState(params.get('city') ?? '');
  const [regionTab, setRegionTab] = useState('All');
  const [sort, setSort] = useState<SearchFilters['sort']>('most-reviewed');
  const [festival, setFestival] = useState(params.get('festival') ?? '');
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [promptQuote, setPromptQuote] = useState<string | null>(params.get('prompt'));

  // Re-sync when the URL changes (e.g. deity chips, natural-language search
  // while already on this page) — the component does not remount.
  useEffect(() => {
    setDeity(params.get('deity') ?? '');
    setCity(params.get('city') ?? '');
    setFestival(params.get('festival') ?? '');
    setSort((params.get('sort') as SearchFilters['sort']) || 'most-reviewed');
    setKeyword(params.get('q') ?? '');
    setPromptQuote(params.get('prompt'));
  }, [params]);

  const results = useMemo(() => {
    const f: SearchFilters = {
      deities: deity ? [deity] : [],
      cities: city ? [city] : [],
      regions: regionTab === 'All' || regionTab === 'Featured' ? [] : [regionTab],
      festival,
      sort,
      keywords: keyword,
    };
    let out = applyFilters(temples, f);
    if (regionTab === 'Featured') out = out.filter((t) => t.featured);
    return out;
  }, [deity, city, regionTab, sort, festival, keyword]);

  function reset() {
    setDeity('');
    setCity('');
    setRegionTab('All');
    setSort('most-reviewed');
    setFestival('');
    setKeyword('');
    setPromptQuote(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Discover Temples</h1>
      <p className="text-muted mb-6">
        {promptQuote ? (
          <>
            Results for <em className="text-ink">“{promptQuote}”</em>
          </>
        ) : (
          'Filter by deity, city or region — or search in plain words from the homepage.'
        )}
      </p>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Region filter">
        {REGION_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setRegionTab(r)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border min-h-[44px] ${
              regionTab === r
                ? 'bg-maroon text-white border-maroon'
                : 'bg-white border-[#e8d5b5] hover:border-saffron'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Structured filters */}
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <label className="block">
          <span className="text-sm text-muted">Deity</span>
          <select
            value={deity}
            onChange={(e) => setDeity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8d5b5] bg-white px-3 py-2.5"
          >
            <option value="">All deities</option>
            {allDeities.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted">City</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e8d5b5] bg-white px-3 py-2.5"
          >
            <option value="">All cities</option>
            {allCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted">Festival</span>
          <input
            value={festival}
            onChange={(e) => setFestival(e.target.value)}
            placeholder="e.g. Navarathri"
            className="mt-1 w-full rounded-lg border border-[#e8d5b5] bg-white px-3 py-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SearchFilters['sort'])}
            className="mt-1 w-full rounded-lg border border-[#e8d5b5] bg-white px-3 py-2.5"
          >
            <option value="most-reviewed">Most reviewed</option>
            <option value="highest-rated">Highest rated</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      <p className="text-sm text-muted mb-4" aria-live="polite">
        {results.length} temple{results.length === 1 ? '' : 's'} found · {REVIEW_DISCLAIMER}
      </p>

      {results.length === 0 ? (
        <div className="bg-white border border-[#f0e2cc] rounded-xl p-10 text-center">
          <p className="text-xl font-bold mb-2">No temples match those filters</p>
          <p className="text-muted mb-4">Try widening the deity, city or festival filters.</p>
          <button
            onClick={reset}
            className="rounded-full bg-maroon text-white px-6 py-2.5 font-semibold min-h-[44px]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((t, i) => (
            <TempleCard key={t.id} temple={t} rank={sort === 'most-reviewed' ? i + 1 : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
