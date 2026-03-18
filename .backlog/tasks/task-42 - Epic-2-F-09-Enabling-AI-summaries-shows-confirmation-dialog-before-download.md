---
id: TASK-42
title: '[Epic 2] F-09: Enabling AI summaries shows confirmation dialog before download'
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
  - backlog://doc/doc-11
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to see a clear explanation of what enabling AI summaries involves before anything is downloaded,
**so that** I can make an informed decision about the storage and bandwidth cost.

Confirmation dialog explains model size (~2 GB) and on-device processing.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Toggling AI summaries on immediately shows a confirmation dialog before any download begins
- [ ] #2 The dialog states that a ~2 GB model (Phi-3 mini) will be downloaded
- [ ] #3 The dialog states that all processing happens on-device — no data is sent to any server
- [ ] #4 The dialog has two actions: "Download and enable" and "Cancel"
- [ ] #5 Choosing "Cancel" leaves the toggle off and initiates no download
- [ ] #6 Choosing "Download and enable" closes the dialog and begins the background download
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
