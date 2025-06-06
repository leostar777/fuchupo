import { useEffect, useState } from 'react';

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  creator?: string;
  categories?: string[];
  shortTitle: string;
  aiNote: string;
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'news.json', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Article[]) =>
        data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      )
      .then(setArticles)
      .catch(console.error);
  }, []);

  return articles;
}
