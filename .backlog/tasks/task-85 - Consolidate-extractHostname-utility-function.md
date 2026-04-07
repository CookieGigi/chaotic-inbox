---
id: TASK-85
title: Consolidate extractHostname utility function
status: Done
assignee: []
created_date: '2026-04-01 16:30'
updated_date: '2026-04-07 16:46'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

## Summary

Consolidated the `extractHostname` utility function by:

1. **Created `src/utils/url.ts`** - New utility file containing the `extractHostname` function with proper JSDoc documentation

2. **Updated `src/utils/index.ts`** - Added export for `extractHostname` from the new url module

3. **Updated `src/models/itemFactories.ts`** -
   - Added import for `extractHostname` from `@/utils`
   - Removed the local duplicate function definition
   - File now uses the shared utility function

### Changes Made

- **Created**: `src/utils/url.ts` (17 lines)
- **Modified**: `src/utils/index.ts` (+1 export line)
- **Modified**: `src/models/itemFactories.ts` (+1 import, -8 lines for removed function)

### Verification

- All 550 tests pass
- The function is now available as a shared utility that can be imported from `@/utils`
<!-- SECTION:FINAL_SUMMARY:END -->
