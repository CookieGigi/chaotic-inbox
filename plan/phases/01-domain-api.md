# Phase 1: Domain Model + Database + Core API

**Goal**: Shared domain types, migration-backed schema, and full CRUD API for items. This is the server-side foundation every other phase depends on.

## Dependencies

- Phase 0 (Technical Stack Foundation) must be complete and passing.

## Tasks

| # | Feature | Detail |
|---|---------|--------|
| 1.1 | `crates/domain/` | Zero-dependency crate. Core types: `Item` (id: UUID, captured_at: DateTime<Utc>, type: ItemType, raw: String, metadata: JsonValue, embedding: Option<Vec<f32>>, enrichment_status: JsonValue, created_at, updated_at). Discriminated `ItemType` enum: `Text`, `Url`, `Image`, `File`. Metadata structs: `TextMetadata` (kind: TextKind, word_count), `UrlMetadata` (url, title, favicon, og_title, og_description), `ImageMetadata` (width, height, alt, mime_type), `FileMetadata` (filename, filesize, mime_type, kind: FileKind). `Tag` (id, name), `Category` (id, name), `EnrichmentStatus` (per-track: pending/running/done/failed/skipped). Factory functions: `Item::from_text(raw)`, `Item::from_url(url)`, `Item::from_image(...)`, `Item::from_file(...)`. |
| 1.2 | Database schema | `server/migrations/0001_init.sql` (or subsequent migration if 0001 already exists from Phase 0): `CREATE EXTENSION IF NOT EXISTS pgvector; CREATE EXTENSION IF NOT EXISTS pg_trgm;`. Custom enums: `item_type` (`text`, `url`, `image`, `file`), `job_type`, `job_status`. `items` table with all fields. Indexes: `idx_items_captured_at` (BTREE on captured_at), `idx_items_type` (BTREE on type), `idx_items_search_vector` (GIN on search_vector), `idx_items_embedding` (IVFFlat on embedding using cosine). FTS trigger function: `items_search_vector_trigger` — on INSERT/UPDATE of items, sets `search_vector = to_tsvector('english', raw || ' ' || COALESCE(metadata->>'title','') || ' ' || COALESCE(metadata->>'description',''))`. |
| 1.3 | `server/storage/` | `Storage` async trait in `server/src/storage/mod.rs`. Methods: `create_item(&self, item: &Item) -> Result<Item>`, `get_item(&self, id: Uuid) -> Result<Option<Item>>`, `list_items(&self, cursor: Option<DateTime<Utc>>, limit: u32) -> Result<Vec<Item>>` (ordered by captured_at ASC, cursor-based pagination), `update_item(&self, id: Uuid, patch: ItemPatch) -> Result<Option<Item>>`, `delete_item(&self, id: Uuid) -> Result<bool>`. Postgres implementation using `sqlx::PgPool`. Blob storage trait: `BlobStorage` with `store_blob`, `get_blob`, `delete_blob`. Filesystem impl at `/var/lib/inbox/blobs/` (configurable via env `BLOB_STORAGE_PATH`). Paths: `{uuid}/{filename}` or content-addressable by UUID. |
| 1.4 | `server/api/` axum router | `axum` app with `Arc<AppState>` containing `PgPool`. Routes: `POST /v1/items` (JSON body: raw, type, optional metadata), `GET /v1/items` (query: cursor (ISO8601), limit (default 20, max 100), type filter), `GET /v1/items/:id`, `PATCH /v1/items/:id` (JSON body: any subset of raw/metadata fields), `DELETE /v1/items/:id`, `GET /health`. All endpoints return JSON. `ApiError` enum implementing `IntoResponse` with consistent shape: `{ "code": "string", "message": "string", "details": Option<serde_json::Value> }`. HTTP status codes: 201 created, 200 ok, 400 bad request, 404 not found, 422 unprocessable entity, 500 internal error. `utoipa` annotations on all handlers → `/docs` served by `utoipa-swagger-ui` (or `utoipa-redoc` as alternative). |
| 1.5 | Tracing & logging | `tracing-subscriber` with `EnvFilter` (RUST_LOG env var). `tower-http::trace::TraceLayer` on axum app — log method, path, status, latency. Structured JSON logs when `RUST_LOG=json`. Request IDs via `tower-request-id`. |
| 1.6 | Configuration | `config` crate or manual TOML parsing. Read from `~/.config/inbox/server.toml` and env vars. Config keys: `database_url`, `bind_address` (default 0.0.0.0:8080), `blob_storage_path`, `log_level`, `max_body_size`. |

## Human Test Checklist

- [ ] `docker compose up`, then `curl -X POST -H 'Content-Type: application/json' localhost:8080/v1/items -d '{"raw":"hello world","type":"text"}'` → returns `201` with item JSON containing `id`, `captured_at`, `type: "text"`, `raw: "hello world"`, `metadata: {}`, `enrichment_status: {}`
- [ ] `curl localhost:8080/v1/items` → returns array with the created item
- [ ] `curl localhost:8080/v1/items/{id}` → returns the single item
- [ ] `curl -X PATCH -H 'Content-Type: application/json' localhost:8080/v1/items/{id} -d '{"raw":"updated text"}'` → returns updated item
- [ ] `curl -X DELETE localhost:8080/v1/items/{id}` → returns `204`
- [ ] `curl localhost:8080/v1/items/{id}` after delete → returns `404` with JSON error
- [ ] Create 25 items, `GET /v1/items?limit=10` → returns 10 items, check `Link` header or cursor in response body for pagination
- [ ] `curl localhost:8080/docs` → interactive OpenAPI / Swagger UI loads
- [ ] `curl localhost:8080/health` → returns `{"status":"ok"}`
- [ ] Check Postgres: `docker exec -it inbox_postgres psql -U inbox -c "SELECT * FROM items;"` → rows present

## Auto Test Checklist

- [ ] Unit tests for domain factory functions: `Item::from_text`, `Item::from_url` — assert correct type, metadata defaults
- [ ] Unit tests for type detection: `detect_type("https://example.com")` → `Url`, `detect_type("hello world")` → `Text`
- [ ] Integration test: create item via repository → assert exists in DB with correct fields
- [ ] API integration test (using `axum::Server` or `tower::ServiceExt::oneshot`): POST item → GET item → PATCH item → GET item → DELETE item → GET 404
- [ ] Pagination test: create 50 items → `GET /v1/items?limit=20` → assert 20 items, has next cursor → follow cursor → assert next 20, no more
- [ ] Error handling test: POST invalid JSON → 400 with error body. GET non-existent UUID → 404. PATCH with invalid field → 422.
- [ ] OpenAPI spec validation: generate spec from `utoipa`, validate against OpenAPI 3.0 schema using `schemars` or `openapi-schema-validator`
- [ ] Blob storage test: store a file blob, retrieve it, assert content matches, delete it, assert gone

## Deliverable

A running API server with full CRUD for items, persistent in PostgreSQL with pgvector, documented with OpenAPI. The `crates/domain/` crate is reusable by CLI and any future clients.
