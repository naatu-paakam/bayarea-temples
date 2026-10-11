import { Link } from 'react-router-dom';
import type { Temple } from '../data/temples';
import Stars from './Stars';

export function formatReviews(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
}

export default function TempleCard({ temple, rank }: { temple: Temple; rank?: number }) {
  const hasFestival = temple.festivals.length > 0;
  return (
    <Link
      to={`/temples/${temple.slug}`}
      className="card-hover block bg-white rounded-xl border border-[#f0e2cc] shadow-sm overflow-hidden"
    >
      <div className="temple-gradient h-28 flex items-center justify-center relative">
        <span className="text-5xl" role="img" aria-label="temple">
          🛕
        </span>
        {rank != null && (
          <span className="absolute top-2 left-2 bg-white/90 text-maroon font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
            {rank}
          </span>
        )}
        {hasFestival && (
          <span className="absolute top-2 right-2 bg-maroon text-white text-xs px-2 py-0.5 rounded-full">
            🪔 Festival
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-maroon text-lg leading-snug">{temple.name}</h3>
        <p className="text-sm text-muted">
          {temple.city} · {temple.region}
        </p>
        <div className="flex items-center gap-3 mt-2 text-sm">
          <Stars rating={temple.rating} />
          <span className="text-muted">{formatReviews(temple.reviewCount)} reviews</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {temple.deities.slice(0, 4).map((d) => (
            <span key={d} className="text-xs bg-[#fdf1e0] border border-[#f0d9ae] text-[#8a5a1a] rounded-full px-2 py-0.5">
              {d}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
