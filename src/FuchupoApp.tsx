import { useState } from "react";
import { useNews } from "./lib/useNews"; // ルート基準の相対パスに変更

/**
 * FuchupoApp ― 依存ライブラリを一切使わない最小実装
 * ------------------------------------------------------
 * - ヘッダーに日時・天気（ダミー）を横並び表示
 * - ニュース JSON を読み込んで一覧表示
 * ※ shadcn/ui や lucide-react が無くてもビルドが通るよう、純粋な HTML 要素だけで構築
 */

export default function FuchupoApp() {
  const [now, setNow] = useState(() => new Date());
  const news = useNews();

  // simple 1‑minute timer for clock
  useState(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  });

  const datetimeStr = now.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <strong>ふちゅぽ</strong>
        <span style={{ fontSize: 12 }}>{datetimeStr} / ☀️24°C</span>
      </header>

      {/* News list */}
      <main>
        {!news.length && <p>Loading…</p>}
        {news.map((n, idx) => (
          <article key={idx} style={{ marginBottom: 12 }}>
            <a href={n.link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold" }}>
              {n.title}
            </a>
            <div style={{ fontSize: 12, color: "gray" }}>{new Date(n.pubDate).toLocaleTimeString()}</div>
          </article>
        ))}
      </main>
    </div>
  );
}
