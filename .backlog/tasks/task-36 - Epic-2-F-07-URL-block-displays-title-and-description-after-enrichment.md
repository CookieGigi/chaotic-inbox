---
id: TASK-36
title: '[Epic 2] F-07: URL block displays title and description after enrichment'
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
  - backlog://doc/doc-9
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** the title and description of a pasted URL to appear on its block,
**so that** I can identify the page at a glance without opening it.

Title and description are displayed alongside the raw URL, never replacing it.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 On enrichment success, `meta.title` is displayed prominently on the block
- [ ] #2 `meta.description` is displayed below the title in a muted style
- [ ] #3 The raw URL remains visible — title and description are shown alongside it, not instead of it
- [ ] #4 The block updates in place without any navigation, reload, or scroll disruption
- [ ] #5 If the proxy returns a title but no description → title is shown, description area is absent (no empty placeholder)
- [ ] #6 If the proxy returns neither title nor description → block renders the raw URL only, with no empty metadata area
<!-- AC:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->

## Related Links

- [Spec: specs/epic-2-enrichment-user-stories-1.md](./specs/epic-2-enrichment-user-stories-1.md)
- [Doc: doc-9](backlog://doc/doc-9)
