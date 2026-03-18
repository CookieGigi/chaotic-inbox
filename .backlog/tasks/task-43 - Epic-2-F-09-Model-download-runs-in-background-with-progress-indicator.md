---
id: TASK-43
title: '[Epic 2] F-09: Model download runs in background with progress indicator'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
updated_date: '2026-03-18 00:14'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-11
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to see the download progress without being blocked from using the app,
**so that** I can keep capturing while the model downloads.

Background download with persistent progress indicator.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After confirming, the model download begins in the background
- [ ] #2 A persistent progress indicator is visible (e.g. in a status bar or settings area) showing download percentage
- [ ] #3 The feed and all capture interactions remain fully functional during the download
- [ ] #4 If the download is interrupted (app closed, network lost), it resumes automatically on next launch
- [ ] #5 When the download completes, the progress indicator is replaced by a confirmation that AI summaries are ready
- [ ] #6 Summaries are only generated for items captured after the model is ready — not retroactively
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
