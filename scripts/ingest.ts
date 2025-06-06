// scripts/ingest.ts
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import * as dotenv from "dotenv";
dotenv.config();

const RSS_URL = "https://news.google.com/rss/search?q=府中市&hl=ja&gl=JP&ceid=JP:ja";
const OUTPUT = path.resolve("public/news.json");
const MAX_ITEMS = 1000;

interface Item {
  title: string;
  link: string;
  pubDate: string;
  shortTitle?: string; // ← GPT で後付け
}

async function fetchRss(): Promise<Item[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  return feed.items.map((i) => ({
    title: i.title ?? "",
    link: i.link ?? "",
    pubDate: i.pubDate ?? new Date().toUTCString(),
  }));
}

async function loadExisting(): Promise<Item[]> {
  try {
    const json = await fs.readFile(OUTPUT, "utf-8");
    return JSON.parse(json) as Item[];
  } catch {
    return [];
  }
}

async function main() {
  const existing = await loadExisting();
  const latest = await fetchRss();

  // 既存と重複しないものだけ追加
  const combined = [...latest, ...existing].filter(
    (item, idx, arr) => arr.findIndex((x) => x.link === item.link) === idx
  );

  // pubDate の降順でソートし、上限カット
  combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const trimmed = combined.slice(0, MAX_ITEMS);

  // ↓ GPT-4o を使うときはここで shortTitle を生成
  // const apiKey = process.env.OPENAI_API_KEY;
  // if (apiKey) { ... }

  await fs.writeFile(OUTPUT, JSON.stringify(trimmed, null, 2), "utf-8");
  console.log(`Saved ${trimmed.length} items to public/news.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
