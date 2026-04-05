---
id: TASK-88
title: Add comprehensive test coverage for critical paths
status: In Progress
assignee: []
created_date: '2026-04-04 06:01'
updated_date: '2026-04-05 05:47'
labels:
  - testing
  - quality
  - coverage
  - order-3
milestone: m-0
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Achieve and maintain 80%+ test coverage across all modules with focus on critical user paths and edge cases.

**Coverage Gaps to Address:**

- Error paths in storage operations (persistence failures)
- Edge cases in file type detection
- Platform-specific keyboard behavior (macOS vs Windows/Linux)
- Image blob URL cleanup (memory leak prevention)
- Concurrent operations (paste while draft exists)
- IndexedDB quota exceeded scenarios

**New Tests Needed:**

- Storage error handling (try-catch blocks)
- File type detection with mock files
- Keyboard capture on different platforms
- Memory cleanup verification
- Concurrent user interactions
- quota exceeded handling

**Testing Categories:**

- Unit tests for utilities and hooks
- Integration tests for storage operations
- Component tests for UI interactions
- E2E tests for critical user journeys

**Acceptance Criteria:**

- [ ] Line coverage >= 80%
- [ ] Function coverage >= 80%
- [ ] Branch coverage >= 80%
- [ ] Statement coverage >= 80%
- [ ] All error paths have tests
- [ ] All critical user paths have E2E tests
- [ ] CI pipeline enforces coverage thresholds
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

## Phase 1: Fix Existing Test Issues (Critical)

1. Fix mock resolution issues in useGlobalPaste.test.ts (currently 20+ skipped tests)
2. Fix mock resolution issues in useGlobalDrop.test.ts (7 unhandled errors)
3. Fix mock resolution issues in useGlobalTyping.test.ts

## Phase 2: Add Missing Unit Tests

4. Create src/lib/logger.test.ts - Test logger and debug utilities
5. Create src/lib/debug/wdyr.test.ts - Test why-did-you-render integration
6. Create src/utils/dom.test.ts - Test isInputElement utility
7. Add tests for extractHostname edge cases in itemFactories.test.ts

## Phase 3: Improve Branch Coverage

8. Add error path tests for storage operations (appStore error handling)
9. Add edge case tests for file type detection in useGlobalDrop
10. Add edge case tests for URL validation in useGlobalPaste
11. Add tests for ImageBlockContent blob URL cleanup in Block.test.tsx

## Phase 4: E2E and Integration Tests

12. Add concurrent operation tests (paste while draft exists)
13. Add storage quota exceeded scenario tests
14. Add platform-specific keyboard behavior tests (macOS vs Windows/Linux modifiers)

## Phase 5: CI and Coverage Enforcement

15. Verify coverage thresholds pass in CI
16. Add coverage badge to project documentation

## Acceptance Criteria Tracking:

- [ ] Line coverage >= 80% (Currently: 87.57% ✓)
- [ ] Function coverage >= 80% (Currently: 84.21% ✓)
- [ ] Branch coverage >= 80% (Currently: 79.73% - NEEDS WORK)
- [ ] Statement coverage >= 80% (Currently: 87.57% ✓)
- [ ] All error paths have tests
- [ ] All critical user paths have E2E tests
- [ ] CI pipeline enforces coverage thresholds
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

**Current Coverage Status:**
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Statements | 87.57% | 80% | ✓ |
| Branches | 79.73% | 80% | ✗ (0.27% below) |
| Functions | 84.21% | 80% | ✓ |
| Lines | 91.27% | 80% | ✓ |

**Key Files Missing Coverage:**

1. `src/lib/logger.ts` (97 lines, 0%) - Not included in coverage report
2. `src/lib/debug/wdyr.ts` (57 lines, 0%) - Not included in coverage report
3. `src/store/appStore.ts` (63% stmts, 39% funcs, 62.5% branches)
4. `src/hooks/useGlobalDrop.ts` (74% stmts, 50% branches)

**Test Files with Issues:**

- useGlobalPaste.test.ts: 20+ skipped tests due to mock resolution
- useGlobalDrop.test.ts: 7 unhandled errors
- useGlobalTyping.test.ts: Mock issues

**Coverage Gaps to Address:**

- Error paths in storage operations (persistence failures)
- Edge cases in file type detection
- Platform-specific keyboard behavior
- Image blob URL cleanup (memory leak prevention)
- Concurrent operations (paste while draft exists)
- IndexedDB quota exceeded scenarios
<!-- SECTION:NOTES:END -->
