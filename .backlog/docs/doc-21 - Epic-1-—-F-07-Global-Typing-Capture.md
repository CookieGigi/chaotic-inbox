---
id: doc-21
title: 'Epic 1 — F-07: Global Typing Capture'
type: other
created_date: '2026-03-27 02:49'
---

# Epic 1 — Capture: F-07 — Global Typing Capture

**Priority:** P1  
**Status:** Draft  
**Version:** 0.1.0  
**Last updated:** 2026-03-27

---

## Overview

Users can start typing anywhere in the app to instantly create a new text block. No button, no modal, no focus required — just begin typing and the app responds.

This provides a zero-friction way to capture thoughts that are too short to warrant opening a text editor, or when the user prefers typing over pasting.

---

## Description

When the user types any alphanumeric key (a-z, A-Z, 0-9) with no input field focused, a draft text block immediately appears at the bottom of the feed in edit mode. The first keystroke is captured as the initial content.

The draft block behaves like an inline text editor:

- Multi-line support (Enter creates newlines)
- No character limit
- Plain text only
- Visual distinction from read-only blocks

---

## Behaviour

### Trigger

- **Global key listener** on the app window
- **Trigger keys**: alphanumeric characters only (a-z, A-Z, 0-9)
- **Ignored**: symbols (-, =, etc.), modifier keys (Ctrl, Alt, Meta, Shift), special keys (arrows, F-keys)
- **Blocked when**: any input field is focused, drag overlay is active

### Draft Creation

- Draft appears at **bottom of feed** (newest position)
- Auto-focused textarea with first keystroke as initial content
- Visual indicator that this is a draft (distinct styling)
- Hint text: "Ctrl+Enter to save, Escape to cancel"

### Editing

- **Enter**: Creates newline (multi-line support)
- **Ctrl+Enter**: Submits and persists the block
- **Escape**: Cancels and removes the draft
- **Click outside**: Keeps draft visible (does not cancel)
- **Backspace on empty**: Draft remains (not auto-deleted)
- **Paste in draft**: Treated as plain text (no URL detection)

### Submission

- Empty content on Ctrl+Enter → draft removed, no persistence
- Non-empty content → create via `createTextItem()`, persist, scroll to new block
- Draft transitions to read-only TextBlock

### Constraints

- **Only one draft allowed** at a time
- **Draft is NOT persisted** — lost on page refresh
- **URL-only content** still saved as text (no capture-time URL detection)

---

## Acceptance Criteria

- Typing 'a' with no input focused creates draft with "a" as content
- Typing symbols does NOT create a draft
- Draft appears at bottom of feed with distinct visual style
- Ctrl+Enter persists and transitions to read-only block
- Escape removes draft without persistence
- Clicking outside keeps draft visible
- Backspace on empty draft doesn't delete it
- Drag overlay active → typing ignored
- Empty content on Ctrl+Enter → no persistence
- Focused input → typing works normally (no draft created)
- Only one draft can exist at a time

---

## Dependencies

- F-03 block type detection
- F-03 TextBlock component
- F-04 Feed component
- F-05 persistence layer

---

## Cross-Cutting Stories

- US-03-XX — Text with embedded URL renders as text block (existing)
- US-07-XX — Global typing capture (new user stories below)

---

## Technical Notes

### Global Key Listener Strategy

```typescript
// Listen on window keydown
// Check: not focused in input/textarea/contenteditable
// Check: key is alphanumeric (regex: /^[a-zA-Z0-9]$/)
// Prevent default, create draft with the character
```

### Draft State Management

```typescript
// Draft item has temporary 'draft' ID
// Rendered after all existing items in feed
// Auto-scroll to keep draft visible
// Separate from persisted items
```

### Component Architecture

```
App
└── useGlobalTyping (creates draft)
    └── Feed (receives draftItem)
        ├── FeedList (existing items)
        └── DraftBlock (conditional)
            └── TextBlockEdit (textarea)
                └── hint + keyboard handlers
```
