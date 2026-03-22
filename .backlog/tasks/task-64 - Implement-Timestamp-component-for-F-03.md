---
id: TASK-64
title: Implement Timestamp component for F-03
status: Done
assignee: []
created_date: '2026-03-22 09:44'
updated_date: '2026-03-22 09:49'
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

**Timestamp component implemented successfully**

**Files created:**

- `src/components/Timestamp/Timestamp.tsx` - Component with relative time formatting
- `src/components/Timestamp/Timestamp.stories.tsx` - Storybook stories (Today, ThisYear, Older, Yesterday, LastMonth)
- `src/components/Timestamp/Timestamp.test.tsx` - Unit tests with 5 test cases
- `src/components/Timestamp/index.ts` - Public exports

**Features:**

- Uses branded `ISO8601Timestamp` type for type safety
- Three time formats:
  - Today: "HH:MM" (e.g., "14:30")
  - This year: "Mon DD" (e.g., "Mar 22")
  - Older: "Mon DD, YYYY" (e.g., "Mar 22, 2024")
- Design tokens applied: `--color-text-muted` and `--text-sm`
- Full datetime shown on hover via title attribute

**Test coverage:** 5/5 passing

- Today format (HH:MM)
- This year format (Mon DD)
- Older format (Mon DD, YYYY)
- Yesterday edge case
- Last year edge case
<!-- SECTION:FINAL_SUMMARY:END -->
