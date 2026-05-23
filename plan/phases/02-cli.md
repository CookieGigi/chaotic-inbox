# Phase 2: CLI — Capture & Browse

**Goal**: Rust CLI binary that talks to the API server. Terminal-based capture and feed browsing. This is the "fastest path to a working product" per the architecture decision.

## Dependencies

- Phase 0 (Technical Stack Foundation)
- Phase 1 (Domain Model + Database + Core API) — API server must be running and healthy

## Tasks

| # | Feature | Detail |
|---------|---------|--------|
| 2.1 | `cmd/inbox/` scaffold | `clap` derive-based CLI. Binary crate in `cmd/inbox/`. `reqwest` (async, but CLI uses blocking client for simplicity). `serde` for JSON. `toml` for config. `colored` or `owo-colors` for terminal colors. `chrono-humanize` for relative timestamps. `dialoguer` for interactive prompts (confirmations). |
| 2.2 | `inbox add` — text | `inbox add "some note"` → POST `/v1/items` with `type: "text"`, `raw: "some note"`. On success, prints "Captured ✓ [{short_id}]" (first 8 chars of UUID). Accepts piped input: `echo "note" | inbox add`. Supports `--type text` to override detection. `--json` flag: prints full item JSON instead of pretty text. |
| 2.3 | `inbox add` — URL | `inbox add https://example.com` → type detection recognizes URL pattern (starts with `http://` or `https://`). POST with `type: "url"`, `raw: "https://example.com"`. Also works: `inbox add --type url https://example.com`. |
| 2.4 | `inbox add` — file | `inbox add ./notes.md` → checks if path exists, reads file as bytes. Multipart upload: `POST /v1/items` with form field `type: "file"`, file attachment. Shows "Uploaded notes.md (1.2 KB) ✓". Supports image files: `inbox add ./photo.png` → `type: "image"` (auto-detected by extension: png, jpg, jpeg, gif, webp). Supports `--type image` override. |
| 2.5 | Type detection (shared) | Move `detect_type` into `crates/domain/`. Function signature: `pub fn detect_type(input: &str, filename: Option<&str>, mime_type: Option<&str>) -> ItemType`. Rules: if input starts with `http://` or `https://` → `Url`. Else if filename extension is image → `Image`. Else if filename exists and is a file → `File`. Else → `Text`. This logic is shared between CLI and server (Phase 1 capture endpoint). |
| 2.6 | `inbox list` | `inbox list` → GET `/v1/items?limit=20` → renders chronological feed. Each item: type icon (unicode or nerd-font), first 80 chars of raw (truncated with ellipsis), relative timestamp (e.g., "2 min ago"). Flags: `--limit N` (default 20, max 100), `--cursor <id>` (for pagination), `--type text|url|image|file` (filter by type), `--json` (machine-readable output: JSON array). `--reverse` (newest first, for tail-like behavior). |
| 2.7 | `inbox info` | `inbox info <id>` → GET `/v1/items/<id>` → full item details. Formatted output: ID, type, captured_at (absolute + relative), raw content (full, not truncated), metadata (pretty-printed JSON), enrichment_status (pretty-printed), created_at, updated_at. `--json` for raw JSON output. |
| 2.8 | `inbox config` | Config file: `~/.config/inbox/config.toml`. `inbox config` → display current settings. `inbox config set api_url http://localhost:8080` → writes to file. `inbox config show` → display. `inbox config get api_url` → single value. Config keys: `api_url` (string, default `http://localhost:8080`), `default_limit` (u32, default 20), `output_format` ("pretty" or "json", default "pretty"), `color` ("auto", "always", "never", default "auto"). |
| 2.9 | `inbox delete` | `inbox delete <id>` → DELETE `/v1/items/<id>`. Prompts for confirmation: "Delete item {short_id}? [y/N]". `--force` to skip confirmation. On success: "Deleted ✓". On 404: "Item not found". |
| 2.10 | Error handling | Graceful degradation: if server is unreachable → "Error: cannot connect to inbox server at {api_url}". If response is non-JSON → print raw response. If 400/422 → print server error message. Exit codes: 0 = success, 1 = general error, 2 = connection error, 3 = not found. |

## Human Test Checklist

- [ ] Start server (`make dev` or `cargo run -p server`).
- [ ] `inbox add "test note"` → "Captured ✓ [{short_id}]". `inbox list` → shows item with "test note".
- [ ] `echo "piped content" | inbox add` → "Captured ✓ [{short_id}]". `inbox list` → shows it.
- [ ] `inbox add https://example.com` → list shows URL type. `inbox info {id}` → shows type: url, raw: https://example.com.
- [ ] `inbox add ./README.md` (or any local file) → "Uploaded README.md (X bytes) ✓". List shows file type.
- [ ] `inbox add ./photo.png` → list shows image type.
- [ ] `inbox list --limit 5 --type text` → only text items, max 5.
- [ ] `inbox list --json` → valid JSON array, can pipe to `jq`.
- [ ] `inbox info {id}` → full details, pretty-printed.
- [ ] `inbox delete {id}` → confirmation prompt, then "Deleted ✓". List no longer shows it.
- [ ] `inbox config set api_url http://other:8080` → `inbox config show` reflects change.
- [ ] Stop server. `inbox list` → "Error: cannot connect to inbox server..." with exit code 2.

## Auto Test Checklist

- [ ] CLI integration tests using `assert_cmd` and `predicates`. Spawn a test server (or mock with `wiremock` / `mockito`).
- [ ] Test `inbox add "text"` → assert POST body contains correct JSON.
- [ ] Test `inbox add ./file.txt` → assert multipart upload with correct filename and content.
- [ ] Test `inbox list` → assert GET with correct query params, assert terminal output contains expected items.
- [ ] Test `inbox list --json` → assert valid JSON parseable by serde.
- [ ] Test `inbox list --limit 50 --type url` → assert query params in request.
- [ ] Test `inbox delete {id}` → assert DELETE request, assert confirmation prompt (use `std::io::Write` mock).
- [ ] Test `inbox config` roundtrip: set value → read back → assert equals.
- [ ] Test error handling: server 500 → assert stderr contains error message, assert exit code 1. Server unreachable → assert connection error, exit code 2. 404 → assert "not found", exit code 3.
- [ ] Snapshot tests for terminal output formatting (using `insta` or `expect-test`).

## Deliverable

A fully functional Rust CLI binary. `cargo run -p inbox` produces a working `inbox` command. Can capture text, URLs, files, and images. Can browse the chronological feed. Configuration persists across invocations.
