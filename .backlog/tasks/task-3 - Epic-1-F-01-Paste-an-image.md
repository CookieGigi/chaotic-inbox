---
id: TASK-3
title: '[Epic 1] F-01: Paste an image'
status: Done
assignee: []
created_date: '2026-03-17 23:59'
updated_date: '2026-03-29 15:57'
labels:
  - phase-3a
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f01-user-stories.md
documentation:
  - 'backlog://doc/doc-2'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to paste a screenshot or image from my clipboard
**so that** it appears inline in my feed without saving a file manually.

Images from clipboard should render inline without any file dialog.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 A clipboard image is captured and rendered inline in the feed
- [x] #2 No file dialog or save step is required
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Image paste handling via clipboardData.items. Images converted to File/Blob and rendered inline via object URLs. No file dialog required. Tests: 'should create image item when image is pasted', 'should handle multiple image types'

<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
