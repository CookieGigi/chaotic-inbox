# Epic 1 — Capture: F-02 User Stories

**Feature:** F-02 — Drag-and-Drop File Capture
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-02-01 — Drop a file anywhere on the app window

**As a** user,
**I want** to drag a file from my filesystem and drop it anywhere on the app window
**so that** it is saved instantly without navigating to a specific drop zone.

**Acceptance Criteria**
- The entire app window acts as a drop target
- A dropped file is captured and appended as a block at the bottom of the feed
- The feed scrolls to the new block

---

### US-02-02 — See a visual cue while dragging

**As a** user,
**I want** to see a clear visual indicator when I drag a file over the app
**so that** I know the app is ready to accept my drop.

**Acceptance Criteria**
- Dragging a file over the window triggers a full-screen overlay
- The overlay disappears immediately on drop or when the file is dragged away (drag-leave)

---

### US-02-03 — Drop an image file and see it rendered inline

**As a** user,
**I want** a dropped image file to appear as an inline image in the feed
**so that** I can see the image content without any extra steps.

**Acceptance Criteria**
- Dropping a `.png`, `.jpg`, `.gif`, or `.webp` file produces an image block, not a file block
- The image is rendered inline, constrained to the feed column width

---

### US-02-04 — Drop a non-image file and see its metadata

**As a** user,
**I want** a dropped non-image file to appear with its filename, size, and a type-specific icon
**so that** I can identify what I captured at a glance without opening it.

**Acceptance Criteria**
- Dropping a `.pdf` → file block with `FilePdf` icon, filename, and file size
- Dropping a `.zip` → file block with `FileZip` icon, filename, and file size
- Dropping an unknown binary → file block with `FileBinary` icon, filename, and file size

---

### US-02-05 — Drop multiple files at once

**As a** user,
**I want** to drop several files simultaneously
**so that** they are all captured in one gesture without repeating the action.

**Acceptance Criteria**
- Each file in a multi-file drop produces its own block
- Blocks are appended in drop order
- Each block renders according to its own type (image vs. file)

---

### US-02-06 — Drag over an interactive element does not break the drop target

**As a** user,
**I want** the drop target to remain active even when I drag over a text input or other interactive element
**so that** I can drop files anywhere in the app without hitting dead zones.

**Acceptance Criteria**
- Dragging a file over an `<input>`, `<textarea>`, or button keeps the full-screen overlay active
- Dropping a file while hovering over an interactive element captures the file normally
- The interactive element does not receive the drop event (no browser default behaviour)

---

### US-02-07 — Dragging a URL or text from a browser is ignored

**As a** user,
**I want** dragging a link or selected text from a browser tab to have no effect on the feed
**so that** accidental drags from the browser don't create unexpected blocks.

**Acceptance Criteria**
- Dragging a link from a browser tab onto the app → no block is created
- Dragging selected text from a browser onto the app → no block is created
- No drop overlay is shown for non-file drag types
- The event is silently ignored with no feedback

---

## Cross-Cutting Story (owned by F-05)

### US-05-XX — Trust that dropped files are not lost

> **Note:** This story is owned by **F-05 — Local-First Persistence**. It is referenced here because F-02 is a primary trigger for the persistence guarantee for file inputs.

**As a** user,
**I want** a dropped file to be written to local storage before it appears on screen
**so that** I can trust it won't disappear if the app crashes immediately after dropping.

**Acceptance Criteria**
- Force-quitting the app immediately after a file drop → the block is present on next launch
- The stored raw content exactly matches the original file (byte-for-byte)

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-02-01 | F-05 persistence schema |
| US-02-03 | F-03 image block rendering |
| US-02-04 | F-03 file block rendering and icon set |
| US-02-05 | F-03 block type detection |
| US-02-06 | — |
| US-02-07 | — |
| US-02-XX | F-05 persistence schema |
