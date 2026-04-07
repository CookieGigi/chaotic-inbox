---
id: TASK-86
title: Remove or document unused isPasting return value
status: Done
assignee: []
created_date: '2026-04-01 16:30'
updated_date: '2026-04-07 17:06'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Removed the unused `isPasting` return value from the `useGlobalPaste` hook.

**Changes made to `src/hooks/useGlobalPaste.ts`:**

- Removed `useRef` from React imports
- Removed the `UseGlobalPasteReturn` interface (was unused)
- Changed function return type from `UseGlobalPasteReturn` to `void`
- Removed `isPastingRef` declaration
- Removed `isPastingRef.current = true/false` assignments in the try/finally blocks
- Removed the try/finally blocks entirely (they only existed for the isPasting tracking)
- Removed the return statement at the end of the hook

**Verification:**

- All 25 existing tests pass
- TypeScript compilation succeeds with no errors
- No changes needed to `App.tsx` or test files since they didn't use the return value

The hook is now simpler and more focused - it only performs side effects (capturing paste events) without returning any state.

<!-- SECTION:FINAL_SUMMARY:END -->
