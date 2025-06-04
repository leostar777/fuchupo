import { useEffect, useState } from "react";

export interface Article {
  title: string;
  link: string;
  pubDate: string;
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Article[]) => {
        // pubDateの新しい順にソート
        const sortedData = data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setArticles(sortedData);
      })
      .catch(console.error);
  }, []);

  return articles;
}
