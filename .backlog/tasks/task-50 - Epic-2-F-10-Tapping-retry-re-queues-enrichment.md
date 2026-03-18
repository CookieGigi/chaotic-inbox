---
id: TASK-50
title: '[Epic 2] F-10: Tapping retry re-queues enrichment'
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
**I want** to be able to retry a failed enrichment with a single tap,
**so that** I don't have to re-capture an item just because a network request failed.

Retry resets counter and re-queues enrichment — available indefinitely.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every block with `enrichmentStatus: failed` has a "Retry" affordance
- [ ] #2 Tapping "Retry" sets `enrichmentStatus` back to `pending`, resets the retry counter to 3, and re-queues the enrichment
- [ ] #3 The loading indicator replaces the error message immediately on tap
- [ ] #4 Manual retries are available indefinitely — there is no cap on how many times the user can manually retry
- [ ] #5 Retry is available for all enrichment types: URL metadata, AI summaries
<!-- AC:END -->
