---
id: TASK-21
title: '[Epic 1] F-04: New capture scrolls feed to new block'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-04-01 16:21'
labels:
  - phase-4
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f04-user-stories.md
documentation:
  - 'backlog://doc/doc-5'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the feed to scroll automatically to a newly captured block
**so that** I get immediate confirmation that my item landed at the bottom.

Auto-scroll confirms successful capture. Only applies to items added during the current session (after mount).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 After any paste or drop during the session, the feed scrolls to the newly appended block
- [ ] #2 The scroll happens after the block is rendered, not before
- [ ] #3 Does not scroll on initial mount (position restoration handles that)
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
