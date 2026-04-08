---
id: TASK-99
title: Support editing of block text and URL
status: To Do
assignee: []
created_date: '2026-04-08 04:29'
labels:
  - feature
  - block-editing
  - epic-3
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add the ability to edit existing text and URL blocks in the feed. Currently, blocks are immutable after creation - users can only add new items but cannot modify existing ones.

**Context:**

- The app has different block types: text, URL, image, and file
- There's already a `TextBlockEdit` component used for draft editing that can be adapted
- The storage layer uses Dexie (IndexedDB) with a simple schema
- The state management uses Zustand in `appStore.ts`

**User Value:**
Users often make mistakes when capturing content or want to update information. Allowing editing of text and URL blocks improves the usability and makes the app more practical for real-world use.

**Scope:**

- Focus on text and URL blocks only (image and file editing is out of scope)
- Edit should be triggered via some UI affordance (e.g., click to edit, or an edit button)
- Changes should persist to the database
- Cancel functionality to discard changes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 User can initiate edit mode on a text block
- [ ] #2 User can modify the text content in an inline textarea
- [ ] #3 Ctrl+Enter saves the changes and exits edit mode
- [ ] #4 Escape cancels the edit and restores original content
- [ ] #5 Edited text is persisted to IndexedDB
- [ ] #6 User can initiate edit mode on a URL block
- [ ] #7 User can modify the URL in an inline input field
- [ ] #8 Edited URL is validated before saving
- [ ] #9 Edited URL is persisted to IndexedDB
- [ ] #10 Edit UI follows existing design system patterns
- [ ] #11 Changes are reflected immediately in the feed without refresh
<!-- AC:END -->
