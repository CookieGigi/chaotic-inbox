---
id: TASK-44
title: '[Epic 2] F-09: New text items receive one-sentence summary after opt-in'
status: To Do
assignee: []
created_date: '2026-03-18 00:10'
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
**I want** a short summary to appear below my text captures once AI summaries are enabled,
**so that** I can scan the feed and understand each item without reading the full content.

One-sentence summary generated for each new text item after model is ready.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 After model is ready, every new `text` item triggers summary generation
- [ ] #2 The summary is one sentence, displayed below the block content in a muted style
- [ ] #3 The block updates in place when the summary is ready — no navigation or reload
- [ ] #4 The raw text content is unchanged — the summary is written only to `meta.summary`
- [ ] #5 While the summary is generating, the block shows a subtle loading indicator in the summary area
- [ ] #6 After 3 failed generation attempts, `enrichmentStatus` is set to `failed` and a retry affordance is shown (see F-10)
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
