#!/usr/bin/env -S node --loader ts-node/esm
//------------------------------------------------------------
//  ingest.ts
//  - 1h ごとに RSS を取得して差分を抽出
//  - GPT-4 で shortTitle を生成（まだダミー）
//  - public/news.json を更新（最大 1000 件保持）
//------------------------------------------------------------
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

// ❶ 必須環境変数チェック
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is missing.  Set it in GitHub Secrets!');
  process.exit(1);
}

// ❷ RSS フィード（複数対応可）
const feeds = (process.env.RSS_FEEDS ??
  'https://news.google.com/rss/search?q=府中市&hl=ja&gl=JP&ceid=JP:ja'
).split(',');

// ❸ 既存データを読み込み（なければ空配列）
const newsFile = path.resolve('public/news.json');
let existing: any[] = [];
try {
  existing = JSON.parse(await fs.readFile(newsFile, 'utf8'));
} catch (_) {
  /* noop */
}

// ------------------ ここから本実装予定 ------------------
// ※ いまはデモとして「同じデータをそのまま保存」だけ
// ---------------------------------------------------------
console.log('✅ ingest started with key length:', apiKey.length);
console.log('ℹ️  feeds:', feeds.join(' , '));

// TODO:
//  1. fetch RSS → 新記事だけ抽出
//  2. OpenAI ChatCompletion で shortTitle 生成
//  3. existing とマージして最大 1000 件に整形
//  4. 保存
await fs.mkdir(path.dirname(newsFile), { recursive: true });
await fs.writeFile(newsFile, JSON.stringify(existing, null, 2));
console.log('📝 public/news.json updated (noop)');
