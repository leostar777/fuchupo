import { useEffect, useState } from 'react';
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
  const [visible, setVisible] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <strong>ふちゅぽ</strong>
        <span>{now.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', weekday: 'short' })} ☀️24°C</span>
      </header>

      <main style={{ marginTop: 80 }}>
        {!news.length && <p>Fetching…</p>}
        {news.slice(0, visible).map((a, idx) => <NewsCard key={idx} {...a} />)}
        {visible < news.length && (
          <div style={styles.moreWrap}>
            <button style={styles.moreBtn} onClick={() => setVisible(v => v + 30)}>もっと見る</button>
          </div>
        )}
      </main>
    </div>
  );
}

// ───────── 子コンポーネント
function NewsCard(a: Article) {
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer" style={styles.card}>
      <div style={{ flex: 1 }}>
        <h2 style={styles.cardTitle}>{a.title}</h2>
        {a.description && <p style={styles.snippet}>{a.description}</p>}
        <div style={styles.meta}>{formatPubDate(a.pubDate)}</div>
      </div>
    </a>
  );
}

// ───────── CSS
const styles: Record<string, React.CSSProperties> = {
  root: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans JP",sans-serif', maxWidth: 680, margin: '0 auto', padding: 16 },
  header: { position: 'fixed', top: 0, left: 0, right: 0, background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10 },
  card:   { display: 'block', textDecoration: 'none', color: 'inherit', padding: 8, borderBottom: '1px solid #eee' },
  cardTitle: { fontSize: 15, fontWeight: 600, margin: 0 },
  snippet: { fontSize: 13, color: '#444', margin: '4px 0' },
  meta:  { fontSize: 12, color: '#666' },
  moreWrap: { textAlign: 'center', marginTop: 16 },
  moreBtn:  { padding: '8px 16px', fontSize: 14, cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc', background: '#fff' },
};
