---
id: TASK-64
title: Implement Timestamp component for F-03
status: In Progress
assignee: []
created_date: '2026-03-22 09:44'
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

- [ ] #1 Timestamp component displays 'HH:MM' for today's timestamps
- [ ] #2 Timestamp component displays 'Mon DD' for timestamps from this year
- [ ] #3 Timestamp component displays 'Mon DD, YYYY' for older timestamps
- [ ] #4 Component uses --color-text-muted and --text-sm design tokens
- [ ] #5 Storybook stories cover all three time range cases
- [ ] #6 Unit tests verify correct formatting for each time range
<!-- AC:END -->
