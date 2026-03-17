---
id: doc-6
title: 'Epic 1 — F-05: Local-First Persistence'
type: other
created_date: '2026-03-17 23:57'
---
# Epic 1 — Capture: F-05 — Local-First Persistence

**Priority:** P0  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14  

---

## Description

All captured items are written to local storage immediately on capture. Remote sync is eventual and out of scope for this epic.

---

## Behaviour

- Write to local storage is synchronous with the capture event — completes before the UI updates.
- Raw input is stored in full, unmodified, with no truncation.

---

## Storage Schema (per item)

```json
{
  "id": "uuid-v4",
  "type": "text | url | image | file",
  "capturedAt": "2026-03-14T14:32:00.000Z",
  "raw": "<original payload>"
}
```

---

## Acceptance Criteria

- Capturing an item and immediately force-quitting the app → item is present on next launch.
- Stored `raw` field exactly matches the original input (byte-for-byte for files, exact string for text/URL).
- Every item has a unique `id` and a `capturedAt` ISO 8601 timestamp.

---

## Cross-Cutting Stories

US-05-XX — Trust that nothing is lost

> This story is referenced in F-01, F-02, F-03, F-04, and F-06 because persistence is the guarantee that makes capture trustworthy. The canonical definition lives here.
