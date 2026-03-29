---
id: TASK-78
title: Paste non-image files via clipboard (Ctrl+V/Cmd+V)
status: Done
assignee: []
created_date: '2026-03-29 16:06'
updated_date: '2026-03-29 16:11'
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

- [x] #1 Pasting a PDF file creates a file block with FilePdf icon
- [x] #2 Pasting a ZIP file creates a file block with FileZip icon
- [x] #3 Pasting an unknown binary file creates a file block with FileBinary icon
- [x] #4 Each file shows its filename and file size
- [x] #5 Multiple files can be pasted at once (if supported by OS)
- [x] #6 Paste in text input fields should still work normally (no change to existing behavior)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Implemented non-image file paste support via clipboard (Ctrl+V/Cmd+V).

**Changes made:**

1. Modified `src/hooks/useGlobalPaste.ts` to handle files from `clipboardData.files`:
   - Added `getFileSubType()` helper to determine file type from extension
   - Added `processFile()` callback to create file items with metadata
   - Updated paste handler to process files before checking items for text
   - Files are now categorized as: pdf, docx, txt, zip, or other

2. Added comprehensive tests in `src/hooks/useGlobalPaste.test.ts`:
   - Test for PDF files with correct metadata
   - Test for ZIP files
   - Test for unknown file types (subtype: other)
   - Test for multiple files in single paste
   - Test for mixed files and images
   - Test that files don't append to draft (unlike text)

**Features:**

- Pasting PDF creates file block with FilePdf icon (metadata.kind: 'pdf')
- Pasting ZIP creates file block with FileZip icon (metadata.kind: 'zip')
- Unknown files use FileBinary icon (metadata.kind: 'other')
- Filename and filesize are captured in metadata
- Multiple files can be pasted at once
- Text input paste behavior remains unchanged

**All 27 tests pass.**

<!-- SECTION:FINAL_SUMMARY:END -->
