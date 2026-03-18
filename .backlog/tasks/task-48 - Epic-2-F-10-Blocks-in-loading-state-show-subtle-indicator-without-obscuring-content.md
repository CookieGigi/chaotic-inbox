---
id: TASK-48
title: >-
  [Epic 2] F-10: Blocks in loading state show subtle indicator without obscuring
  content
status: To Do
assignee: []
created_date: '2026-03-18 00:11'
updated_date: '2026-03-18 00:15'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-12
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to see that enrichment is in progress without it interfering with my content,
**so that** the feed remains readable while the background work happens.

Loading indicator in metadata area only — raw content never obscured.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Blocks with `enrichmentStatus: pending` or `running` show a loading indicator in the metadata area only
- [ ] #2 The raw content of the block (URL, text, image, file) is never hidden or obscured by the loading indicator
- [ ] #3 The loading indicator is visually subtle — it does not compete with the block content
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
