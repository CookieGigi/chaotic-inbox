---
id: TASK-49
title: >-
  [Epic 2] F-10: Blocks in failed state show failure reason and retries
  remaining
status: To Do
assignee: []
created_date: '2026-03-18 00:11'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-12
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to understand why enrichment failed and how many retries I have left,
**so that** I can decide whether to retry or leave the block as-is.

Human-readable error message with retry count in metadata area.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Blocks with `enrichmentStatus: failed` show a human-readable failure reason (e.g. "Could not reach page", "Generation failed", "Proxy error")
- [ ] #2 The failure message includes retries remaining on the next manual attempt (e.g. "Could not reach page — 3 retries left")
- [ ] #3 The failure message is displayed in the metadata area — below the raw content, never over it
- [ ] #4 Blocks with `enrichmentStatus: done` show no status indicator
- [ ] #5 Blocks with `enrichmentStatus: skipped` show no status indicator and no empty metadata placeholder
<!-- AC:END -->
