---
id: TASK-83
title: Enforce branded ISO8601Timestamp type validation
status: Done
assignee: []
created_date: '2026-04-01 16:30'
updated_date: '2026-04-05 09:31'
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

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 ISO8601Timestamp validation utilities created (isISO8601Timestamp, createISO8601Timestamp, parseISO8601Timestamp)
- [ ] #2 Validation accepts various ISO8601 formats (Z suffix, timezone offsets, date-only, space separator)
- [ ] #3 itemFactories.ts uses createISO8601Timestamp() instead of unsafe cast
- [ ] #4 Unit tests created in branded.test.ts with 17 test cases covering validation, factory, and parser functions
- [ ] #5 All 43 tests pass (17 branded + 26 itemFactories)
- [ ] #6 TypeScript type checking passes with no errors
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Code follows project TypeScript patterns and conventions
- [ ] #2 All new code is covered by unit tests
- [ ] #3 No breaking changes to existing functionality
<!-- DOD:END -->
