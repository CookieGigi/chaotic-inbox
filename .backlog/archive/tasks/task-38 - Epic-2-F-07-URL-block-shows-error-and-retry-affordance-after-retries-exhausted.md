---
id: TASK-38
title: >-
  [Epic 2] F-07: URL block shows error and retry affordance after retries
  exhausted
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-03-18 00:14'
labels: []
milestone: m-1
dependencies: []
references:
  - ./specs/epic-2-enrichment-user-stories-1.md
documentation:
  - backlog://doc/doc-9
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to see what went wrong and be able to retry manually when URL enrichment fails permanently,
**so that** I'm never left with a silently broken block.

Clear error message with retry option after all automatic retries fail.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 After 3 failed automatic attempts, the loading indicator is replaced by an error message describing the failure reason (e.g. "Could not reach page", "Proxy error", "Page did not respond")
- [ ] #2 The error message includes the number of retries remaining on the next manual attempt (e.g. "Could not reach page — 3 retries left")
- [ ] #3 A "Retry" affordance is shown alongside the error message
- [ ] #4 Tapping "Retry" resets the retry counter to 3, sets status back to `pending`, re-queues the enrichment, and shows the loading indicator again
- [ ] #5 The raw URL is always visible regardless of error state
- [ ] #6 The retry counter resets on every manual retry — manual retries are available indefinitely
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-2-enrichment-user-stories-1.md](./specs/epic-2-enrichment-user-stories-1.md)
- [Doc: doc-9](backlog://doc/doc-9)
