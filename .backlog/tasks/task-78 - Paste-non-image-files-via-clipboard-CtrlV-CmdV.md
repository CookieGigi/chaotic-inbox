---
id: TASK-78
title: Paste non-image files via clipboard (Ctrl+V/Cmd+V)
status: To Do
assignee: []
created_date: '2026-03-29 16:06'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

**As a** user,
**I want** to press `Cmd+V` / `Ctrl+V` to paste non-image files (PDF, ZIP, etc.) from my clipboard
**so that** I can capture files without using drag-and-drop.

Currently, the global paste handler only supports:

- Images (image/\* MIME types)
- Text (text/plain)

Non-image files are silently ignored (per TASK-5). This feature would extend paste functionality to handle files copied from the file system.

**Implementation notes:**

- Files copied from the OS file manager appear as `Files` type in clipboardData
- Need to handle `event.clipboardData.files` array
- Should create appropriate file blocks with metadata (filename, size, type icon)
- Similar to drag-and-drop file handling but via paste event
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Pasting a PDF file creates a file block with FilePdf icon
- [ ] #2 Pasting a ZIP file creates a file block with FileZip icon
- [ ] #3 Pasting an unknown binary file creates a file block with FileBinary icon
- [ ] #4 Each file shows its filename and file size
- [ ] #5 Multiple files can be pasted at once (if supported by OS)
- [ ] #6 Paste in text input fields should still work normally (no change to existing behavior)
<!-- AC:END -->
