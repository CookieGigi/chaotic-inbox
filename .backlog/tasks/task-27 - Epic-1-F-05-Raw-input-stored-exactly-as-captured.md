---
id: TASK-27
title: '[Epic 1] F-05: Raw input stored exactly as captured'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-18 00:25'
labels:
  - phase-1
milestone: m-0
dependencies: []
references:
  - specs/epic-1-f05-user-stories.md
documentation:
  - doc-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** my original content to be stored without modification
**so that** I never lose fidelity to what I actually captured.

No transformation or truncation of stored data.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The stored `raw` field for text and URL items exactly matches the original clipboard string
- [ ] #2 The stored `raw` field for file items is byte-for-byte identical to the original file
- [ ] #3 No truncation, normalisation, or transformation is applied to the stored payload
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
