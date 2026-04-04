---
id: TASK-47
title: '[Epic 2] F-09: Disabling AI summaries stops future summarisation'
status: To Do
assignee: []
created_date: '2026-03-18 00:11'
updated_date: '2026-03-18 00:15'
labels: []
milestone: m-1
dependencies: []
references:
  - ./specs/epic-2-enrichment-user-stories-1.md
documentation:
  - backlog://doc/doc-11
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to be able to turn off AI summaries at any time,
**so that** I can stop generating summaries without losing what I've already captured.

Toggle off stops new summaries; existing summaries remain visible.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Toggling AI summaries off immediately stops summary generation for new captures
- [ ] #2 Existing summaries on already-enriched blocks remain visible — they are not deleted
- [ ] #3 The model is not deleted from cache when the setting is turned off — re-enabling does not require a re-download
- [ ] #4 No confirmation dialog is shown when disabling
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-2-enrichment-user-stories-1.md](./specs/epic-2-enrichment-user-stories-1.md)
- [Doc: doc-11](backlog://doc/doc-11)
