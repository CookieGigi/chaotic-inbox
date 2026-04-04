---
id: TASK-19
title: '[Epic 1] F-03: Text with embedded URL renders as text block'
status: Done
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-31 10:22'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - 'backlog://doc/doc-4'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** pasted text that includes a URL within a sentence to be treated as plain text, not a URL block
**so that** notes and prose that happen to mention a link are not misclassified.

Only exact URL matches should trigger URL block type.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Clipboard text where the full string does not start with `http://` or `https://` is saved as type `text`, even if a URL appears within it (e.g. `"for NixOS — https://nixos.wiki/..."`)
- [x] #2 The block renders as a text block in body font, not as a URL block
- [x] #3 The embedded URL is visible as part of the text content — no special link rendering
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
