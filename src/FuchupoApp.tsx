import { useEffect, useState } from "react";

/**
 * FuchupoApp – ニュースカードの見栄えを Yahoo! ニュース風に刷新
 * -----------------------------------------------------------------
 * - 外部依存 (./lib/useNews) を廃止し、このファイル内に `useNews` を実装
 * - 左サムネ（ダミー）＋右テキストの横並びカード
 * - Vite 環境のみで完結（追加モジュール不要）
 */

// ───────── 型定義 & フック ─────────
interface Article {
  title: string;
  link: string;
  pubDate: string;
}

function useNews(): Article[] {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // GitHub Pages では base が "/fuchupo/" になるため import.meta.env.BASE_URL を使用
    fetch(import.meta.env.BASE_URL + "/news.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error);
  }, []);

  return articles;
}

// ───────── ルートコンポーネント ─────────
export default function FuchupoApp() {
  const news = useNews();
  const [now, setNow] = useState(() => new Date());

  // 1 分おきに時計を更新
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const datetimeStr = now.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div style={styles.root}>
      {/* ───────── Header */}
      <header style={styles.header}>
        <strong style={{ fontSize: 20 }}>ふちゅぽ</strong>
        <span style={{ fontSize: 12, color: "#666" }}>{datetimeStr} / ☀️24°C</span>
      </header>

      {/* ───────── News list */}
      <main>
        {!news.length && <p>Fetching…</p>}
        {news.map((n, idx) => (
          <NewsCard key={idx} title={n.title} link={n.link} time={n.pubDate} />
        ))}
      </main>
    </div>
  );
}

// ───────── 子コンポーネント / Card ─────────
interface CardProps {
  title: string;
  link: string;
  time: string;
}

function NewsCard({ title, link, time }: CardProps) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={styles.card}>
      {/* 左サムネ（ダミー画像） */}
      <img
        src="https://placehold.co/96x64?text=IMG"
        alt="thumb"
        width={96}
        height={64}
        style={{ flexShrink: 0, borderRadius: 4, objectFit: "cover" }}
      />
      {/* 右テキスト */}
      <div style={{ marginLeft: 12, flex: 1 }}>
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.meta}>{new Date(time).toLocaleTimeString()}</div>
      </div>
    </a>
  );
}

// ───────── simple inline CSS objects ─────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans JP', sans-serif",
    maxWidth: 680,
    margin: "0 auto",
    padding: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  title: {
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
};
