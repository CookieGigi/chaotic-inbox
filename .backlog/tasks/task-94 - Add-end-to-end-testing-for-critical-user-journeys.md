---
id: TASK-94
title: Add end-to-end testing for critical user journeys
status: To Do
assignee: []
created_date: '2026-04-04 06:02'
labels:
  - testing
  - e2e
  - playwright
milestone: m-0
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create E2E tests for critical user paths using Playwright (already installed).

**Critical User Journeys:**

1. Paste text → Item appears in feed
2. Paste URL → URL block created
3. Paste image → Image block rendered
4. Drop file → File block created
5. Type text + Ctrl+Enter → Text block saved
6. Escape during draft → Draft cancelled
7. Refresh page → Items persisted
8. Scroll position → Restored on reload

**Test Scenarios:**

- Happy paths for all input types
- Error scenarios (quota exceeded, offline)
- Keyboard navigation
- Paste while draft active
- Multiple items pasted
- Multiple files dropped

**Implementation:**

1. Configure Playwright E2E tests
2. Create test fixtures for database
3. Write tests for each critical journey
4. Add to CI pipeline
5. Add visual regression tests (optional)

**Acceptance Criteria:**

- [ ] Playwright configured for E2E tests
- [ ] All 8 critical journeys have passing tests
- [ ] E2E tests run in CI pipeline
- [ ] Test fixtures for mock data created
- [ ] Tests run in < 5 minutes total
<!-- SECTION:DESCRIPTION:END -->
