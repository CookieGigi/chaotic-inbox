---
id: TASK-25
title: '[Epic 1] F-04: Empty feed shows prompt on first launch'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
labels: []
milestone: m-0
dependencies: []
references:
  - specs/epic-1-f04-user-stories.md
documentation:
  - doc-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to see a clear indication that the feed is empty when I first open the app
**so that** I understand what to do next and don't think something has gone wrong.

Empty state communicates the capture gesture.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On first launch with no captured items, the feed displays an empty state message
- [ ] #2 The empty state communicates the capture gesture (paste or drop)
- [ ] #3 The empty state disappears immediately when the first item is captured
- [ ] #4 No empty state is shown if items exist but are scrolled out of view
<!-- AC:END -->
