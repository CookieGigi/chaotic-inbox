---
id: TASK-76
title: '[Epic 1] F-07: Write tests for useGlobalTyping hook'
status: To Do
assignee: []
created_date: '2026-03-27 03:00'
labels:
  - phase-4
  - testing
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Write unit tests for useGlobalTyping hook. Covers alphanumeric detection, ignoring symbols, respecting focused inputs, appending to existing draft, ignoring drag overlay, and cleanup.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Test typing 'a' creates draft
- [ ] #2 Test symbols do NOT create draft
- [ ] #3 Test focused input blocks draft
- [ ] #4 Test appends to existing draft
- [ ] #5 Test drag overlay blocks typing
- [ ] #6 Test cleanup on unmount
<!-- AC:END -->
