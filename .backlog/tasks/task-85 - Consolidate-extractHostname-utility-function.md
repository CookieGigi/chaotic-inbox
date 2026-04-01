---
id: TASK-85
title: Consolidate extractHostname utility function
status: To Do
assignee: []
created_date: '2026-04-01 16:30'
labels:
  - refactor
  - code-duplication
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

The `extractHostname` function is duplicated in two files:

- `src/models/itemFactories.ts:42-48`
- `src/hooks/useGlobalPaste.ts:49-55`

**Fix**: Move to `src/utils/dom.ts` or create `src/utils/url.ts` and import from both locations.

<!-- SECTION:DESCRIPTION:END -->
