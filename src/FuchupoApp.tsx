import React, { useEffect, useState } from 'react';
import { useNews, Article } from './lib/useNews';

// ───────── ヘルパー
function formatPubDate(pubDate: string): string {
  const now  = new Date();
  const pub  = new Date(pubDate);
  const diff = now.getTime() - pub.getTime();
  const hours = Math.floor(diff / 3_600_000);

  if (hours < 12) return `${hours}時間前`;

  const sameDay = now.toDateString() === pub.toDateString();
  if (sameDay) return pub.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });

  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === pub.toDateString()) return '昨日';

  return pub.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
}

// ───────── ルート
export default function FuchupoApp() {
  const news = useNews();
  const [now, setNow] = useState(() => new Date());


  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <strong>ふちゅぽ</strong>
        <span>{now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} ☀️</span>
      </header>

      <main style={styles.main}>
        {news.length === 0 && <p style={styles.loading}>Loading...</p>}
        {news.map((a, idx) => <NewsCard key={idx} {...a} />)}
      </main>
    </div>
  );
}

// ───────── 子コンポーネント
function NewsCard(a: Article) {
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer" style={styles.card}>
      <div style={styles.thumbnail}></div>
      <div style={styles.content}>
        <h2 style={styles.cardTitle}>{a.title}</h2>
        <div style={styles.meta}>{formatPubDate(a.pubDate)}</div>
      </div>
    </a>
  );
}


// ───────── CSS
const styles: Record<string, React.CSSProperties> = {
  root: { 
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans JP",sans-serif', 
    maxWidth: 680, 
    margin: '0 auto', 
    padding: 16,
    minHeight: '100vh',
    backgroundColor: '#fff'
  },
  header: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    background: '#fff', 
    padding: '12px 16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
    zIndex: 10 
  },
  main: {
    marginTop: 80,
    overflow: 'auto'
  },
  card: { 
    display: 'flex', 
    textDecoration: 'none', 
    color: 'inherit', 
    padding: 12, 
    borderBottom: '1px solid #eee',
    alignItems: 'flex-start',
    gap: 12
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    flexShrink: 0
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: 600, 
    margin: '0 0 8px 0',
    lineHeight: 1.4
  },
  meta: { 
    fontSize: 12, 
    color: '#666' 
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  },
  noNews: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  }
};
