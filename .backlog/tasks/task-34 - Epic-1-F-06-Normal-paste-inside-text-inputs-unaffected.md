---
id: TASK-34
title: '[Epic 1] F-06: Normal paste inside text inputs unaffected'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-03-18 00:25'
labels:
  - phase-5
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f06-user-stories.md
documentation:
  - backlog://doc/doc-7
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** pasting into any text input or editable field inside the app to behave normally
**so that** the global listener never double-captures or interferes with in-app text editing.

Global listener yields to focused editable elements.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Pasting inside an `<input>`, `<textarea>`, or `contenteditable` element pastes into that field only
- [ ] #2 No duplicate block is created in the feed
- [ ] #3 The global listener yields to focused editable elements
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f06-user-stories.md](./specs/epic-1-f06-user-stories.md)
- [Doc: doc-7](backlog://doc/doc-7)
