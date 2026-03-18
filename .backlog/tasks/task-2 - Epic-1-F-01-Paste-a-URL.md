---
id: TASK-2
title: '[Epic 1] F-01: Paste a URL'
status: To Do
assignee: []
created_date: '2026-03-17 23:59'
updated_date: '2026-03-18 00:25'
labels:
  - phase-3a
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f01-user-stories.md
documentation:
  - backlog://doc/doc-2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** a pasted URL to be recognised and saved as a URL block
**so that** I can distinguish links from plain text at a glance.

URL detection happens at capture time and determines the block type.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Text starting with `http://` or `https://` is saved as type `url`, not `text`
- [ ] #2 The block renders the hostname as a muted label with the full URL as body
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f01-user-stories.md](./specs/epic-1-f01-user-stories.md)
- [Doc: doc-2](backlog://doc/doc-2)
