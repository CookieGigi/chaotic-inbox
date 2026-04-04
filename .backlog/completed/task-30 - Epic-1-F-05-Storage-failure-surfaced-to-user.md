---
id: TASK-30
title: '[Epic 1] F-05: Storage failure surfaced to user'
status: Done
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-04-03 17:18'
labels:
  - phase-5
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f05-user-stories.md
documentation:
  - 'backlog://doc/doc-6'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to be informed if my item could not be saved
**so that** I am never left believing something was captured when it wasn't.

Clear error feedback on storage failures with retry option.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 If the local storage write fails (e.g. quota exceeded, permission denied, disk full), no block is appended to the feed
- [x] #2 The user is shown an error message explaining that the item could not be saved
- [x] #3 The original clipboard content or file is not discarded — the user can retry
- [x] #4 No partial or unconfirmed block is ever shown in the feed
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Tests pass
- [x] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
