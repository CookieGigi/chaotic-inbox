---
id: TASK-39
title: '[Epic 2] F-07: URL enrichment does not affect the raw field'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-03-18 00:14'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-9
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to trust that enrichment never modifies what I originally pasted,
**so that** the URL I saved is always exactly what I captured.

Raw field is immutable — enrichment only writes to meta.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The `raw` field of a `url` item is identical before and after enrichment
- [ ] #2 `meta.title` and `meta.description` are written only to the `meta` field — never to `raw`
- [ ] #3 The block always displays the original raw URL regardless of enrichment status
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
