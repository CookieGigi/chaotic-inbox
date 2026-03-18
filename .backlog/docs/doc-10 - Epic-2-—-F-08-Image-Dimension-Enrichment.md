---
id: doc-10
title: 'Epic 2 — F-08: Image Dimension Enrichment'
type: other
created_date: '2026-03-17 23:58'
updated_date: '2026-03-18 23:05'
---
# Epic 2 — Enrichment: F-08 — Image Dimension Enrichment

**Priority:** P1  
**Status:** Draft  
**Version:** 0.2.0  
**Last updated:** 2026-03-19

---

## Description

When an `image` item is captured, its natural dimensions are read client-side and stored on the item record.

---

## Behaviour

- Triggered automatically for every item with `type: image`
- Dimensions are read from the rendered `<img>` element's `naturalWidth` / `naturalHeight` — no network call required
- `meta.width` and `meta.height` are written immediately after the image loads
- `enrichmentStatus.image` is set to `done` upon successful dimension capture
- Enrichment is synchronous enough that no loading state is needed
- Failure (e.g. corrupt image data) sets `enrichmentStatus.image` to `failed` silently — no user-facing error for this track

---

## Acceptance Criteria

- After an image block renders, `meta.width` and `meta.height` are present in storage
- `enrichmentStatus.image` is set to `done` when dimensions are captured successfully
- No network request is made for image dimension enrichment
- A corrupt or unrenderable image sets `enrichmentStatus.image: 'failed'` without surfacing an error to the user

---

## Dependencies

- Epic 1 F-03 image block rendering
- F-10 per-track enrichment status handling
