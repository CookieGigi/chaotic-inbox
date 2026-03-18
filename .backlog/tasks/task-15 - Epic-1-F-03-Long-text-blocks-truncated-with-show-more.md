---
id: TASK-15
title: '[Epic 1] F-03: Long text blocks truncated with show more'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
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
**I want** long text blocks to be collapsed by default
**so that** the feed stays scannable and I'm not overwhelmed by a wall of text.

Truncate at 5 lines with expand/collapse affordance.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Text blocks longer than 5 lines are truncated at 5 lines on initial render
- [ ] #2 A "show more" affordance is visible below the truncated content
- [ ] #3 Tapping "show more" expands the full text in place — no navigation or modal
- [ ] #4 A "show less" affordance collapses the block back to 5 lines
- [ ] #5 The raw full text is always stored in full, regardless of UI truncation
- [ ] #6 The 5-line threshold is fixed and not user-configurable
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
