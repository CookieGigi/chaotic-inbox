---
id: TASK-41
title: '[Epic 2] F-09: AI summaries off by default'
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
  - doc-11
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** AI summaries to be disabled until I choose to enable them,
**so that** a large model download never happens without my knowledge.

AI summaries require explicit opt-in. No model download before user enables.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On first launch, the AI summaries setting is off
- [ ] #2 No model download is initiated at any point before the user enables the setting
- [ ] #3 Text and file blocks show no summary placeholder or empty summary area when the setting is off
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
