import { useState } from 'react';
import { Link } from 'react-router-dom';
import { temples, mapsUrl } from '../data/temples';

function loadPlan(): string[] {
  try {
    return JSON.parse(localStorage.getItem('bat-plan') ?? '[]');
  } catch {
    return [];
  }
}

export default function Plan() {
  const [ids, setIds] = useState<string[]>(loadPlan);
  const [date, setDate] = useState('');
  const list = ids.map((id) => temples.find((t) => t.id === id)).filter(Boolean);

  function remove(id: string) {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    localStorage.setItem('bat-plan', JSON.stringify(next));
  }

  function move(id: string, dir: -1 | 1) {
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setIds(next);
    localStorage.setItem('bat-plan', JSON.stringify(next));
  }

  const multiStop = `https://www.google.com/maps/dir/${list
    .map((t) => encodeURIComponent(t!.address))
    .join('/')}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">My Visit Plan</h1>
      <p className="text-muted mb-6">
        Add temples from any temple page, order them, and open the whole route in Google Maps. Saved on this device.
      </p>

      <label className="block mb-6 max-w-xs">
        <span className="text-sm text-muted">Visit date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#e8d5b5] bg-white px-3 py-2.5"
        />
      </label>

      {list.length === 0 ? (
        <div className="bg-white border border-[#f0e2cc] rounded-xl p-10 text-center">
          <p className="text-xl font-bold mb-2">Your plan is empty</p>
          <p className="text-muted mb-4">Browse temples and tap “Add to visit plan”.</p>
          <Link to="/temples" className="rounded-full bg-maroon text-white px-6 py-2.5 font-semibold inline-block">
            Browse temples
          </Link>
        </div>
      ) : (
        <>
          <ol className="space-y-3 mb-6">
            {list.map((t, i) => (
              <li key={t!.id} className="bg-white border border-[#f0e2cc] rounded-xl p-4 flex items-center gap-3">
                <span className="bg-maroon text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link to={`/temples/${t!.slug}`} className="font-bold text-maroon hover:underline">
                    {t!.name}
                  </Link>
                  <p className="text-sm text-muted truncate">{t!.address}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => move(t!.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="w-10 h-10 rounded-full border border-[#e8d5b5] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(t!.id, 1)}
                    disabled={i === list.length - 1}
                    aria-label="Move down"
                    className="w-10 h-10 rounded-full border border-[#e8d5b5] disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => remove(t!.id)}
                    aria-label="Remove"
                    className="w-10 h-10 rounded-full border border-[#e8d5b5] text-maroon"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <a
              href={multiStop}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-maroon text-white px-6 py-2.5 font-semibold min-h-[44px] inline-flex items-center"
            >
              Open route in Google Maps
            </a>
            <button
              onClick={() => {
                setIds([]);
                localStorage.setItem('bat-plan', '[]');
              }}
              className="rounded-full border border-[#e8d5b5] bg-white px-6 py-2.5 font-semibold min-h-[44px]"
            >
              Clear plan
            </button>
          </div>
          {date && <p className="text-sm text-muted mt-3">Planned for {date}.</p>}
          <p className="text-xs text-muted mt-4">
            Single-temple directions: <a className="underline" href={mapsUrl(list[0]!.address)} target="_blank" rel="noreferrer">first stop</a>
          </p>
        </>
      )}
    </div>
  );
}
