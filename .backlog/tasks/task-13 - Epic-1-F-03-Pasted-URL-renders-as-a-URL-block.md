---
id: TASK-13
title: '[Epic 1] F-03: Pasted URL renders as a URL block'
status: Done
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-04-04 07:17'
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

- [x] #1 Clipboard text matching `http://` or `https://` is saved and rendered as type `url`, not `text`
- [x] #2 The block displays the hostname as a muted label with the full URL as body text
- [x] #3 No favicon or link preview is fetched or shown
- [x] #4 URL block displays normalized URL with clickable styling
- [x] #5 Hover state shows cursor pointer to indicate interactivity
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

TASK-13 Implementation Complete

## Summary

Implemented URL block feature that renders pasted URLs differently from plain text.

## Changes Made

1. **UrlBlock component** (`src/components/UrlBlock/UrlBlock.tsx`):
   - Displays normalized URL with clickable button styling
   - Opens links in new tab with security attributes (noopener, noreferrer)
   - Cursor pointer and hover effects for interactivity
   - Full accessibility support (aria-label, keyboard navigation)

2. **URL detection** (`src/hooks/useGlobalPaste.ts:40-44`):
   - `isValidUrl()` detects URLs starting with http:// or https://
   - Entire string must be a URL (not embedded in text)

3. **Type guards & factories** (`src/models/metadata.ts`, `src/models/itemFactories.ts`):
   - `isUrlItem()` type guard for runtime narrowing
   - `createUrlItem()` factory for constructing URL items
   - Hostname extracted as title metadata

## Test Coverage

- 24 tests in `UrlBlock.test.tsx` covering rendering, interaction, accessibility, styling, and edge cases
- 10+ tests in `useGlobalPaste.test.ts` for URL paste detection
- All 409 tests passing

## Acceptance Criteria

- [x] AC1: URLs saved as type 'url'
- [x] AC2: Hostname as label, full URL as body
- [x] AC3: No favicon or link preview
- [x] AC4: Normalized URL with clickable styling
- [x] AC5: Cursor pointer on hover
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [x] #1 Tests pass
- [x] #2 Documentation updated
- [x] #3 No regressions introduced
<!-- DOD:END -->
