import { useEffect, useState } from "react";

// ─────────── 型定義 & フック ───────────
interface Article {
  /** 元のタイトル全文（変換前） */
  rawTitle: string;
  /** 掲載元名（Yahoo!ニュース など） */
  publisher: string;
  /** Google の余計な接尾辞を除いた見出し */
  headline: string;
  /** ISO 形式の日付文字列 */
  pubDate: string;
  /** 記事リンク */
  link: string;
}

/**
 * useNews – build で生成された `news.json` を取得し、pubDate が新しい順で返す
 */
function useNews(): Article[] {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/fuchupo/news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Article[]) => {
        const sorted = data.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setArticles(sorted);
      })
      .catch(console.error);
  }, []);

  return articles;
}

/**
 * 時刻の表示を「●時間前 / 今日 6/6(金) / 昨日」などにフォーマット
 */
function formatPubDate(pubDate: string): string {
  const now = new Date();
  const pub = new Date(pubDate);
  const diffH = Math.floor((now.getTime() - pub.getTime()) / 3_600_000);

  if (diffH < 12) return `${diffH}時間前`;

  // 当日
  if (now.toDateString() === pub.toDateString()) {
    return pub.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
  }

  // 昨日
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (yest.toDateString() === pub.toDateString()) return "昨日";

  return pub.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
}

// ─────────── ルートコンポーネント ───────────
export default function FuchupoApp() {
  const news = useNews();
  const [now, setNow] = useState(() => new Date());
  const [visible, setVisible] = useState(30);

  // ヘッダー日付用
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayStr = now.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit", weekday: "short" });

  return (
    <div style={styles.root}>
      {/* Header (fixed) */}
      <header style={styles.header}>
        <strong style={styles.logo}>ふちゅぽ</strong>
        <span style={styles.date}>{todayStr} ☀️24°C</span>
      </header>

      {/* News list */}
      <main style={{ marginTop: 80 }}>
        {!news.length && <p>Fetching…</p>}
        {news.slice(0, visible).map((n) => (
          <NewsCard
            key={n.link}
            title={n.headline || n.rawTitle || (n as any).title}
            publisher={n.publisher || ""}
            pubDate={n.pubDate}
            link={n.link}
          />
        ))}
        {visible < news.length && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button style={styles.moreBtn} onClick={() => setVisible((v) => v + 30)}>
              もっと見る
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────── 子 / NewsCard ───────────
interface CardProps {
  title: string;
  publisher: string;
  pubDate: string;
  link: string;
}

function NewsCard({ title, publisher, pubDate, link }: CardProps) {
  const timeLabel = formatPubDate(pubDate);
  const meta = publisher ? `${publisher} ・ ${timeLabel}` : timeLabel;

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
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.meta}>{meta}</div>
      </div>
    </a>
  );
}

// ─────────── CSS in JS ───────────
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
  date: { fontSize: 16, color: "#333" },
  card: {
    display: "flex",
    textDecoration: "none",
    color: "inherit",
    padding: 8,
    borderBottom: "1px solid #eee",
    borderRadius: 4,
    transition: "background-color 0.15s",
  },
  title: { fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: 0 },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
  moreBtn: {
    padding: "8px 16px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid #ccc",
    background: "#fff",
  },
};
