import { useEffect, useState } from "react";

export interface Article {
  rawTitle: string;
  headline: string;
  publisher: string;
  link: string;
  pubDate: string;
  shortTitle?: string; // 今後 GPT で追加予定
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Article[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
        setArticles(sorted);
      })
      .catch(console.error);
  }, []);

  return articles;
}
