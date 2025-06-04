import { useNews } from "@/lib/useNews";
import { useEffect, useState } from "react";

export interface Article {
  title: string;
  link: string;
  pubDate: string;
}

export function useNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    fetch("/fuchupo/news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error);
  }, []);
  return articles;
}
