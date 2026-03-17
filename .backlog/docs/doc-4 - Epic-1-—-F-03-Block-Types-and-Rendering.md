---
id: doc-4
title: 'Epic 1 — F-03: Block Types and Rendering'
type: other
created_date: '2026-03-17 23:57'
---
# Epic 1 — Capture: F-03 — Block Types and Rendering

**Priority:** P0  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14  

---

## Description

Each captured item is rendered as a typed block. The block type is inferred from the input at capture time and never changed. Raw input is always stored in full.

---

## Block Types

| Type | Detection Rule | Rendering |
|------|---------------|-----------|
| `url` | Clipboard text matching a URL pattern (`http://` / `https://`) | Hostname shown as muted label, full URL as body text. No favicon or link preview. |
| `text` | Clipboard text that is not a URL | Body font. Truncated at 5 lines with "show more" affordance. "Show less" to collapse. |
| `image` | Clipboard image or dropped image file (png, jpg, gif, webp) | Rendered inline, constrained to feed column width. |
| `file` | Any dropped non-image file | Type-specific icon + filename + file size. No content preview. |

---

## File Icon Set

Provided by [Phosphor Icons](https://phosphoricons.com) (MIT):

| File type | Phosphor icon |
|-----------|--------------|
| PDF | `FilePdf` |
| zip / archive | `FileZip` |
| Markdown | `FileMd` |
| Plain text | `FileText` |
| Binary / unknown | `FileBinary` |

---

## Behaviour

- Block type is determined once at capture and stored on the item record.
- Raw input is stored in full regardless of truncation in the UI.
- "Show more" expands the text block in place — no navigation.
- "Show less" collapses it back to 5 lines.
- The 5-line truncation threshold is fixed and not user-configurable at this stage.

---

## Acceptance Criteria

- Pasting `https://github.com/foo/bar` → renders as `url` block, not `text`.
- Pasting `"look into Nix flake templates"` → renders as `text` block in body font, truncated if > 5 lines.
- Pasting a screenshot from clipboard → renders as `image` block inline.
- Dropping a `.pdf` → renders as `file` block with `FilePdf` icon, name, and size.
- Dropping a `.zip` → renders as `file` block with `FileZip` icon.
- Dropping an unknown binary → renders as `file` block with `FileBinary` icon.
- "Show more" expands full text; "Show less" returns to 5-line truncation.

---

## Dependencies

- F-05 persistence schema
