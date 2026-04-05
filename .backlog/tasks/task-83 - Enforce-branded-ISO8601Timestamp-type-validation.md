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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Summary

Implemented proper validation for the `ISO8601Timestamp` branded type to enforce type safety throughout the codebase.

### Changes Made

1. **Enhanced `src/types/branded.ts`**:
   - Added `isISO8601Timestamp(value: string)` type guard with regex validation
   - Added `createISO8601Timestamp(date?: Date)` factory function for creating validated timestamps
   - Added `parseISO8601Timestamp(value: string)` parser function that returns `ISO8601Timestamp | null`
   - Regex accepts various ISO8601 formats: Z suffix, timezone offsets, date-only, space separator

2. **Updated `src/models/itemFactories.ts`**:
   - Replaced unsafe cast `new Date().toISOString() as RawItem['capturedAt']` with `createISO8601Timestamp()`
   - Added import for the new factory function

3. **Created `src/types/branded.test.ts`**:
   - 17 comprehensive test cases covering all validation functions
   - Tests for valid formats, invalid inputs, type narrowing, and edge cases

### Test Results

- ✅ All 17 branded type tests pass
- ✅ All 26 itemFactories tests pass
- ✅ TypeScript type checking passes with no errors

### Impact

- Runtime validation ensures only valid ISO8601 timestamps can be assigned to `ISO8601Timestamp` branded type
- Type guard enables safe parsing of external timestamp data
- Factory function provides type-safe timestamp creation
- No breaking changes to existing code
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Code follows project TypeScript patterns and conventions
- [ ] #2 All new code is covered by unit tests
- [ ] #3 No breaking changes to existing functionality
<!-- DOD:END -->
