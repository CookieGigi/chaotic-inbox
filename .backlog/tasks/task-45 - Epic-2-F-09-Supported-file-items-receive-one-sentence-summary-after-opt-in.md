---
id: TASK-45
title: '[Epic 2] F-09: Supported file items receive one-sentence summary after opt-in'
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
**I want** dropped PDFs, markdown files, and plain text files to also be summarised,
**so that** file captures are as scannable as text captures.

PDF, markdown, and plain text files get summaries; other file types are skipped.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 After model is ready, every new `file` item with `mimetype` of `application/pdf`, `text/markdown`, or `text/plain` triggers summary generation
- [ ] #2 Summary behaviour, display, and failure handling are identical to US-09-04
- [ ] #3 File types not in the supported list (zip, binary, unknown) are silently skipped — `enrichmentStatus: skipped`, no placeholder shown
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
