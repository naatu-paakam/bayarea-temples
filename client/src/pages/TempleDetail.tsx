import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Stars from '../components/Stars';
import TempleCard from '../components/TempleCard';
import { getTempleBySlug, temples, mapsUrl, REVIEW_DISCLAIMER } from '../data/temples';

const TABS = ['Overview', 'Festivals', 'Visit'] as const;

function useLikes() {
  const [likes, setLikes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bat-likes') ?? '[]');
    } catch {
      return [];
    }
  });
  function toggle(id: string) {
    setLikes((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('bat-likes', JSON.stringify(next));
      return next;
    });
  }
  return { likes, toggle };
}

export default function TempleDetail() {
  const { slug } = useParams();
  const temple = slug ? getTempleBySlug(slug) : undefined;
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const { likes, toggle } = useLikes();
  const [planMsg, setPlanMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (temple) document.title = `${temple.name}, ${temple.city} — Bay Area Hindu Temple`;
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!temple) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Temple not found</h1>
        <Link to="/temples" className="text-maroon font-semibold underline">
          Browse all temples
        </Link>
      </div>
    );
  }

  const liked = likes.includes(temple.id);
  const related = temples
    .filter((t) => t.id !== temple.id)
    .map((t) => ({
      t,
      score:
        t.deities.filter((d) => temple.deities.includes(d)).length * 2 + (t.region === temple.region ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.t);

  function addToPlan() {
    try {
      const plan: string[] = JSON.parse(localStorage.getItem('bat-plan') ?? '[]');
      if (!plan.includes(temple!.id)) {
        localStorage.setItem('bat-plan', JSON.stringify([...plan, temple!.id]));
        setPlanMsg('Added to your visit plan ✓');
      } else {
        setPlanMsg('Already in your visit plan');
      }
    } catch {
      setPlanMsg('Could not save — please try again');
    }
    setTimeout(() => setPlanMsg(''), 2500);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: temple!.name, url });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setPlanMsg('Link copied ✓');
      setTimeout(() => setPlanMsg(''), 2500);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-maroon">
          Home
        </Link>{' '}
        / <Link to="/temples" className="hover:text-maroon">Temples</Link> / {temple.name}
      </nav>

      {/* Hero */}
      <div className="temple-gradient rounded-2xl text-white p-6 md:p-10 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {temple.deities.map((d) => (
            <span key={d} className="bg-white/20 rounded-full px-3 py-1 text-sm">
              {d}
            </span>
          ))}
        </div>
        <h1 className="hero-text text-3xl md:text-4xl font-bold mb-2">{temple.name}</h1>
        <p className="hero-text text-white/85 mb-4">
          📍 {temple.address} · {temple.tradition}
        </p>
        <div className="flex items-center gap-4 text-white">
          <Stars rating={temple.rating} />
          <span className="text-white/85 text-sm">
            {temple.reviewCount != null ? `${temple.reviewCount.toLocaleString()} reviews` : '—'}
          </span>
        </div>
        <p className="text-white/60 text-xs mt-2">{REVIEW_DISCLAIMER}</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <a
          href={mapsUrl(temple.address)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-maroon text-white px-5 py-2.5 font-semibold min-h-[44px] inline-flex items-center"
        >
          Get Directions
        </a>
        <button
          onClick={() => toggle(temple.id)}
          aria-pressed={liked}
          className={`rounded-full border px-5 py-2.5 font-semibold min-h-[44px] ${
            liked ? 'bg-[#fdeaea] border-[#f2b8b8] text-maroon' : 'bg-white border-[#e8d5b5]'
          }`}
        >
          {liked ? '♥ Liked' : '♡ Like'}
        </button>
        <button
          onClick={share}
          className="rounded-full border border-[#e8d5b5] bg-white px-5 py-2.5 font-semibold min-h-[44px]"
        >
          Share
        </button>
        <button
          onClick={addToPlan}
          className="rounded-full border border-[#e8d5b5] bg-white px-5 py-2.5 font-semibold min-h-[44px]"
        >
          + Add to visit plan
        </button>
        {planMsg && (
          <span className="self-center text-sm text-maroon font-semibold" role="status">
            {planMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#f0e2cc] mb-6 flex gap-6" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`pb-2.5 font-semibold min-h-[44px] ${
              tab === t ? 'text-maroon border-b-2 border-maroon' : 'text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold mb-2">About</h2>
          <p className="mb-6 leading-relaxed">{temple.history}</p>
          <h2 className="text-xl font-bold mb-2">Deities</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {temple.deities.map((d) => (
              <span key={d} className="bg-[#fdf1e0] border border-[#f0d9ae] rounded-full px-3 py-1 text-sm">
                {d}
              </span>
            ))}
          </div>
          {temple.amenities.length > 0 ? (
            <>
              <h2 className="text-xl font-bold mb-2">Amenities</h2>
              <ul className="list-disc pl-5 mb-6 space-y-1">
                {temple.amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted mb-6">Amenity details not published yet — check the temple website.</p>
          )}
        </div>
      )}

      {tab === 'Festivals' && (
        <div className="max-w-3xl">
          {temple.festivals.length === 0 ? (
            <div className="bg-white border border-[#f0e2cc] rounded-xl p-8 text-center">
              <p className="font-bold text-lg mb-1">Festival schedule not published yet</p>
              <p className="text-muted">
                Check the temple website for the latest celebrations.
                {temple.website && (
                  <>
                    {' '}
                    <a href={temple.website} target="_blank" rel="noreferrer" className="text-maroon underline">
                      {temple.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {temple.festivals.map((f) => (
                <div key={f.name} className="bg-white border border-[#f0e2cc] rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h3 className="font-bold text-lg text-maroon">🪔 {f.name}</h3>
                    <span className="text-sm font-semibold bg-[#fdeaea] text-maroon rounded-full px-3 py-1">
                      {f.dates}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px]">{f.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Visit' && (
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold mb-3">Hours</h2>
          {temple.hours ? (
            <table className="w-full bg-white border border-[#f0e2cc] rounded-xl overflow-hidden mb-6 text-[15px]">
              <tbody>
                {Object.entries(temple.hours).map(([day, h]) => (
                  <tr key={day} className="border-b border-[#f7ecd9] last:border-0">
                    <td className="px-4 py-2.5 font-semibold w-32">{day}</td>
                    <td className="px-4 py-2.5">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted mb-6">Hours not published here — please check the temple website before visiting.</p>
          )}
          <h2 className="text-xl font-bold mb-2">Contact</h2>
          <div className="bg-white border border-[#f0e2cc] rounded-xl p-5 space-y-2 text-[15px]">
            <p>📍 {temple.address}</p>
            {temple.phone && <p>📞 {temple.phone}</p>}
            {temple.website && (
              <p>
                🌐{' '}
                <a href={temple.website} target="_blank" rel="noreferrer" className="text-maroon underline">
                  {temple.website.replace('https://', '').replace('http://', '').replace(/\/$/, '')}
                </a>
              </p>
            )}
            {temple.howToReach && <p className="text-muted">🚗 {temple.howToReach}</p>}
          </div>
        </div>
      )}

      {/* Related */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Related Temples</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {related.map((t) => (
            <TempleCard key={t.id} temple={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
