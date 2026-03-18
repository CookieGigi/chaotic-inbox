# Epic 1 — Capture: F-01 User Stories

**Feature:** F-01 — Instant Append on Paste
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-01-01 — Paste text anywhere in the app

**As a** user,
**I want** to press `Cmd+V` / `Ctrl+V` anywhere in the app
**so that** my clipboard text is saved instantly without clicking into any field.

**Acceptance Criteria**
- Clipboard text is captured with no input focused
- A new text block appears at the bottom of the feed
- The feed scrolls to the new block

---

### US-01-02 — Paste a URL

**As a** user,
**I want** a pasted URL to be recognised and saved as a URL block
**so that** I can distinguish links from plain text at a glance.

**Acceptance Criteria**
- Text starting with `http://` or `https://` is saved as type `url`, not `text`
- The block renders the hostname as a muted label with the full URL as body

---

### US-01-03 — Paste an image

**As a** user,
**I want** to paste a screenshot or image from my clipboard
**so that** it appears inline in my feed without saving a file manually.

**Acceptance Criteria**
- A clipboard image is captured and rendered inline in the feed
- No file dialog or save step is required

---

### US-01-04 — Paste doesn't interfere with typing

**As a** user,
**I want** normal paste behaviour inside text inputs to be unaffected
**so that** the global listener doesn't double-capture when I'm filling in a form.

**Acceptance Criteria**
- Pasting inside an `<input>` or `<textarea>` pastes into that field only
- No duplicate block is created in the feed

---

### US-01-05 — Empty or unsupported clipboard is silently ignored

**As a** user,
**I want** nothing to happen if I press `Cmd+V` / `Ctrl+V` with an empty or unrecognised clipboard
**so that** accidental pastes don't create broken or empty blocks in my feed.

**Acceptance Criteria**
- Pasting with an empty clipboard → no block is created, no error is shown
- Pasting with an unsupported clipboard type → no block is created, no error is shown
- The feed remains unchanged and scrolled to its current position
- No toast, alert, or visual feedback of any kind is shown

---

## Cross-Cutting Story (owned by F-05)

### US-05-XX — Trust that nothing is lost

> **Note:** This story is owned by **F-05 — Local-First Persistence**. It is referenced here because F-01 is a primary trigger for the persistence guarantee.

**As a** user,
**I want** my item to be saved to local storage before it appears on screen
**so that** I can trust it won't disappear if the app crashes immediately after pasting.

**Acceptance Criteria**
- Force-quitting the app immediately after paste → item is present on next launch
- Stored content exactly matches what was pasted

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-01-01 | F-05 persistence schema |
| US-01-02 | F-03 block type detection |
| US-01-03 | F-03 image block rendering |
| US-01-04 | — |
| US-01-05 | — |
