---
id: TASK-30
title: '[Epic 1] F-05: Storage failure surfaced to user'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
labels: []
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
**I want** to be informed if my item could not be saved
**so that** I am never left believing something was captured when it wasn't.

Clear error feedback on storage failures with retry option.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 If the local storage write fails (e.g. quota exceeded, permission denied, disk full), no block is appended to the feed
- [ ] #2 The user is shown an error message explaining that the item could not be saved
- [ ] #3 The original clipboard content or file is not discarded — the user can retry
- [ ] #4 No partial or unconfirmed block is ever shown in the feed
<!-- AC:END -->
