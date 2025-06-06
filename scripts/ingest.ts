/**
 * RSS を取得して `public/news.json` に保存するスクリプト
 * ----------------------------------------------------------
 * 1. Google News RSS（または環境変数 RSS_URL）を取得
 * 2. タイトルを「見出し」と「媒体名」に分離
 * 3. 既存ファイルとマージして最大 1000 件を保持
 *
 * $ npm run ingest で実行（package.json の script 済み）
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Parser from "rss-parser";
import dotenv from "dotenv";

dotenv.config();

const RSS_URL =
  process.env.RSS_URL ??
  "https://news.google.com/rss/search?q=%E5%BA%9C%E4%B8%AD&hl=ja&gl=JP&ceid=JP:ja";

const OUT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/news.json"
);

interface Item {
  rawTitle: string;
  headline: string;
  publisher: string;
  link: string;
  pubDate: string;
  shortTitle?: string;
}

/** タイトル から 見出し / 媒体名 を抽出 */
function splitTitle(t: string): { headline: string; publisher: string } {
  const parts = t.split(" - ");
  if (parts.length >= 2) {
    return {
      headline: parts.slice(0, -1).join(" - "),
      publisher: parts.at(-1)!,
    };
  }
  return { headline: t, publisher: new URL(RSS_URL).hostname };
}

async function fetchRss(): Promise<Item[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);

  return feed.items.map((i) => {
    const { headline, publisher } = splitTitle(i.title ?? "");
    return {
      rawTitle: i.title ?? "",
      headline,
      publisher,
      link: i.link ?? "",
      pubDate: i.pubDate ?? new Date().toUTCString(),
    };
  });
}

async function readOld(): Promise<Item[]> {
  try {
    const txt = await fs.readFile(OUT_FILE, "utf8");
    return JSON.parse(txt) as Item[];
  } catch {
    return [];
  }
}

async function main() {
  const [oldItems, newItems] = await Promise.all([readOld(), fetchRss()]);

  // 既存と重複しないリンクだけ追加
  const known = new Set(oldItems.map((i) => i.link));
  const merged = [...newItems.filter((i) => !known.has(i.link)), ...oldItems];

  // 最新順に並べて 1000 件に絞る
  merged.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  const trimmed = merged.slice(0, 1000);

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(trimmed, null, 2), "utf8");
  console.log(`✅ news.json updated (${trimmed.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
