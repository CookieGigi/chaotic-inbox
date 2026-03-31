---
id: TASK-80
title: 'Refactor: Extract scroll logic from Feed component'
status: To Do
assignee: []
created_date: '2026-03-31 19:39'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Move the scroll orchestration logic out of Feed.tsx into a dedicated hook `useFeedScroll` that coordinates with `useScrollPosition`. This will make Feed.tsx purely presentational and improve separation of concerns.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Create new hook `useFeedScroll` that handles all scroll effects currently in Feed.tsx
- [ ] #2 Feed.tsx uses the new hook and only receives `newestItemRef` and scroll state
- [ ] #3 All existing scroll behavior preserved (initial scroll, new items detection, position restoration)
- [ ] #4 Remove scroll-related useEffects from Feed.tsx
- [ ] #5 Hook is properly typed and documented
<!-- AC:END -->
