---
id: TASK-17
title: '[Epic 1] F-03: Dropped non-image file renders with type-specific icon'
status: To Do
assignee: []
created_date: '2026-03-18 00:01'
updated_date: '2026-03-22 09:03'
labels:
  - phase-2
milestone: m-0
dependencies: []
references:
  - ./specs/epic-1-f03-user-stories.md
documentation:
  - 'backlog://doc/doc-4'
  - 'backlog://doc/doc-20'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** a dropped file to show its filename, size, and a recognisable icon
**so that** I can identify what I captured at a glance without opening it.

File blocks show type icons from Phosphor Icons library.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Dropping a `.pdf` → file block with `FilePdf` icon, filename, and file size
- [ ] #2 Dropping a `.zip` or archive → file block with `FileZip` icon, filename, and file size
- [ ] #3 Dropping a `.md` → file block with `FileMd` icon, filename, and file size
- [ ] #4 Dropping a `.txt` → file block with `FileText` icon, filename, and file size
- [ ] #5 Dropping an unknown or binary file → file block with `FileBinary` icon, filename, and file size
- [ ] #6 No content preview is shown for file blocks
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

### Implementation Notes

Reference the Item & Metadata Model (doc-20) for FileMetadata:

- Use `FileMetadata` type with `kind`, `filename`, `filesize`, `mimetype` fields
- Type guard `isFileItem()` narrows to file type with correct metadata
- Factory function `createFileItem()` ensures proper metadata construction
- Render based on `kind` field for type-specific icons
<!-- SECTION:PLAN:END -->

## Definition of Done

<!-- DOD:BEGIN -->

- [ ] #1 Tests pass
- [ ] #2 Documentation updated
- [ ] #3 No regressions introduced
<!-- DOD:END -->
