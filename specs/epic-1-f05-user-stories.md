# Epic 1 — Capture: F-05 User Stories

**Feature:** F-05 — Local-First Persistence
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-05-01 — Item is persisted before it appears on screen

**As a** user,
**I want** my captured item to be written to local storage before any UI update is rendered
**so that** I can trust the item is safe even if the app crashes immediately after I paste or drop.

**Acceptance Criteria**
- Write to local storage completes synchronously with the capture event, before the block is rendered in the feed
- Force-quitting the app immediately after paste or drop → the item is present on next launch

---

### US-05-02 — Raw input is stored exactly as captured

**As a** user,
**I want** my original content to be stored without modification
**so that** I never lose fidelity to what I actually captured.

**Acceptance Criteria**
- The stored `raw` field for text and URL items exactly matches the original clipboard string
- The stored `raw` field for file items is byte-for-byte identical to the original file
- No truncation, normalisation, or transformation is applied to the stored payload

---

### US-05-03 — Every item has a unique ID and a capture timestamp

**As a** user,
**I want** each item to carry a stable identifier and an accurate timestamp
**so that** the feed can be ordered reliably and individual items can be referenced unambiguously.

**Acceptance Criteria**
- Every stored item has an `id` field containing a UUID v4
- Every stored item has a `capturedAt` field containing an ISO 8601 timestamp set at the moment of capture
- No two items share the same `id`

---

### US-05-04 — Items survive an app restart

**As a** user,
**I want** all my captured items to still be there when I reopen the app
**so that** the vault is a reliable record I can return to at any time.

**Acceptance Criteria**
- All items captured in previous sessions are loaded and rendered in the feed on launch
- Items appear in the same capture-time order as when they were saved
- No items are missing or corrupted after a normal close-and-reopen cycle

---

### US-05-05 — Storage failure is surfaced to the user

**As a** user,
**I want** to be informed if my item could not be saved
**so that** I am never left believing something was captured when it wasn't.

**Acceptance Criteria**
- If the local storage write fails (e.g. quota exceeded, permission denied, disk full), no block is appended to the feed
- The user is shown an error message explaining that the item could not be saved
- The original clipboard content or file is not discarded — the user can retry
- No partial or unconfirmed block is ever shown in the feed

---

## Storage Schema Reference

```json
{
  "id": "uuid-v4",
  "type": "text | url | image | file",
  "capturedAt": "2026-03-14T14:32:00.000Z",
  "raw": "<original payload>"
}
```

---

## Dependencies

| Story | Depends on | Consumed by |
|-------|-----------|-------------|
| US-05-01 | F-01 paste capture, F-02 drag-and-drop capture | — |
| US-05-02 | F-03 block type detection | — |
| US-05-03 | — | F-04 feed ordering |
| US-05-04 | F-01 paste capture, F-02 drag-and-drop capture | — |
| US-05-05 | F-01 paste capture, F-02 drag-and-drop capture | — |

---

## Notes

US-05-01 is cross-referenced in both F-01 and F-02 user story files, as persistence is the guarantee that makes capture trustworthy. The canonical definition lives here.
