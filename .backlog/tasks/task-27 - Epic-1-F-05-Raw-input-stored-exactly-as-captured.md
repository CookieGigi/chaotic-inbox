---
id: TASK-27
title: '[Epic 1] F-05: Raw input stored exactly as captured'
status: Done
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-22 09:26'
labels:
  - phase-1
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f05-user-stories.md
documentation:
  - 'backlog://doc/doc-6'
  - 'backlog://doc/doc-20'
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

- [x] #1 The stored `raw` field for text and URL items exactly matches the original clipboard string
- [x] #2 The stored `raw` field for file items is byte-for-byte identical to the original file
- [x] #3 No truncation, normalisation, or transformation is applied to the stored payload
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for the raw field storage:

- The `raw` field stores original content without modification
- For text/URL items: store exact clipboard string
- For file items: store byte-for-byte identical Blob
- Factory functions in doc-20 guarantee raw field is preserved exactly as captured
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [x] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
