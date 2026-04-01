---
id: TASK-84
title: Add error boundary and user feedback for persistence failures
status: To Do
assignee: []
created_date: '2026-04-01 16:30'
labels:
  - ux
  - error-handling
  - user-feedback
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Database operations in App.tsx have try-catch blocks that only log errors to console without user feedback.

**Locations**:

- `src/App.tsx:64` - handlePasteItems
- `src/App.tsx:79` - handleDropItems
- `src/App.tsx:121` - handleDraftSubmit

**Fix**: Add a toast/notification system or error state display to inform users when items fail to save. Consider adding error boundary components for graceful degradation.

<!-- SECTION:DESCRIPTION:END -->
