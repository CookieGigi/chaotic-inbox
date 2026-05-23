# Phase 6: Management & Export

**Goal**: Tag/category CRUD, backup/export/import, stats, and settings. The polishing and administration layer.

## Dependencies

- Phase 1 (Domain Model + Database + Core API) — tags/categories tables and API foundation
- Phase 2 (CLI — Capture & Browse) — for management CLI commands
- Phase 3 (Web UI — Capture & Feed) — for settings UI
- Phase 4 (Search) — for filtering by tags/categories
- Phase 5 (Enrichment) — for stats endpoint data

## Tasks

| # | Feature | Detail |
|---------|---------|--------|
| 6.1 | Tags API | `GET /v1/tags` → list all tags with usage count. `POST /v1/tags` → create tag `{ "name": "rust" }`. `DELETE /v1/tags/:id` → delete tag (cascade unlink from items). `POST /v1/items/:id/tags` → link tag to item `{ "tag_id": "..." }` or `{ "tag_name": "rust" }` (auto-create if missing). `DELETE /v1/items/:id/tags/:tag_id` → unlink. `GET /v1/items?tag=rust` → filter items by tag (already works via list endpoint). |
| 6.2 | Categories API | Same pattern as tags: `GET /v1/categories`, `POST /v1/categories`, `DELETE /v1/categories/:id`, `POST /v1/items/:id/categories`, `DELETE /v1/items/:id/categories/:category_id`, `GET /v1/items?category=devops`. |
| 6.3 | Export endpoint | `GET /v1/export?format=json` → streaming JSON response. Array of items with all fields (including metadata, enrichment_status, tags, categories). `format=markdown` → each item as Markdown section: `# Item {short_id}

**Type:** {type}
**Captured:** {date}
**Content:** {raw}
**Tags:** {tags}
**Categories:** {categories}`. `format=csv` → CSV with columns: id, captured_at, type, raw, metadata_json, tags, categories. Query param `tag=true` and `category=true` include tags/categories in export (default true). Response header `Content-Disposition: attachment; filename="inbox-export-YYYY-MM-DD.{ext}"`. |
| 6.4 | Import endpoint | `POST /v1/import` accepts JSON body (matching export format). Transaction: bulk insert items, upsert tags/categories, link junctions. Deduplication: skip items where `id` already exists (or update if `?strategy=upsert`). Returns `{ "created": N, "skipped": M, "errors": [...] }`. Validates each item: required fields (id, captured_at, type, raw). Invalid items collected in errors array, don't fail the whole import. Max import size: 10MB body. |
| 6.5 | Stats endpoint | `GET /v1/stats` returns: `{ "total_items": N, "items_by_type": { "text": N1, "url": N2, "image": N3, "file": N4 }, "storage_bytes": N, "enrichment_coverage": { "url": 0.85, "embedding": 0.92, "categorization": 0.88, "summarization": 0.45 }, "oldest_item": "ISO8601", "newest_item": "ISO8601", "total_tags": N, "total_categories": N }`. Storage bytes: sum of blob sizes (query filesystem or track in DB). Enrichment coverage: ratio of `done` status / total items for each track. |
| 6.6 | CLI management | `inbox tag list` → all tags with counts. `inbox tag add <item_id> <tag_name>` → link or create. `inbox tag remove <item_id> <tag_name>` → unlink. `inbox category list/add/remove` → same pattern. `inbox export --format json > backup.json` → download export. `inbox export --format markdown` → stdout. `inbox import backup.json` → upload, show summary. `inbox stats` → print formatted stats table. |
| 6.7 | Web UI settings | `<SettingsMenu>` floating gear icon (top-right of feed, or bottom bar). `<SettingsModal>`: sections — **Appearance**: accent color picker (8 Catppuccin accent chips: Teal, Lavender, Sapphire, Mauve, Pink, Sky, Peach, Green). Click chip → `--color-accent` CSS variable updates on `<html>` element, persisted in `localStorage`. **Backup**: "Export" button triggers download (GET /v1/export?format=json). "Import" button → file picker → POST /v1/import → shows progress toast with results. **Storage**: usage bar (used / total), item count by type (mini bar chart). **Enrichment**: coverage percentages per track (mini progress bars). **About**: version, API URL, links to docs. |
| 6.8 | Web UI tag/category bar | Each block shows its tags as small chips (`<span>` with rounded corners, `--color-border` border, `--color-text-muted` text). Click tag chip → feed filters to only items with that tag (navigate to `?tag=rust`). Category shown as subtle label above tags. Inline tag management: in block action menu, "Add tag" → input with autocomplete (existing tags). "Remove tag" → click X on chip. |
| 6.9 | Migration bridge | Utility script or endpoint to import from old browser-only app. Accepts Dexie export JSON format (from old app's backup). Maps old schema to new schema. Run once during migration. Documented in `docs/migration.md`. |

## Human Test Checklist

- [ ] `inbox tag list` → shows all tags with counts.
- [ ] `inbox tag add {item_id} rust` → tag appears on item. `inbox info {item_id}` → shows tag "rust".
- [ ] `inbox tag remove {item_id} rust` → tag gone.
- [ ] `inbox category add {item_id} Programming` → category appears.
- [ ] `inbox export --format json > export.json` → file contains all items, valid JSON.
- [ ] `inbox export --format markdown` → readable Markdown output.
- [ ] Delete all items (or use fresh DB). `inbox import export.json` → shows summary: `{created: N, skipped: 0}`. `inbox list` → all items restored.
- [ ] Run import again on same DB → `{skipped: N, created: 0}` (deduplication works).
- [ ] `inbox stats` → table shows correct counts, enrichment coverage percentages.
- [ ] Web UI: open settings (gear icon). Click "Lavender" accent → all accent-colored elements change to lavender.
- [ ] Web UI: export button → downloads `inbox-export-YYYY-MM-DD.json`.
- [ ] Web UI: import button → select file → upload → toast shows "Import complete: 25 created, 0 skipped".
- [ ] Web UI: click a tag chip on a block → feed filters to only items with that tag. URL updates to `?tag=rust`. Refresh → filter persists.
- [ ] Web UI: add tag to item via action menu → type "newtag" → tag created and linked.
- [ ] Old app migration: take old Dexie export JSON, run migration script → all items appear in new system with correct types and metadata.

## Auto Test Checklist

- [ ] Tag CRUD API test: create tag → list → assert present. Delete tag → list → assert gone. Link tag to item → GET item → assert tag in response. Unlink → assert gone.
- [ ] Category CRUD API test: same pattern as tags.
- [ ] Filter by tag test: `GET /v1/items?tag=rust` → assert only items with "rust" tag.
- [ ] Filter by category test: `GET /v1/items?category=devops` → assert correct subset.
- [ ] Export roundtrip: seed 50 items with tags/categories → export JSON → import to blank DB → assert all items identical (fields match). Export Markdown → assert readable format. Export CSV → assert columns correct.
- [ ] Import deduplication: import same file twice → second import: `{created: 0, skipped: N}`.
- [ ] Import error handling: malformed JSON item → assert error in response.errors, valid items still imported.
- [ ] Stats accuracy: create known counts → `GET /v1/stats` → assert all numbers match.
- [ ] CLI test: `inbox export` → assert GET /v1/export with correct format param. `inbox import file.json` → assert POST /v1/import with file body.
- [ ] Web UI test: settings modal opens/closes. Accent color change → assert CSS variable update. Import file picker → assert file uploaded. Tag chip click → assert URL query param update.

## Deliverable

Full management layer across all interfaces. Users can organize items with tags and categories. Export backups in multiple formats. Import restores data. Stats show system health. Settings personalize the experience. The app is feature-complete for v0.
