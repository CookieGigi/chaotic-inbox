---
id: TASK-14
title: '[Epic 1] F-03: Pasted text renders as a text block'
status: To Do
assignee: []
created_date: '2026-03-18 00:00'
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
**I want** pasted plain text to render in a readable body font
**so that** notes and snippets feel natural to read in the feed.

Text blocks use body font for natural reading experience.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Clipboard text that is not a URL is saved and rendered as type `text`
- [ ] #2 The block uses the body font (not monospace or a code style)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for Text block handling:

- Use `TextMetadata` type with `kind: 'plain' | 'markdown' | 'code'`
- Optional `wordCount` field for text statistics
- Type guard `isTextItem()` narrows to text type
- Factory function `createTextItem()` ensures proper metadata construction
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
