---
id: TASK-83
title: Enforce branded ISO8601Timestamp type validation
status: To Do
assignee: []
created_date: '2026-04-01 16:30'
labels:
  - typescript
  - type-safety
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

The `ISO8601Timestamp` branded type is defined but not enforced - it's cast without validation.

**Location**: `src/models/itemFactories.ts:13`

**Current code**:

```tsx
capturedAt: new Date().toISOString() as RawItem['capturedAt']
```

**Fix**: Create a type guard or factory function that validates the timestamp format before casting, ensuring type safety throughout the codebase.

<!-- SECTION:DESCRIPTION:END -->
