---
id: TASK-13
title: '[Epic 1] F-03: Pasted URL renders as a URL block'
status: To Do
assignee: []
created_date: '2026-03-18 00:00'
updated_date: '2026-03-18 00:25'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - backlog://doc/doc-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** a pasted URL to render differently from plain text
**so that** I can identify links at a glance without reading the full string.

URL blocks show hostname as muted label with full URL as body.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Clipboard text matching `http://` or `https://` is saved and rendered as type `url`, not `text`
- [ ] #2 The block displays the hostname as a muted label with the full URL as body text
- [ ] #3 No favicon or link preview is fetched or shown
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-1-f03-user-stories.md](./specs/epic-1-f03-user-stories.md)
- [Doc: doc-4](backlog://doc/doc-4)
