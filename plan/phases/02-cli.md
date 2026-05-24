# Phase 2 — CLI Implementation

**Status:** 📋 Planned
**Depends on:** Phase 1
**Duration:** 2-3 days
**Goal:** Build a fully functional terminal-native capture tool

---

## Deliverables

- [ ] Complete CLI with all commands (add, list, info, delete, search, tags, categories, stats, open)
- [ ] Type detection (URL regex, image mimetype, file extension)
- [ ] File upload with multipart/form-data
- [ ] Rich terminal output (tables, colors, JSON, progress bars)
- [ ] Configuration file (`~/.config/inbox/config.toml`)
- [ ] Shell completion scripts (bash, zsh, fish)
- [ ] Error handling with human-friendly messages
- [ ] CLI tests (pytest with subprocess mocking)

---

## Tasks

### T-01: Configuration File

**File:** `inbox/cli/config.py`

Create TOML-based configuration:
```toml
# ~/.config/inbox/config.toml
[server]
url = "http://localhost:8080"

defaults]
limit = 20
output = "table"  # table | json | compact

[colors]
enabled = true
```

- Auto-create config directory on first run
- Load config with Pydantic Settings
- Override with environment variables (`INBOX_SERVER_URL`)
- `inbox config` command to view/edit config

### T-02: Capture Commands

**File:** `inbox/cli/main.py` — `add` command

Complete implementation:
```python
@app.command()
def add(
    content: str | None = typer.Argument(default=None),
    file: Path | None = typer.Option(None, "--file", "-f"),
    stdin: bool = typer.Option(False, "--stdin"),
    type: str | None = typer.Option(None, "--type", "-t"),
    json: bool = typer.Option(False, "--json"),
):
    """Capture text, URL, or file into the inbox."""
```

Features:
- Auto-detect type from content (URL regex, file mimetype)
- Multipart upload for files with progress bar (Rich Progress)
- `--type` override for explicit type setting
- `--stdin` reads entire stdin stream
- `--json` outputs raw API response
- Capture confirmation with item ID
- Support for piping: `echo "note" | inbox add --stdin`

### T-03: Browse Commands

**Commands:** `list`, `info`

`inbox list`:
- Rich table output with columns: Type, Preview, Captured, Tags
- `--limit` / `-n` for pagination
- `--type` filter
- `--tag` filter
- `--json` raw output
- `--compact` one-line per item
- Auto-truncate long content
- Color-coded type icons (📄 text, 🔗 URL, 🖼️ image, 📎 file)

`inbox info <id>`:
- Detailed view with all fields
- Pretty-printed metadata and enrichment JSON
- Show tags and categories
- `--json` for raw API response

### T-04: Search Command

**Command:** `inbox search <query>`

- Full-text search via API
- Results in Rich table with relevance score
- `--json` for raw results
- `--limit` for result count

### T-05: Management Commands

**Commands:** `delete`, `tags`, `categories`, `stats`

`inbox delete <id>`:
- Confirmation prompt (skip with `--force`)
- Rich error messages (not found, already deleted)
- Exit codes: 0 (success), 3 (not found), 1 (error)

`inbox tags`:
- List all tags in table
- Show usage count per tag
- `--json` support

`inbox categories`:
- List all categories
- Show item count per category
- `--json` support

`inbox stats`:
- Total items, by type, by tag
- Storage usage (blob size)
- Recent activity

### T-06: Open Command

**Command:** `inbox open`

- Launch default browser at server URL
- `--url` to print URL instead of opening

### T-07: Error Handling & UX

- Network error handling with retry suggestion
- 404 errors with "Did you mean?" suggestions (fuzzy matching)
- Validation errors with field highlighting
- Rich error panels with red borders
- Spinner for long operations (file upload, search)
- Progress bar for bulk operations

### T-08: Shell Completion

- Generate completion scripts: `inbox --install-completion`
- Support bash, zsh, fish
- Document in README

### T-09: Testing

**Files:** `tests/test_cli_*.py`

- Mock httpx client for unit tests
- Subprocess tests for integration
- Test all command variations
- Test error conditions
- Test config file handling

---

## Stack

| Layer | Technology |
|-------|-----------|
| CLI Framework | Typer |
| HTTP Client | httpx |
| Output Formatting | Rich |
| Config | Pydantic Settings + TOML |
| Testing | pytest + mock |

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Capture speed | < 1s for text, < 5s for 10MB file |
| CLI coverage | 100% of web UI capture features |
| Terminal output | Beautiful tables, colors, progress |
| Error messages | Human-friendly with suggestions |
| Shell completion | bash, zsh, fish supported |
| Test coverage | > 80% |
