// scripts/ingest.ts  (ts-node/esm)
import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import 'dotenv/config';

type InputItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  categories?: string[];
};

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  creator?: string;
  categories?: string[];
}

// ─────────────────────────
const parser = new Parser<InputItem>();
const FEED_URL = process.env.FEED_URL || 'https://news.google.com/rss/search?q=府中市&hl=ja&gl=JP&ceid=JP%3Aja';

async function main() {
  const feed = await parser.parseURL(FEED_URL);

  const articles: Article[] = feed.items.map((i): Article => ({
    title: i.title ?? '(no title)',
    link:  i.link  ?? '#',
    pubDate: i.pubDate ?? new Date().toUTCString(),
    description: i.contentSnippet ?? i.content ?? '',
    creator: i.creator,
    categories: i.categories,
  }));

  // 新しい順に並べ替え
  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  await fs.writeFile('public/news.json', JSON.stringify(articles, null, 2));
  console.log(`✅ news.json updated (${articles.length} items)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
