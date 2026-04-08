---
id: TASK-99
title: Support editing of text and URL blocks via edit button
status: To Do
assignee: []
created_date: '2026-04-08 04:29'
updated_date: '2026-04-08 04:32'
labels:
  - feature
  - block-editing
  - epic-3
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add an edit button to text and URL blocks that allows users to modify the content of individual blocks. Each block should have its own edit affordance.

**Context:**

- The app has different block types: text, URL, image, and file
- Only text and URL blocks are editable (image and file content cannot be changed)
- There's already a `TextBlockEdit` component used for draft editing that can be adapted
- The storage layer uses Dexie (IndexedDB) with a simple schema
- The state management uses Zustand in `appStore.ts`
- Currently blocks have a header with icon, title, and timestamp

**User Value:**
Users often make mistakes when capturing content or want to update information. Allowing inline editing of individual text and URL blocks improves usability without cluttering the UI for non-editable block types.

**Scope:**

- Add an edit button/icon to editable blocks (text and URL only)
- Edit button should appear in the block header or near the content
- Clicking edit enters inline edit mode
- Non-editable blocks (image, file) should not show edit button
- Changes should persist to the database
- Cancel functionality to discard changes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Editable blocks (text, URL) display an edit button in their header
- [ ] #2 Clicking edit button enters inline edit mode
- [ ] #3 Text blocks show a textarea for editing
- [ ] #4 URL blocks show an input field for editing
- [ ] #5 Ctrl+Enter saves the changes and exits edit mode
- [ ] #6 Escape cancels the edit and restores original content
- [ ] #7 Edited content is persisted to IndexedDB
- [ ] #8 Non-editable blocks (image, file) do not show edit button
- [ ] #9 Edit button follows existing design system patterns
- [ ] #10 Changes are reflected immediately in the feed without refresh
- [ ] #11 Edit mode is accessible via keyboard
<!-- AC:END -->
