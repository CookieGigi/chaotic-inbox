---
id: TASK-29
title: '[Epic 1] F-05: Items survive app restart'
status: To Do
assignee: []
created_date: '2026-03-18 00:02'
updated_date: '2026-03-18 00:25'
labels:
  - phase-5
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f05-user-stories.md
documentation:
  - backlog://doc/doc-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** all my captured items to still be there when I reopen the app
**so that** the vault is a reliable record I can return to at any time.

All persisted items load on app launch.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 All items captured in previous sessions are loaded and rendered in the feed on launch
- [ ] #2 Items appear in the same capture-time order as when they were saved
- [ ] #3 No items are missing or corrupted after a normal close-and-reopen cycle
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f05-user-stories.md](./specs/epic-1-f05-user-stories.md)
- [Doc: doc-6](backlog://doc/doc-6)
