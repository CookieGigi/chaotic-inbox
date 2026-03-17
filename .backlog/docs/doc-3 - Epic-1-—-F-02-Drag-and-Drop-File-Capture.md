---
id: doc-3
title: 'Epic 1 — F-02: Drag-and-Drop File Capture'
type: other
created_date: '2026-03-17 23:56'
---
# Epic 1 — Capture: F-02 — Drag-and-Drop File Capture

**Priority:** P0  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14  

---

## Description

Any file dragged onto the app window is captured and appended as a block. This is the primary capture gesture for files.

---

## Behaviour

- The entire app window is a drop target — no designated drop zone.
- On drag-enter, the UI shows a full-screen overlay indicating drop is active.
- On drop, the file is written to local storage and a block is appended.
- Multiple files dropped simultaneously each produce their own block, appended in order.
- No file type or size restrictions.
- Dropped image files (png, jpg, gif, webp) → image block; all other files → file block.

---

## Acceptance Criteria

- Dropping a PDF → file block appended with filename, size, and PDF-specific icon.
- Dropping a zip → file block with filename, size, and zip-specific icon.
- Dropping an image file → rendered as an image block (not a file block).
- Dropping 3 files simultaneously → 3 blocks appended in drop order.
- Drop overlay disappears immediately on drop or drag-leave.

---

## Dependencies

- F-05 persistence schema
- F-03 block type detection
- F-03 image block rendering
- F-03 file block rendering and icon set

---

## Cross-Cutting Stories

- US-05-XX — Trust that dropped files are not lost (owned by F-05)
