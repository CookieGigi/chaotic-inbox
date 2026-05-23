# Phase 4: Search

**Goal**: Full-text search (PostgreSQL FTS) + semantic search (pgvector embeddings). Served through API, CLI, and Web UI.

## Dependencies

- Phase 1 (Domain Model + Database + Core API) — database schema and API structure
- Phase 2 (CLI — Capture & Browse) — for `inbox search` command
- Phase 3 (Web UI — Capture & Feed) — for search bar and results page

## Tasks

| # | Feature | Detail |
|---------|---------|--------|
| 4.1 | FTS infrastructure | Verify (from Phase 1 migration): `search_vector` tsvector column on `items`, GIN index `idx_items_search_vector`, trigger function `items_search_vector_trigger` that auto-updates on insert/update. The trigger concatenates `raw` + `metadata->>'title'` + `metadata->>'description'` into a single `to_tsvector('english', ...)` call. |
| 4.2 | Search query builder | `server/search/` module. `GET /v1/items/search?q=<query>&mode=fts|hybrid|semantic&limit=20&cursor=<cursor>`. **FTS mode**: `plainto_tsquery('english', query)` against `search_vector`, order by `ts_rank(search_vector, query) DESC`. **Semantic mode**: compute query embedding (384-dim) using ONNX model, then `SELECT * FROM items ORDER BY embedding <=> query_embedding LIMIT limit OFFSET offset`. **Hybrid mode**: combine both scores. Formula: `score = 0.7 * fts_rank_normalized + 0.3 * (1 - cosine_distance)`. Order by combined score DESC. |
| 4.3 | Query embedding endpoint | When `mode=semantic` or `mode=hybrid`, the server must embed the user's query text. Load `all-MiniLM-L6-v2` ONNX model at startup using `ort` crate. Model path: `./models/all-MiniLM-L6-v2.onnx` (or env `ONNX_MODEL_PATH`). Tokenization: use `tokenizers` crate with the model's tokenizer config. Encode query → run ONNX inference → get 384-dim float vector. Cache in LRU for 5 minutes to avoid re-embedding identical queries. |
| 4.4 | Search API response | Same `Item` JSON shape as list endpoint, plus `_score` (float, relevance score) and `_rank` (integer, 1-based position). Pagination: cursor-based on rank (or offset-based for simplicity with search). `limit` default 20, max 100. `offset` query param as alternative to cursor. |
| 4.5 | `inbox search` CLI | `inbox search "database backup" --mode hybrid --limit 10` → GET `/v1/items/search?q=database%20backup&mode=hybrid&limit=10`. Render results: type icon, truncated content with query terms **bold** (or underline), relevance score (e.g., "92%"). `--json` flag: raw JSON array with `_score` and `_rank`. `--mode fts|hybrid|semantic` (default: `fts`). `--highlight` flag: colorize matching terms in terminal output. |
| 4.6 | Web UI search bar | `<SearchBar>` component: fixed at top of feed or in header. `Cmd+K` / `Ctrl+K` keyboard shortcut opens search (focuses input). Input with magnifying glass icon. Debounced input: 300ms delay before firing search query. `useSearchQuery` hook: `useQuery` against `/v1/items/search`. Results replace feed in-place: same `<Feed>` component but data comes from search instead of list. Each result block highlights matching terms (bold or background color `--color-accent` at 20% opacity). Clear button (X) returns to full feed. Search params persisted in URL: `?q=...&mode=...`. |
| 4.7 | Search filters | Extend search endpoint with `type` filter: `GET /v1/items/search?q=...&type=text|url|image|file`. CLI: `--type` flag. Web UI: small filter chips below search bar. |
| 4.8 | Search performance | Target: < 200ms for FTS on 10,000 items. < 500ms for semantic on 10,000 items. Hybrid may be slower but < 1s. Add `EXPLAIN ANALYZE` tests to assert index usage (GIN for FTS, IVFFlat for vector). |

## Human Test Checklist

- [ ] Start server. Seed 20 items with varied topics: some about databases ("postgres", "migration", "backup"), some about music ("guitar", "chords", "song"), some random.
- [ ] `inbox search "postgres"` → returns database-related items, no music items.
- [ ] `inbox search "guitar" --mode semantic` → returns music items (even if the word "guitar" doesn't appear but "instrument" or "chords" do).
- [ ] `inbox search "database" --mode hybrid` → database items ranked higher than in pure FTS, with score shown.
- [ ] `inbox search "music" --json | jq '.[0]._score'` → valid JSON, score is a number.
- [ ] Open Web UI. Press `Cmd+K` → search bar focused.
- [ ] Type "backup" → results appear after 300ms debounce, database items highlighted.
- [ ] Clear search (click X) → full feed restored.
- [ ] Search URL: `?q=backup&mode=fts` → shareable, reloads with same results.
- [ ] Search with type filter: `?q=note&type=text` → only text items about "note".
- [ ] Verify search latency feels instant (< 300ms visual feedback).

## Auto Test Checklist

- [ ] FTS integration test: seed DB with items containing known words → search for word → assert all matching items returned, non-matching excluded. Test stemming: "run" matches "running".
- [ ] Semantic search test: seed with items about "cats" and "cars". Search "feline" → assert cat items ranked above car items.
- [ ] Hybrid ranking test: seed with items. Search query that matches both FTS and semantic. Assert hybrid score is between pure FTS and pure semantic extremes.
- [ ] Query embedding test: embed "hello world" → assert output vector has length 384, values are normalized (unit vector).
- [ ] ONNX model load test: assert model loads at startup, inference succeeds on sample text.
- [ ] Cache test: search same query twice → second request uses cached embedding, faster.
- [ ] Pagination test: search with limit=5, assert 5 results, has next page.
- [ ] CLI test: `inbox search "term"` → assert GET request to `/v1/items/search?q=term`.
- [ ] Web UI test: `<SearchBar>` debounce: type "abc" → wait 300ms → assert search query fired. Clear → assert feed restored.
- [ ] Performance benchmark: create 10,000 items via script, run search, assert response time < 200ms (FTS) and < 500ms (semantic). Use `criterion` or `hyperfine`.

## Deliverable

Search works end-to-end across all three interfaces: API (via GET /v1/items/search), CLI (`inbox search`), and Web UI (Cmd+K search bar). FTS is fast. Semantic search finds conceptually related items. Hybrid mode balances both.
