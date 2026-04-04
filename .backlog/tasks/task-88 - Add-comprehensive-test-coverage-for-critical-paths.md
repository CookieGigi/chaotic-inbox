---
id: TASK-88
title: Add comprehensive test coverage for critical paths
status: To Do
assignee: []
created_date: '2026-04-04 06:01'
labels:
  - testing
  - quality
  - coverage
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
