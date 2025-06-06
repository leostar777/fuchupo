### 自動更新
GitHub Actions (`ingest` workflow) が 1 時間ごとに RSS を取り込み\
`public/news.json` を更新 → main に Auto-commit → build → gh-pages へ公開。

### Article JSON Schema

```jsonc
{
  "title":       "string",
  "link":        "string",
  "pubDate":     "RFC-822 string",
  "description": "string | undefined",
  "creator":     "string | undefined",
  "categories":  ["string", ...] | undefined,
  "shortTitle":  "<=15 chars",
  "aiNote":      "<=2 lines"
}
