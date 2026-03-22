---
id: TASK-16
title: '[Epic 1] F-03: Pasted image renders inline'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-22 09:03'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - 'backlog://doc/doc-4'
  - 'backlog://doc/doc-20'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** a screenshot or image pasted from my clipboard to appear inline in the feed
**so that** I can see the image content immediately without any extra steps.

Images render inline within the feed column.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 A clipboard image is rendered as type `image`, inline within the feed column
- [ ] #2 The image is constrained to the feed column width
- [ ] #3 No file icon or filename is shown — only the image itself
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for Image block handling:

- Use `ImageMetadata` type with `kind: 'image'`, optional `width` and `height`
- Type guard `isImageItem()` narrows to image type
- Factory function `createImageItem()` creates image items with correct metadata
- Raw field stores the Blob; metadata stores dimensions when available
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
