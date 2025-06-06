import { useEffect, useState } from "react";
import { useNews, Article } from "./lib/useNews";

// ---- 日付フォーマット補助 ----
function formatRelative(pubDate: string): string {
  const now = new Date();
  const pub = new Date(pubDate);
  const diffH = Math.floor((now.getTime() - pub.getTime()) / 3_600_000);
  if (diffH < 12) return `${diffH}時間前`;

  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  return formatter.format(pub);
}

// ---- ルートコンポーネント ----
export default function FuchupoApp() {
  const news = useNews();
  const [now, setNow] = useState(() => new Date());
  const [visible, setVisible] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayStr = now.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  return (
    <div style={styles.root}>
      {/* ---------- Header ---------- */}
      <header style={styles.header}>
        <strong style={styles.logo}>ふちゅぽ</strong>
        <span style={styles.today}>
          {todayStr} &nbsp;☀️24°C
        </span>
      </header>

      {/* ---------- News list ---------- */}
      <main style={{ marginTop: 80 }}>
        {!news.length && <p>Fetching…</p>}
        {news.slice(0, visible).map((n, idx) => (
          <NewsCard key={n.link} item={n} short={idx < 7} />
        ))}

        {visible < news.length && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button style={styles.more} onClick={() => setVisible((v) => v + 30)}>
              もっと見る
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ---- 子コンポーネント ----
function NewsCard({ item, short }: { item: Article; short: boolean }) {
  const title = short ? item.shortTitle ?? item.headline : item.headline;

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" style={styles.card}>
      <img
        src="https://placehold.co/96x64?text=IMG"
        alt=""
        width={96}
        height={64}
        style={{ flexShrink: 0, borderRadius: 4, objectFit: "cover" }}
      />
      <div style={{ marginLeft: 12, flex: 1 }}>
        <h2 style={styles.cardTitle}>{title}</h2>
        <div style={styles.meta}>
          {item.publisher} ・ {formatRelative(item.pubDate)}
        </div>
      </div>
    </a>
  );
}

// ---- styles ----
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
  logo: { fontSize: 20, fontWeight: "bold" },
  today: { fontSize: 16, color: "#333" },
  card: {
    display: "flex",
    textDecoration: "none",
    color: "inherit",
    padding: 8,
    borderBottom: "1px solid #eee",
    borderRadius: 4,
    transition: "background-color 0.15s",
  },
  cardTitle: { fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: 0 },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
  more: {
    padding: "8px 16px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #ccc",
    background: "#fff",
  },
};
