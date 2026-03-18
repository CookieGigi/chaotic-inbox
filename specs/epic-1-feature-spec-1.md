# Epic 1 — Capture: Feature Spec

**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14  
**Based on:** Epic 1 v0.3.0 · Heynote Feed Analysis

---

## Overview

The Capture screen is a single, continuous, append-only feed. The user pastes or drops anything — a URL, text, image, or file — and it appears immediately at the bottom of the feed as a discrete block. No decisions, no forms, no friction.

The feed *is* the UI. There is no separate "save" action.

---

## Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | Text block font | Body font (readable/natural feel) |
| 2 | File block icons | Type-specific (PDF, zip, image, etc.) |
| 3 | Truncation threshold configurable? | No — fixed at 5 lines for now; may become configurable in a later epic |
| 4 | Annotation entry point | To be designed in the annotations epic |
| 5 | Icon library | [Phosphor Icons](https://phosphoricons.com) (MIT) — chosen for native file-type icon coverage (`FilePdf`, `FileZip`, `FileMd`, `FileText`, `FileBinary`) and multi-framework SVG support |

---

## Features

---

### F-01 — Instant Append on Paste

**Priority:** P0

**Description**  
When the user presses `Cmd+V` / `Ctrl+V` anywhere in the app — regardless of focus state — the clipboard contents are captured and a new block is appended to the bottom of the feed.

**Behaviour**
- No focused input required. The global paste listener intercepts the event.
- The block is persisted to local storage *before* any UI update is rendered.
- The new block appears at the bottom of the feed and the view scrolls to it.
- No confirmation dialog, modal, or toast is shown on success.
- If the clipboard is empty or the type is unrecognised, the event is silently ignored.

**Acceptance Criteria**
- `Cmd+V` with a text string on the clipboard → text block appended, feed scrolls to bottom.
- `Cmd+V` with an image on the clipboard → image block appended inline.
- `Cmd+V` with a URL string → URL block appended (not text block).
- Block is retrievable from local storage immediately after paste, before any re-render.

---

### F-02 — Drag-and-Drop File Capture

**Priority:** P0

**Description**  
Any file dragged onto the app window is captured and appended as a block. This is the primary capture gesture for files.

**Behaviour**
- The entire app window is a drop target — no designated drop zone.
- On drag-enter, the UI shows a full-screen overlay indicating drop is active.
- On drop, the file is written to local storage and a block is appended.
- Multiple files dropped simultaneously each produce their own block, appended in order.
- No file type or size restrictions.
- Dropped image files (png, jpg, gif, webp) → image block; all other files → file block.

**Acceptance Criteria**
- Dropping a PDF → file block appended with filename, size, and PDF-specific icon.
- Dropping a zip → file block with filename, size, and zip-specific icon.
- Dropping an image file → rendered as an image block (not a file block).
- Dropping 3 files simultaneously → 3 blocks appended in drop order.
- Drop overlay disappears immediately on drop or drag-leave.

---

### F-03 — Block Types and Rendering

**Priority:** P0

**Description**  
Each captured item is rendered as a typed block. The block type is inferred from the input at capture time and never changed. Raw input is always stored in full.

**Block Types**

| Type | Detection Rule | Rendering |
|------|---------------|-----------|
| `url` | Clipboard text matching a URL pattern (`http://` / `https://`) | Hostname shown as muted label, full URL as body text. No favicon or link preview. |
| `text` | Clipboard text that is not a URL | Body font. Truncated at 5 lines with "show more" affordance. "Show less" to collapse. |
| `image` | Clipboard image or dropped image file (png, jpg, gif, webp) | Rendered inline, constrained to feed column width. |
| `file` | Any dropped non-image file | Type-specific icon + filename + file size. No content preview. |

**File icon set** — provided by [Phosphor Icons](https://phosphoricons.com) (MIT):

| File type | Phosphor icon |
|-----------|--------------|
| PDF | `FilePdf` |
| zip / archive | `FileZip` |
| Markdown | `FileMd` |
| Plain text | `FileText` |
| Binary / unknown | `FileBinary` |

**Behaviour**
- Block type is determined once at capture and stored on the item record.
- Raw input is stored in full regardless of truncation in the UI.
- "Show more" expands the text block in place — no navigation.
- "Show less" collapses it back to 5 lines.
- The 5-line truncation threshold is fixed and not user-configurable at this stage.

**Acceptance Criteria**
- Pasting `https://github.com/foo/bar` → renders as `url` block, not `text`.
- Pasting `"look into Nix flake templates"` → renders as `text` block in body font, truncated if > 5 lines.
- Pasting a screenshot from clipboard → renders as `image` block inline.
- Dropping a `.pdf` → renders as `file` block with `FilePdf` icon, name, and size.
- Dropping a `.zip` → renders as `file` block with `FileZip` icon.
- Dropping an unknown binary → renders as `file` block with `FileBinary` icon.
- "Show more" expands full text; "Show less" returns to 5-line truncation.

---

### F-04 — Chronological Feed (Newest at Bottom)

**Priority:** P0

**Description**  
The feed is ordered strictly by capture time, ascending — oldest at the top, newest at the bottom. This is the only ordering; no sorting or filtering is available.

**Behaviour**
- Each block displays a timestamp (capture time) in a muted style.
- On launch, the feed loads all items and scrolls to the bottom automatically.
- After each new capture, the feed scrolls to the newly appended block.
- Scroll position is otherwise user-controlled and preserved between sessions.

**Timestamp formatting**

| Age | Format |
|-----|--------|
| Today | "14:32" |
| This year | "Mar 12 · 09:01" |
| Older | "2025 Mar 3 · 09:01" |

**Acceptance Criteria**
- On app launch with existing items, view is scrolled to the most recent block.
- Capturing a new item scrolls the feed to that block.
- Timestamps follow the formatting table above.
- Items are always in capture-time order; no reorder mechanism exists.

---

### F-05 — Local-First Persistence

**Priority:** P0

**Description**  
All captured items are written to local storage immediately on capture. Remote sync is eventual and out of scope for this epic.

**Behaviour**
- Write to local storage is synchronous with the capture event — completes before the UI updates.
- Raw input is stored in full, unmodified, with no truncation.

**Storage schema (per item)**

```json
{
  "id": "uuid-v4",
  "type": "text | url | image | file",
  "capturedAt": "2026-03-14T14:32:00.000Z",
  "raw": "<original payload>"
}
```

**Acceptance Criteria**
- Capturing an item and immediately force-quitting the app → item is present on next launch.
- Stored `raw` field exactly matches the original input (byte-for-byte for files, exact string for text/URL).
- Every item has a unique `id` and a `capturedAt` ISO 8601 timestamp.

---

### F-06 — Keyboard-First Capture

**Priority:** P1

**Description**  
The entire capture flow is operable without a mouse. `Cmd+V` / `Ctrl+V` is the primary interaction; drag-and-drop is the parallel gesture for files.

**Behaviour**
- Global paste listener requires no input to be focused.
- No new keyboard shortcuts are introduced in this epic beyond paste.
- No conflicts with OS-level bindings.

**Acceptance Criteria**
- App launched, no element focused, `Cmd+V` pressed → item captured.
- Works on macOS (`Cmd+V`) and Windows/Linux (`Ctrl+V`).

---

## Out of Scope

- Remote sync
- Search or recall
- Editing or deleting items
- LLM enrichment, tagging, or classification
- Annotations UI (deferred to a later epic)
- URL preview / unfurl
- Syntax highlighting
- Multiple vaults or buffers

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Exact icon set source / library for file type icons? | ~~Open~~ → Closed — see Decision #5 |
| 2 | Annotation entry point UX — how does it surface without disrupting capture flow? | Deferred to annotations epic |
