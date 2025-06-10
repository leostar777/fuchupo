import { useEffect, useState } from 'react';

export interface Article {
  title: string;
  link: string;
  pubDate: string;
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    fetch(baseUrl + 'news.json', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Article[]) =>
        data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      )
      .then(setArticles)
      .catch(console.error);
  }, []);

  return articles;
}
