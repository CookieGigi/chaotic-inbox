# Phase 5: Background Enrichment Pipeline

**Goal**: Async background processing: URL metadata fetching, embedding generation, rule-based categorization, LLM summarization. Items get richer over time after capture.

## Dependencies

- Phase 1 (Domain Model + Database + Core API) — `items` table, `job_queue` table
- Phase 4 (Search) — embedding generation already implemented for query embedding; reuse model for item embeddings

## Tasks

| # | Feature | Detail |
|---------|---------|--------|
| 5.1 | Job queue engine | `server/queue/` module. In-process worker pool. Config: `WORKER_COUNT` env var (default 4, max 8). Workers run in separate Tokio tasks. Polling SQL: `SELECT * FROM job_queue WHERE status = 'pending' AND scheduled_at <= now() ORDER BY priority DESC, created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1`. Worker claims job → updates `status='running', started_at=now()` → executes → on success `status='done', completed_at=now()` → on error `status='failed', last_error=..., attempts=attempts+1, scheduled_at=now() + backoff`. Exponential backoff: 5s * (2^attempts), capped at 1 hour. Max attempts: 3. After max attempts → `status='failed'`, stays in table (dead-letter). Dead-letter view: `SELECT * FROM job_queue WHERE status='failed' AND attempts >= max_attempts`. Admin endpoint (future): `GET /v1/admin/dead-letter`. |
| 5.2 | Enqueue on capture | In `POST /v1/items` handler, after successful insert: transactionally insert jobs into `job_queue`. Jobs per item: (1) `url_metadata` (if `type='url'`), (2) `embedding` (always), (3) `categorization` (always), (4) `summarization` (optional, if LLM configured). Job payload JSONB contains `item_id`. Priority: `url_metadata` = 10 (highest, user-visible), `embedding` = 5, `categorization` = 3, `summarization` = 1 (lowest). |
| 5.3 | URL metadata enrichment | `server/enrichment/url.rs`. Worker fetches URL using `reqwest` (timeout 30s, follow redirects up to 5, max body size 1MB). Parses HTML with `scraper` (or `html5ever` + `select`). Extracts: `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<link rel="icon" href="...">`, `<title>`. Stores in `items.metadata`: `{ "title": "...", "description": "...", "image": "...", "favicon": "..." }`. Updates `enrichment_status.url`: `pending` → `running` → `done` or `failed`. On failure (connection error, timeout, non-HTML): `last_error` stored, retry via backoff. |
| 5.4 | Embedding generation (item) | `server/enrichment/embedding.rs`. Worker loads `all-MiniLM-L6-v2` ONNX model (same as Phase 4, shared model singleton). Tokenizes item `raw` content (truncate to 256 tokens). Runs inference. Stores 384-dim float vector in `items.embedding`. Updates `enrichment_status.embedding`. Batch processing: workers can group up to 32 pending embedding jobs and run a single ONNX batch inference for efficiency. |
| 5.5 | Rule-based categorization | `server/enrichment/categorization.rs`. Keyword/pattern matching rules. Rules defined in TOML file (`config/categories.toml`) or code constants. Example rules: `sql|database|postgres|migration|schema` → category "Database", tags ["sql", "data"]. `rust|cargo|tokio|axum|async` → category "Rust", tags ["programming", "rust"]. `recipe|cook|bake|ingredient|dish` → category "Cooking", tags ["food", "recipe"]. Matching: case-insensitive regex on `raw` + `metadata.title` + `metadata.description`. Categories and tags are upserted (create if missing, link to item). Updates `enrichment_status.categorization`. |
| 5.6 | LLM summarization | `server/enrichment/summarization.rs`. Optional feature. Configuration: `LLM_ENABLED=true`, `LLM_URL=http://localhost:11434` (Ollama API), `LLM_MODEL=llama3.2`. Worker sends POST to LLM API with prompt: "Summarize the following text in one sentence: {content}". Stores response in `items.metadata.summary`. Updates `enrichment_status.summarization`. If LLM not configured or request fails → skip (status `skipped`, no retry). |
| 5.7 | Enrichment status API | Extend `GET /v1/items/:id` to include full `enrichment_status` in response body. Add `GET /v1/items/:id/enrichment` — lightweight endpoint returning only `{ "url": "done", "embedding": "running", "categorization": "pending", "summarization": "skipped" }` and per-track `last_error`. Web UI polls this endpoint every 2 seconds for items with non-done tracks. |
| 5.8 | Worker health | `GET /health` (already exists) extended with worker pool status: `{ "workers": { "total": 4, "busy": 2, "idle": 2 }, "queue": { "pending": 10, "running": 2, "failed": 1 } }`. |

## Human Test Checklist

- [ ] Start server with `WORKER_COUNT=2`.
- [ ] Capture a URL: `inbox add https://github.com/rust-lang/rust`.
- [ ] Wait 3-10 seconds. `inbox info {id}` → `metadata.title` contains "Rust", `metadata.description` is non-empty. `enrichment_status.url` = `done`.
- [ ] Capture some text: `inbox add "This is a recipe for sourdough bread. You need flour, water, salt, and starter. Mix and bake."`.
- [ ] Wait 5-15 seconds. `inbox info {id}` → `enrichment_status.embedding` = `done`. `enrichment_status.categorization` = `done`. Categories include "Cooking", tags include "recipe".
- [ ] Search for "bread recipe" → the item appears (semantic search works because embedding was generated).
- [ ] If LLM configured: `enrichment_status.summarization` = `done`, `metadata.summary` is a one-sentence summary.
- [ ] Check worker health: `curl localhost:8080/health` → shows queue stats.
- [ ] Stop server mid-processing. Restart. Workers resume from pending jobs — no jobs lost.
- [ ] Intentionally break URL fetch (e.g., capture `https://this-domain-does-not-exist-12345.com`). Wait for 3 retries. `enrichment_status.url` = `failed`, `last_error` contains "connection error".
- [ ] Web UI: capture a URL → block shows "Fetching metadata..." (spinner or text). After a few seconds, title and description appear. If fails, shows error indicator.

## Auto Test Checklist

- [ ] Job queue unit test: insert job → poll → assert claimed → complete → assert status done.
- [ ] Retry test: insert job with failing executor → assert attempts increment, backoff increases (5s, 25s, 125s), after max attempts → status failed.
- [ ] Dead-letter test: 3 failed jobs → query dead-letter view → returns 3 items.
- [ ] URL enrichment test: mock HTTP server (wiremock) returns HTML with og:title. Worker processes → assert metadata.title correct. Test timeout: mock server hangs → assert status failed after timeout.
- [ ] Embedding test: seed item with text "machine learning" → worker runs → assert `items.embedding` is 384-dim float array. Assert vector is normalized (L2 norm ≈ 1.0).
- [ ] Categorization test: seed item with text about "postgres database migration" → worker runs → assert item linked to "Database" category and "sql" tag.
- [ ] Summarization test: mock LLM server (wiremock) returns "Summary text" → assert `metadata.summary` equals response.
- [ ] Batch embedding test: seed 10 items → worker processes in batch (≤32 per batch) → assert all embeddings generated in single ONNX call.
- [ ] Concurrent worker test: 4 workers, 20 pending jobs → assert no duplicate processing (each job done exactly once).
- [ ] Enqueue on capture test: POST new item → assert 1-3 jobs created in `job_queue` with correct `item_id`.
- [ ] Web UI polling test: mock enrichment endpoint, assert component re-renders when status changes from `pending` to `done`.

## Deliverable

Background workers enrich every captured item automatically. URLs get metadata. All items get embeddings (enabling search). Items get categorized and tagged. Optional AI summarization. The queue is resilient (retry, dead-letter). Status is observable via API and UI.
