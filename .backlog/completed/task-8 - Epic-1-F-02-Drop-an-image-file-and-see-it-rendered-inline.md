---
id: TASK-8
title: '[Epic 1] F-02: Drop an image file and see it rendered inline'
status: Done
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-30 05:24'
labels:
  - phase-3b
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f02-user-stories.md
documentation:
  - 'backlog://doc/doc-3'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** a dropped image file to appear as an inline image in the feed
**so that** I can see the image content without any extra steps.

Image files (png, jpg, gif, webp) render as image blocks, not file blocks.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Dropping a `.png`, `.jpg`, `.gif`, or `.webp` file produces an image block, not a file block
- [x] #2 The image is rendered inline, constrained to the feed column width
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
