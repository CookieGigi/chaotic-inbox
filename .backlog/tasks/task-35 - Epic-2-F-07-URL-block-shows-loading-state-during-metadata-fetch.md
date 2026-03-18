---
id: TASK-35
title: '[Epic 2] F-07: URL block shows loading state during metadata fetch'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
labels: []
milestone: m-1
dependencies: []
references:
  - specs/epic-2-enrichment-user-stories-1.md
documentation:
  - doc-9
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**As a** user,
**I want** to see a subtle loading indicator on a URL block immediately after I paste a link,
**so that** I know enrichment is in progress and the block isn't stuck.

Loading indicator appears below the raw URL — the URL itself is always visible.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Immediately after a `url` item is persisted, its block shows a loading indicator in the metadata area
- [ ] #2 The loading indicator appears below the raw URL — the URL itself is always visible
- [ ] #3 The raw URL is never hidden or replaced during loading
- [ ] #4 The loading indicator is removed as soon as enrichment completes (success or failure)
<!-- AC:END -->
