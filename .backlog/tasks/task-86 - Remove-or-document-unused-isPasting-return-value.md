---
id: TASK-86
title: Remove or document unused isPasting return value
status: To Do
assignee: []
created_date: '2026-04-01 16:30'
labels:
  - cleanup
  - hooks
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

The `useGlobalPaste` hook returns `isPasting` but it's never used anywhere in the codebase.

**Location**: `src/hooks/useGlobalPaste.ts:218`

**Options**:

1. Remove the return value if not needed
2. Add documentation explaining potential use cases (e.g., showing loading state during paste)
3. Use it in the UI to provide feedback during paste operations
<!-- SECTION:DESCRIPTION:END -->
