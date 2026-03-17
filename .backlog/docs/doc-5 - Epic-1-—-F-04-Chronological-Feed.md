---
id: doc-5
title: 'Epic 1 — F-04: Chronological Feed'
type: other
created_date: '2026-03-17 23:57'
---
# Epic 1 — Capture: F-04 — Chronological Feed (Newest at Bottom)

**Priority:** P0  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14  

---

## Description

The feed is ordered strictly by capture time, ascending — oldest at the top, newest at the bottom. This is the only ordering; no sorting or filtering is available.

---

## Behaviour

- Each block displays a timestamp (capture time) in a muted style.
- On launch, the feed loads all items and scrolls to the bottom automatically.
- After each new capture, the feed scrolls to the newly appended block.
- Scroll position is otherwise user-controlled and preserved between sessions.

---

## Timestamp Formatting

| Age | Format |
|-----|--------|
| Today | "14:32" |
| This year | "Mar 12 · 09:01" |
| Older | "2025 Mar 3 · 09:01" |

---

## Acceptance Criteria

- On app launch with existing items, view is scrolled to the most recent block.
- Capturing a new item scrolls the feed to that block.
- Timestamps follow the formatting table above.
- Items are always in capture-time order; no reorder mechanism exists.

---

## Dependencies

- F-05 persistence schema — items must be loadable on launch
- F-05 `capturedAt` field on every item record
- F-01 paste capture
- F-02 drag-and-drop capture
