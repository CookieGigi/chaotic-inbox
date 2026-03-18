---
id: TASK-46
title: '[Epic 2] F-09: Items captured before opt-in not retroactively summarised'
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
  - doc-11
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** the app to leave my existing captures untouched when I enable AI summaries,
**so that** enabling the feature doesn't trigger unexpected background processing over my entire vault.

Only new items captured after model is ready receive summaries.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Enabling AI summaries and completing the model download does not trigger summarisation for any pre-existing items
- [ ] #2 Pre-existing text and file blocks show no summary area and no empty placeholder
- [ ] #3 Only items captured after the model is ready receive summaries
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
