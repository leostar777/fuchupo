import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell } from "lucide-react";
import { useNews } from "@/lib/useNews"; // fetch(import.meta.env.BASE_URL + 'news.json') に合わせてパス修正済み

/**
 * ふちゅぽ PWA スケルトン  (rev4)
 * 変更点──────────────────────────────────────
 * ✓ NewsHome() を useNews() 実データ版に差し替え
 */

// ------------------------------------- タイプ定義 -------------------------------------
export type TabId = "news" | "fire" | "crime" | "event" | "council";

interface TabMeta {
  id: TabId;
  label: string;
  enabled: boolean;
}

const allowedTabIds: TabId[] = ["news", "fire", "crime", "event", "council"];

const defaultTabs: TabMeta[] = [
  { id: "news", label: "ニュース", enabled: true },
  { id: "fire", label: "火事", enabled: true },
  { id: "crime", label: "不審者", enabled: true },
  { id: "event", label: "イベント", enabled: true },
  { id: "council", label: "市議会", enabled: true },
];

// -------------------------------------- ルート App --------------------------------------
export default function FuchupoApp() {
  const [tabs, setTabs] = useState<TabMeta[]>(() => {
    const saved = localStorage.getItem("fuchupo.tabs");
    let data: TabMeta[] = saved ? (JSON.parse(saved) as TabMeta[]) : defaultTabs;
    data = data.filter((t) => allowedTabIds.includes(t.id));
    return data.length ? data : defaultTabs;
  });

  const [active, setActive] = useState<TabId>("news");
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("fuchupo.theme") ?? "light");

  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const [weather] = useState<{ icon: string; temp: string }>({ icon: "☀️", temp: "24°C" });

  useEffect(() => {
    localStorage.setItem("fuchupo.tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fuchupo.theme", theme);
  }, [theme]);

  const datetimeStr = now.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const showNotifications = () => {};
  const openTabEditor = () => {};

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex items-center justify-between px-4 h-16 border-b border-[var(--border)]">
        <h1 className="font-bold text-lg">ふちゅぽ</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{datetimeStr}</span>
          <span>
            {weather.icon} {weather.temp}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={showNotifications} aria-label="通知">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}> {theme === "light" ? <Moon /> : <Sun />} </Button>
          <Button variant="ghost" size="icon" onClick={openTabEditor}>⋯</Button>
        </div>
      </header>

      <Tabs value={active} onValueChange={(v) => setActive(v as TabId)} className="border-b border-[var(--border)]">
        <TabsList className="flex overflow-x-auto whitespace-nowrap">
          {tabs.filter((t) => t.enabled).map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="px-4 py-2">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <main className="flex-1 overflow-y-auto p-4">
        {active === "news" && <NewsHome />}
        {/* TODO: other tab content */}
      </main>
    </div>
  );
}

// ----------------------------------- コンポーネント群 -----------------------------------
function NewsHome() {
      const news = useNews();
  if (!news.length) return <p>Loading…</p>;

  return (
    <>
      {news.map((n, idx) => (
        <NewsCard key={idx} title={n.title} time={new Date(n.pubDate).toLocaleTimeString()} />
      ))}
    </>
  );
}

function NewsCard({ title, time }: { title: string; time: string }) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold mb-1 text-base">{title}</h2>
            <p className="text-xs text-gray-500">{time}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="コメント">
            💬
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* Tests remain unchanged */
