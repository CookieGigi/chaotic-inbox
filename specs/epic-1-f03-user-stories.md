# Epic 1 — Capture: F-03 User Stories

**Feature:** F-03 — Block Types and Rendering
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-03-01 — Pasted URL renders as a URL block

**As a** user,
**I want** a pasted URL to render differently from plain text
**so that** I can identify links at a glance without reading the full string.

**Acceptance Criteria**
- Clipboard text matching `http://` or `https://` is saved and rendered as type `url`, not `text`
- The block displays the hostname as a muted label with the full URL as body text
- No favicon or link preview is fetched or shown

---

### US-03-02 — Pasted text renders as a text block

**As a** user,
**I want** pasted plain text to render in a readable body font
**so that** notes and snippets feel natural to read in the feed.

**Acceptance Criteria**
- Clipboard text that is not a URL is saved and rendered as type `text`
- The block uses the body font (not monospace or a code style)

---

### US-03-03 — Long text blocks are truncated with a "show more" affordance

**As a** user,
**I want** long text blocks to be collapsed by default
**so that** the feed stays scannable and I'm not overwhelmed by a wall of text.

**Acceptance Criteria**
- Text blocks longer than 5 lines are truncated at 5 lines on initial render
- A "show more" affordance is visible below the truncated content
- Tapping "show more" expands the full text in place — no navigation or modal
- A "show less" affordance collapses the block back to 5 lines
- The raw full text is always stored in full, regardless of UI truncation
- The 5-line threshold is fixed and not user-configurable

---

### US-03-04 — Pasted image renders inline

**As a** user,
**I want** a screenshot or image pasted from my clipboard to appear inline in the feed
**so that** I can see the image content immediately without any extra steps.

**Acceptance Criteria**
- A clipboard image is rendered as type `image`, inline within the feed column
- The image is constrained to the feed column width
- No file icon or filename is shown — only the image itself

---

### US-03-05 — Dropped non-image file renders as a file block with a type-specific icon

**As a** user,
**I want** a dropped file to show its filename, size, and a recognisable icon
**so that** I can identify what I captured at a glance without opening it.

**Acceptance Criteria**
- Dropping a `.pdf` → file block with `FilePdf` icon, filename, and file size
- Dropping a `.zip` or archive → file block with `FileZip` icon, filename, and file size
- Dropping a `.md` → file block with `FileMd` icon, filename, and file size
- Dropping a `.txt` → file block with `FileText` icon, filename, and file size
- Dropping an unknown or binary file → file block with `FileBinary` icon, filename, and file size
- No content preview is shown for file blocks

---

### US-03-06 — Block type is immutable after capture

**As a** user,
**I want** the type assigned to a block at capture time to remain fixed
**so that** I can trust the feed reflects exactly what I captured and when.

**Acceptance Criteria**
- Block type is determined once at capture time and stored on the item record
- No mechanism exists to change the type of an existing block
- Raw input is stored in full, unmodified, regardless of how it is rendered

---

### US-03-07 — Text containing an embedded URL renders as a text block

**As a** user,
**I want** pasted text that includes a URL within a sentence to be treated as plain text, not a URL block
**so that** notes and prose that happen to mention a link are not misclassified.

**Acceptance Criteria**
- Clipboard text where the full string does not start with `http://` or `https://` is saved as type `text`, even if a URL appears within it (e.g. `"for NixOS — https://nixos.wiki/..."`)
- The block renders as a text block in body font, not as a URL block
- The embedded URL is visible as part of the text content — no special link rendering

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-03-01 | F-01 paste detection, F-05 persistence schema |
| US-03-02 | F-01 paste detection, F-05 persistence schema |
| US-03-03 | US-03-02 text block rendering |
| US-03-04 | F-01 paste detection, F-02 drag-and-drop |
| US-03-05 | F-02 drag-and-drop, F-05 persistence schema |
| US-03-06 | F-05 persistence schema |
| US-03-07 | F-01 paste detection, F-05 persistence schema |
