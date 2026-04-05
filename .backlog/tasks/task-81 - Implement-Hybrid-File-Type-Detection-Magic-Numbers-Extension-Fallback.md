---
id: TASK-81
title: Implement Hybrid File Type Detection (Magic Numbers + Extension Fallback)
status: In Progress
assignee: []
created_date: '2026-03-31 19:56'
updated_date: '2026-04-05 11:11'
labels:
  - enhancement
  - security
  - file-handling
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Replace extension-only file type detection with a hybrid approach that uses magic numbers (file signatures) as primary detection method and file extensions as fallback. This improves security and accuracy by verifying actual file content rather than relying solely on potentially spoofed extensions.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Create utility module for magic number detection supporting all current file types (png, jpg, jpeg, gif, webp, pdf, zip, txt, docx, md)
- [ ] #2 Implement async file reading to check file headers (first 8-12 bytes)
- [ ] #3 Refactor isImageFile() to use magic numbers with extension fallback
- [ ] #4 Refactor getFileSubType() to use magic numbers with extension fallback
- [ ] #5 Ensure browser File/Blob API compatibility
- [ ] #6 Add error handling for unreadable files
- [ ] #7 Maintain backward compatibility with existing FileMetadata interface
- [ ] #8 Write unit tests for magic number detection
- [ ] #9 Update processFile() in useGlobalDrop.ts to use new detection methods
<!-- AC:END -->
