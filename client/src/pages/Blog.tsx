import { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles, articleCategories } from '../data/articles';

export default function Blog() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const list = articles.filter(
    (a) =>
      (cat === 'All' || a.category === cat) &&
      (!q || `${a.title} ${a.excerpt}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Temple Knowledge</h1>
      <p className="text-muted mb-6">Guides, festival explainers and notes on the temples listed here.</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="w-full max-w-md rounded-full border border-[#e8d5b5] bg-white px-5 py-2.5 mb-4"
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', ...articleCategories].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border min-h-[44px] ${
              cat === c ? 'bg-maroon text-white border-maroon' : 'bg-white border-[#e8d5b5]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-muted">No articles match. Try a different search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((a) => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="card-hover bg-white border border-[#f0e2cc] rounded-xl p-5 block"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-saffron">{a.category}</span>
              <h2 className="font-bold text-lg text-maroon mt-1 mb-2">{a.title}</h2>
              <p className="text-[15px] text-muted mb-3">{a.excerpt}</p>
              <p className="text-xs text-muted">
                {a.date} · {a.readTime} read
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
