---
id: TASK-64
title: Implement Timestamp component for F-03
status: Done
assignee: []
created_date: '2026-03-22 09:44'
updated_date: '2026-03-22 09:58'
labels:
  - F-03
  - component
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create the Timestamp component as the first component in the F-03 block rendering system.

**Requirements:**

- Display relative time with three formats:
  - Today: "HH:MM" format
  - This year: "Mon DD" format (e.g., "Mar 22")
  - Older: "Mon DD, YYYY" format (e.g., "Mar 22, 2024")
- Use design tokens: `--color-text-muted` and `--text-sm`
- Component receives an ISO8601 timestamp

**Files to create:**

- `src/components/Timestamp/Timestamp.tsx`
- `src/components/Timestamp/Timestamp.stories.tsx`
- `src/components/Timestamp/Timestamp.test.tsx`
- `src/components/Timestamp/index.ts`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Timestamp component displays 'HH:MM' for today's timestamps
- [x] #2 Timestamp component displays 'Mon DD' for timestamps from this year
- [x] #3 Timestamp component displays 'Mon DD, YYYY' for older timestamps
- [x] #4 Component uses --color-text-muted and --text-sm design tokens
- [x] #5 Storybook stories cover all three time range cases
- [x] #6 Unit tests verify correct formatting for each time range
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

**Timestamp component updated to TASK-23 spec**

**Format now matches TASK-23:**

- Today: `HH:MM`
- This year: `Mon DD · HH:MM`
- Older: `YYYY Mon DD · HH:MM`

**Times displayed in local timezone** (user's browser timezone)

**Tests added (12 total):**

- Basic format tests (today, this year, older)
- Edge cases (yesterday, last year, leap year, new year)
- Component rendering tests (<time> element, datetime attr, CSS classes)
- Tooltip verification
- Today format without date prefix verification

All tests pass and TypeScript compiles cleanly.

<!-- SECTION:FINAL_SUMMARY:END -->
