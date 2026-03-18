---
id: TASK-40
title: '[Epic 2] F-08: Image dimensions stored after block renders'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-10
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** the natural dimensions of a captured image to be stored automatically,
**so that** the app has accurate size data without me doing anything.

Dimensions are read from the rendered `<img>` element — no network request.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After an image block renders in the feed, `meta.width` and `meta.height` are written to the item record
- [ ] #2 Dimensions reflect the image's natural size, not its display size in the feed
- [ ] #3 No network request is made — dimensions are read from the rendered `<img>` element
- [ ] #4 No loading indicator is shown — dimension capture is fast enough to be imperceptible
- [ ] #5 If the image fails to render (corrupt data), `enrichmentStatus` is set to `failed` silently — no user-facing error is shown
<!-- AC:END -->
