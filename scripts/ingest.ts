// ts-node/esm 実行（ingest ワークフロー）
import Parser from 'rss-parser';
import fs from 'node:fs/promises';
import { OpenAI } from 'openai';
import pLimit from 'p-limit';
import 'dotenv/config';

type FeedItem = {
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
  shortTitle: string;
  aiNote: string;
}

const FEED_URL =
  process.env.FEED_URL ??
  'https://news.google.com/rss/search?q=府中市&hl=ja&gl=JP&ceid=JP%3Aja';
const NEWS_PATH = 'public/news.json';
const MAX_ARTICLES = 1000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new Parser<FeedItem>();
const limiter = pLimit(2); // 同時 2 リクエストまで

async function summarize(item: FeedItem): Promise<{
  shortTitle: string;
  aiNote: string;
}> {
  const prompt = `
あなたはローカルニュースを要約するAIです。

## 入力
TITLE: ${item.title}
DESCRIPTION: ${item.contentSnippet ?? ''}

## 出力フォーマット（JSON）
{
  "shortTitle": "15文字以内の短いタイトル",
  "aiNote": "最大2行のカジュアルな所感（句点2つ以内）"
}
`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'You output ONLY valid JSON.' },
        { role: 'user', content: prompt.trim() },
      ],
    });

    const text = res.choices[0].message.content?.trim() ?? '{}';
    const json = JSON.parse(text);
    return {
      shortTitle: json.shortTitle || item.title || '',
      aiNote: json.aiNote || '',
    };
  } catch (e) {
    console.error('⚠️  summary failed:', e);
    return { shortTitle: item.title ?? '', aiNote: '' };
  }
}

async function main() {
  const feed = await parser.parseURL(FEED_URL);
  const existing: Article[] = await fs
    .readFile(NEWS_PATH, 'utf8')
    .then((t) => JSON.parse(t))
    .catch(() => []);

  // 重複判定用セット
  const known = new Set(existing.map((a) => a.link));

  // 新着のみ
  const newcomers = feed.items.filter((i) => !known.has(i.link ?? '#'));

  const summarized = await Promise.all(
    newcomers.map((i) =>
      limiter(async () => {
        const sum = await summarize(i);
        return <Article>{
          title: i.title ?? '',
          link: i.link ?? '#',
          pubDate: i.pubDate ?? new Date().toUTCString(),
          description: i.contentSnippet ?? i.content ?? '',
          creator: i.creator,
          categories: i.categories,
          ...sum,
        };
      }),
    ),
  );

  // マージ & ソート & truncate
  const merged = [...summarized, ...existing].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  ).slice(0, MAX_ARTICLES);

  await fs.writeFile(NEWS_PATH, JSON.stringify(merged, null, 2));
  console.log(`✅ news.json updated: +${summarized.length} / total ${merged.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
