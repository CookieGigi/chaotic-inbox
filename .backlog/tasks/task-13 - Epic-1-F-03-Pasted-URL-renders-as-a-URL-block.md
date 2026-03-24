---
id: TASK-13
title: '[Epic 1] F-03: Pasted URL renders as a URL block'
status: In Progress
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-24 01:30'
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
**I want** a pasted URL to render differently from plain text
**so that** I can identify links at a glance without reading the full string.

URL blocks show hostname as muted label with full URL as body.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Clipboard text matching `http://` or `https://` is saved and rendered as type `url`, not `text`
- [ ] #2 The block displays the hostname as a muted label with the full URL as body text
- [ ] #3 No favicon or link preview is fetched or shown
- [ ] #4 URL block displays normalized URL with clickable styling
- [ ] #5 Hover state shows cursor pointer to indicate interactivity
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for URL block handling:

- Use `UrlMetadata` type with `kind: 'url'`, optional `title` and `favicon`
- Type guard `isUrlItem()` narrows to URL type
- Factory function `createUrlItem()` creates URL items with correct metadata
- Initial capture stores raw URL; enrichment adds title/favicon later
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

2026-03-24: UrlBlock refactored per code review feedback:

- Removed icon handling from component (icon will be handled by parent Block wrapper)

- Removed hostname label display - now shows only normalized URL

- Added cursor-pointer class for hover indication

- Updated all tests to reflect changes

- Component now focuses purely on URL content rendering
<!-- SECTION:NOTES:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
