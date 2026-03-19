---
id: TASK-62
title: Enhance Vitest test setup
status: Done
assignee: []
created_date: '2026-03-19 00:52'
updated_date: '2026-03-19 01:55'
labels:
  - Epic 0
  - Testing
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expand Vitest configuration with coverage reporting, test utilities, and testing best practices.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Code coverage reporting configured
- [x] #2 Test utilities and helpers created
- [x] #3 Mocking strategy documented
- [x] #4 Component testing utilities (e.g., render with providers)
- [x] #5 Test watcher optimized for development
- [x] #6 Coverage thresholds set
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Summary

Successfully enhanced Vitest test setup with the following changes:

### 1. Code Coverage Configuration ✓
- Configured V8 coverage provider in `vite.config.ts`
- Added reporters: html, text, text-summary
- Set coverage directory to `./coverage`
- Configured 80% thresholds for lines, functions, branches, and statements
- Excluded stories, type definitions, test files, and main.tsx from coverage

### 2. Test Utilities and Helpers ✓
- Created `src/test/utils/renderWithProviders.tsx` - Component wrapper with ErrorBoundary and StrictMode
- Created `src/test/utils/index.ts` - Central exports for all test utilities
- Re-exports Testing Library utilities for convenience
- Added `createRenderWithProviders` factory for custom configurations

### 3. Mocking Strategy Documented ✓
- Created `docs/testing/mocking.md` with comprehensive mocking guide
- Covers module mocking, API mocking (MSW), asset mocking, browser API mocks
- Includes examples and best practices

### 4. Component Testing Utilities ✓
- `renderWithProviders` wraps components with ErrorBoundary and StrictMode
- Mirrors production setup from main.tsx
- Configurable providers (can disable ErrorBoundary or StrictMode per test)
- Demonstrated in updated `src/App.test.tsx`

### 5. Test Watcher Optimized ✓
- Added `test:watch` script for development
- Added `test:ui` script with @vitest/ui for visual test runner
- Browser API mocks configured in setup.ts reduce test noise

### 6. Coverage Thresholds Set ✓
- Set to 80% for all metrics (lines, functions, branches, statements)
- Coverage report generated at `./coverage/index.html`
- Note: Current project coverage is below threshold (expected - more tests needed)

### New NPM Scripts
- `test:coverage` - Run tests with coverage report
- `test:ui` - Run tests with Vitest UI
- `test:watch` (existing) - Watch mode for development

### Files Created/Modified
- ✓ `vite.config.ts` - Coverage configuration
- ✓ `package.json` - New test scripts
- ✓ `src/test/setup.ts` - Enhanced with mocks and cleanup
- ✓ `src/test/utils/renderWithProviders.tsx` - New component wrapper
- ✓ `src/test/utils/index.ts` - New utility exports
- ✓ `src/test/utils.test.tsx` - Example tests demonstrating utilities
- ✓ `docs/testing/mocking.md` - Mocking documentation
- ✓ `src/App.test.tsx` - Updated to use new utilities
<!-- SECTION:NOTES:END -->
