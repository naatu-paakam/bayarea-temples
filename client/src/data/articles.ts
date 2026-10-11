import articlesData from './articles.json';

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string[];
}

// Single source of truth lives in articles.json (also consumed by scripts/prerender.mjs).
export const articles = articlesData as Article[];

export const articleCategories = Array.from(new Set(articles.map((a) => a.category)));

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
