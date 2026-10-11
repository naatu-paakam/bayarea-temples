import { Link } from 'react-router-dom';
import { temples, allDeities } from '../data/temples';

export default function Deities() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Browse by Deity</h1>
      <p className="text-muted mb-6">Pick a deity to see every Bay Area temple where they are worshipped.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allDeities.map((d) => {
          const count = temples.filter((t) => t.deities.includes(d)).length;
          return (
            <Link
              key={d}
              to={`/temples?deity=${encodeURIComponent(d)}`}
              className="card-hover bg-white border border-[#f0e2cc] rounded-xl p-5 text-center"
            >
              <p className="font-bold text-lg text-maroon">{d}</p>
              <p className="text-sm text-muted">
                {count} temple{count === 1 ? '' : 's'}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
