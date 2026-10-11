import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import TempleCard from '../components/TempleCard';
import { temples, allDeities } from '../data/temples';

const featured = temples.filter((t) => t.featured);
const mostReviewed = [...temples]
  .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
  .slice(0, 6);

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="temple-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
          <p className="inline-block bg-white/15 rounded-full px-4 py-1 text-sm mb-4">
            🪔 Navarathri 2026 · Oct 11–20
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Discover Bay Area Temples</h1>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto">
            Search in plain words, browse by deity, and plan festival visits — 14 temples ranked by devotee reviews.
          </p>
          <SearchBar large />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* Festival spotlight */}
        <section className="mt-8 bg-[#fdeaea] border border-[#f2b8b8] rounded-xl p-5">
          <h2 className="font-bold text-maroon text-xl mb-1">🪔 Navarathri 2026 is here</h2>
          <p className="text-[15px] mb-3">
            Durga Pooja programs run Oct 11–20 — Livermore’s ten-day celebrations, Garba nights in Fremont, and
            special alankarams across the South Bay.
          </p>
          <Link to="/festivals" className="font-semibold text-maroon underline">
            View Navarathri programs →
          </Link>
        </section>

        {/* Featured */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Temples</h2>
            <Link to="/temples" className="text-maroon font-semibold">
              Explore all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((t) => (
              <TempleCard key={t.id} temple={t} />
            ))}
          </div>
        </section>

        {/* Most reviewed */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Most Reviewed</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mostReviewed.map((t, i) => (
              <li key={t.id}>
                <TempleCard temple={t} rank={i + 1} />
              </li>
            ))}
          </ol>
        </section>

        {/* Browse by deity */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Browse by Deity</h2>
          <div className="flex flex-wrap gap-2.5">
            {allDeities.map((d) => (
              <Link
                key={d}
                to={`/temples?deity=${encodeURIComponent(d)}`}
                className="bg-white border border-[#e8d5b5] rounded-full px-4 py-2 text-[15px] hover:border-saffron hover:text-maroon min-h-[44px] inline-flex items-center"
              >
                {d}
              </Link>
            ))}
          </div>
        </section>

        {/* About CTA */}
        <section className="mt-10 bg-white border border-[#f0e2cc] rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold mb-2">A devotee-built directory</h2>
          <p className="text-muted mb-4 max-w-xl mx-auto">
            Timings, festivals and review counts are compiled from public listings — always confirm with the temple
            before visiting.
          </p>
          <Link to="/about" className="font-semibold text-maroon underline">
            Learn more about this project
          </Link>
        </section>
      </div>
    </div>
  );
}
