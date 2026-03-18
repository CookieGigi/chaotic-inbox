# Epic 1 — Capture: F-04 User Stories

**Feature:** F-04 — Chronological Feed (Newest at Bottom)
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-04-01 — Feed opens at the right position on launch

**As a** user,
**I want** the feed to open at the most recent block if anything is new, or where I left off if nothing has changed,
**so that** I always land in the most useful position without any manual scrolling.

**Acceptance Criteria**
- On launch, if any items were captured since the last session → scroll to the most recent block
- On launch, if no new items since the last session → restore the previous scroll position
- If there is no previous scroll position (first launch, or no items) → scroll to bottom

---

### US-04-02 — New capture scrolls the feed to the new block

**As a** user,
**I want** the feed to scroll automatically to a newly captured block
**so that** I get immediate confirmation that my item landed at the bottom.

**Acceptance Criteria**
- After any paste or drop, the feed scrolls to the newly appended block
- The scroll happens after the block is rendered, not before

---

### US-04-03 — Items are always in capture-time order

**As a** user,
**I want** the feed to display items in the order I captured them
**so that** I can orient myself by time and trust the feed is a faithful log.

**Acceptance Criteria**
- Items are ordered ascending by `capturedAt` — oldest at top, newest at bottom
- No sort control or reorder mechanism is present
- The order cannot be changed by any user action

---

### US-04-04 — Each block shows a timestamp

**As a** user,
**I want** to see when each item was captured
**so that** I can place it in context without relying on memory.

**Acceptance Criteria**
- Every block displays a timestamp in a muted style
- Timestamp formatting follows the rules below:

| Age | Format | Example |
|-----|--------|---------|
| Today | `HH:MM` | `14:32` |
| This year | `Mon DD · HH:MM` | `Mar 12 · 09:01` |
| Older | `YYYY Mon DD · HH:MM` | `2025 Mar 3 · 09:01` |

---

### US-04-05 — Scroll position is preserved between sessions

**As a** user,
**I want** the feed to remember where I was scrolled when I closed the app
**so that** I can pick up where I left off when nothing new has arrived.

**Acceptance Criteria**
- Scroll position is saved to local storage when the app is closed or backgrounded
- On launch with no new items, the saved scroll position is restored
- If new items exist since the last session, scroll position is superseded by US-04-01 — the feed scrolls to the bottom instead

---

### US-04-06 — Empty feed shows a prompt on first launch

**As a** user,
**I want** to see a clear indication that the feed is empty when I first open the app
**so that** I understand what to do next and don't think something has gone wrong.

**Acceptance Criteria**
- On first launch with no captured items, the feed displays an empty state message
- The empty state communicates the capture gesture (paste or drop)
- The empty state disappears immediately when the first item is captured
- No empty state is shown if items exist but are scrolled out of view

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-04-01 | F-05 persistence schema — items must be loadable on launch |
| US-04-02 | F-01 paste capture, F-02 drag-and-drop capture |
| US-04-03 | F-05 `capturedAt` field on every item record |
| US-04-04 | F-05 `capturedAt` field on every item record |
| US-04-05 | F-05 persistence — scroll position stored locally |
| US-04-06 | — |
