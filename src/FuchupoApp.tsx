import { useEffect, useState } from "react";

// ―――――――――――― 型定義 & フック ――――――――――――
interface Article {
  title: string;
  link: string;
  pubDate: string;
}

function useNews(): Article[] {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/fuchupo/news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Article[]) => {
        const sortedData = data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setArticles(sortedData);
      })
      .catch(console.error);
  }, []);

  return articles;
}

function formatPubDate(pubDate: string): string {
  const now = new Date();
  const pub = new Date(pubDate);

  const diffMs = now.getTime() - pub.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 12) {
    return `${diffHours}時間前`;
  }

  const nowDate = now.getDate();
  const pubDateNum = pub.getDate();
  const nowMonth = now.getMonth();
  const pubMonth = pub.getMonth();
  const nowYear = now.getFullYear();
  const pubYear = pub.getFullYear();

  if (nowYear === pubYear && nowMonth === pubMonth) {
    if (nowDate === pubDateNum) {
      return pub.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(nowDate - 1);
    if (
      pubDateNum === yesterday.getDate() &&
      pub.getMonth() === yesterday.getMonth() &&
      pub.getFullYear() === yesterday.getFullYear()
    ) {
      return "昨日";
    }
  }

  return pub.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
}

// ―――――――――――― ルートコンポーネント ――――――――――――
export default function FuchupoApp() {
  const news = useNews();
  const [now, setNow] = useState(() => new Date());
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <strong style={styles.title}>ふちゅぽ</strong>
        <span style={styles.date}>{dateStr} ☀️24°C</span>
      </header>

      {/* News list */}
      <main style={{ marginTop: 80 }}>
        {!news.length && <p>Fetching…</p>}
        {news.slice(0, visibleCount).map((n, idx) => (
          <NewsCard key={idx} title={n.title} link={n.link} pubDate={n.pubDate} />
        ))}
        {visibleCount < news.length && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button style={styles.loadMoreButton} onClick={() => setVisibleCount((v) => v + 30)}>
              もっと見る
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ―――――――――――― 子コンポーネント / Card ――――――――――――
interface CardProps {
  title: string;
  link: string;
  pubDate: string;
}

function NewsCard({ title, link, pubDate }: CardProps) {
  const pubDateStr = formatPubDate(pubDate);

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={styles.card}>
      <img
        src="https://placehold.co/96x64?text=IMG"
        alt="thumb"
        width={96}
        height={64}
        style={{ flexShrink: 0, borderRadius: 4, objectFit: "cover" }}
      />
      <div style={{ marginLeft: 12, flex: 1 }}>
        <h2 style={styles.cardTitle}>{title}</h2>
        <div style={styles.meta}>{pubDateStr}</div>
      </div>
    </a>
  );
}

// ―――――――――――― simple inline CSS objects ――――――――――――
const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans JP', sans-serif",
    maxWidth: 680,
    margin: "0 auto",
    padding: 16,
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  date: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    display: "flex",
    textDecoration: "none",
    color: "inherit",
    padding: 8,
    borderBottom: "1px solid #eee",
    borderRadius: 4,
    transition: "background-color 0.15s",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
    margin: 0,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  loadMoreButton: {
    padding: "8px 16px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #ccc",
    background: "#fff",
  },
};
