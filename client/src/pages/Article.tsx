import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticleBySlug, articles } from '../data/articles';

export default function Article() {
  const { slug } = useParams();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) document.title = `${article.title} — Bay Area Temples Blog`;
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <Link to="/blog" className="text-maroon font-semibold underline">
          Back to articles
        </Link>
      </div>
    );
  }

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-4">
        <Link to="/blog" className="hover:text-maroon">
          Blog
        </Link>{' '}
        / {article.title}
      </nav>
      <span className="text-xs font-bold uppercase tracking-wide text-saffron">{article.category}</span>
      <h1 className="text-3xl font-bold mt-1 mb-2">{article.title}</h1>
      <p className="text-sm text-muted mb-6">
        {article.date} · {article.readTime} read
      </p>
      <div className="space-y-4 text-[17px] leading-relaxed">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">Related articles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((a) => (
              <Link
                key={a.slug}
                to={`/blog/${a.slug}`}
                className="card-hover bg-white border border-[#f0e2cc] rounded-xl p-4 block"
              >
                <p className="font-bold text-maroon">{a.title}</p>
                <p className="text-sm text-muted mt-1">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
