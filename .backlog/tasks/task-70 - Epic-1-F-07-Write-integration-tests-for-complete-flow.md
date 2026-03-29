---
id: TASK-70
title: '[Epic 1] F-07: Write integration tests for complete flow'
status: In Progress
assignee: []
created_date: '2026-03-27 02:59'
updated_date: '2026-03-29 06:09'
labels:
  - phase-4
  - testing
  - integration
milestone: m-0
dependencies: []
references:
  - ./backlog/docs/doc-21
documentation:
  - 'backlog://doc/doc-21'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Write end-to-end integration tests for the complete typing capture flow. Tests should cover: user types character → draft appears → user continues typing → user presses Ctrl+Enter → draft persists as text block → feed shows new block, and user types character → draft appears → user presses Escape → draft disappears.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 E2E test: full flow from typing to persisted block
- [ ] #2 E2E test: cancel flow removes draft without persistence
- [ ] #3 E2E test: only one draft exists at a time
- [ ] #4 E2E test: typing in input does not trigger draft
- [ ] #5 E2E test: draft appears at bottom of feed
<!-- AC:END -->
