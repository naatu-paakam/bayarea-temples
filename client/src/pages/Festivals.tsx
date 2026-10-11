import { Link } from 'react-router-dom';
import { temples } from '../data/temples';

export default function Festivals() {
  const withFestivals = temples.filter((t) => t.festivals.length > 0);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="temple-gradient text-white rounded-2xl p-6 md:p-10 mb-8">
        <p className="text-white/80 text-sm mb-1">Now celebrating</p>
        <h1 className="hero-text text-3xl md:text-4xl font-bold mb-2">🪔 Navarathri 2026</h1>
        <p className="hero-text text-white/85 max-w-2xl">
          October 11–20 — nine nights of Devi worship. Durga Pooja programs, Garba nights and special alankarams
          across the Bay Area’s temples.
        </p>
      </section>

      <h2 className="text-2xl font-bold mb-4">Temples celebrating Navarathri</h2>
      <div className="space-y-5">
        {withFestivals
          .filter((t) => t.festivals.some((f) => /navarathri|navratri|durga pooja/i.test(f.name)))
          .map((t) => (
            <div key={t.id} className="bg-white border border-[#f0e2cc] rounded-xl p-5">
              <Link to={`/temples/${t.slug}`} className="font-bold text-lg text-maroon hover:underline">
                {t.name}
              </Link>
              <p className="text-sm text-muted mb-3">
                {t.city} · {t.region}
              </p>
              {t.festivals
                .filter((f) => /navarathri|navratri|durga pooja/i.test(f.name))
                .map((f) => (
                  <div key={f.name} className="border-t border-[#f7ecd9] pt-3 mt-3 first:border-0 first:pt-0 first:mt-0">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <p className="font-semibold">{f.name}</p>
                      <span className="text-sm font-semibold bg-[#fdeaea] text-maroon rounded-full px-3 py-1">
                        {f.dates}
                      </span>
                    </div>
                    <p className="text-[15px] mt-1">{f.details}</p>
                  </div>
                ))}
            </div>
          ))}
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">All festival programs</h2>
      <div className="space-y-5">
        {withFestivals.map((t) => (
          <div key={t.id} className="bg-white border border-[#f0e2cc] rounded-xl p-5">
            <Link to={`/temples/${t.slug}`} className="font-bold text-lg text-maroon hover:underline">
              {t.name}
            </Link>
            <p className="text-sm text-muted mb-2">
              {t.city} · {t.region}
            </p>
            <ul className="list-disc pl-5 text-[15px] space-y-1">
              {t.festivals.map((f) => (
                <li key={f.name}>
                  <strong>{f.name}</strong> <span className="text-muted">({f.dates})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
