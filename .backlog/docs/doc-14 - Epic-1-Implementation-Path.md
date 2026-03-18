---
id: doc-14
title: Epic 1 Implementation Path
type: other
created_date: '2026-03-18 00:24'
---
# Epic 1 Implementation Path

This document outlines the recommended implementation order for Epic 1 features, organized by dependency chains and logical groupings.

## Overview

Epic 1 focuses on the core capture and display functionality: pasting content, dropping files, rendering blocks, feed behavior, and local storage. The implementation follows a bottom-up approach: build the data layer first, then UI components, then input capture, then behavior polish.

---

## Phase 1: Foundation (Data Layer) - F-05 Storage

**Goal:** Establish the persistence layer before any UI work.

**Tasks:**
- TASK-26: Item persisted before appearing on screen
- TASK-27: Raw input stored exactly as captured
- TASK-28: Every item has unique ID and timestamp

**Why first:** All other features depend on items being stored. The "write-before-render" guarantee must be in place from day one.

**Key decisions:**
- Item schema: `{ id, timestamp, type, raw, metadata? }`
- Storage: localStorage or IndexedDB
- Synchronous write before UI update

---

## Phase 2: UI Components (Display Layer) - F-03 Render Blocks

**Goal:** Build the block rendering system for all content types.

**Tasks:**
- TASK-13: Pasted URL renders as a URL block
- TASK-14: Pasted text renders as a text block
- TASK-15: Long text blocks truncated with show more
- TASK-16: Pasted image renders inline
- TASK-17: Dropped non-image file renders with type-specific icon
- TASK-18: Block type is immutable after capture
- TASK-19: Text with embedded URL renders as text block

**Why second:** You need to know how items look before capturing them. Block components are the visual output of all capture flows.

**Block types to implement:**
- `text`: Plain text with truncation
- `url`: Hostname as label + full URL
- `image`: Inline image preview
- `file`: Icon + filename + metadata

---

## Phase 3: Input Capture

### 3a: Clipboard Paste - F-01 Paste

**Goal:** Enable global paste capture for all content types.

**Tasks:**
- TASK-1: Paste text anywhere in the app
- TASK-2: Paste a URL
- TASK-3: Paste an image
- TASK-4: Paste doesn't interfere with typing
- TASK-5: Empty or unsupported clipboard is silently ignored

**Dependencies:** F-05 (storage), F-03 (block rendering)

**Key challenges:**
- Global paste listener without focus requirement
- Distinguishing paste events from input field paste
- Image blob handling from clipboard

### 3b: Drag & Drop - F-02 Drop

**Goal:** Enable file drop anywhere on the app window.

**Tasks:**
- TASK-6: Drop a file anywhere on the app window
- TASK-7: See a visual cue while dragging
- TASK-8: Drop an image file and see it rendered inline
- TASK-9: Drop a non-image file and see its metadata
- TASK-10: Drop multiple files at once
- TASK-11: Drag over interactive elements without breaking
- TASK-12: Dragging URL or text from browser is ignored

**Dependencies:** F-05 (storage), F-03 (block rendering)

**Key challenges:**
- Window-wide drop target
- Drag overlay visual feedback
- Multi-file handling
- Filtering out non-file drags (URLs, text selections)

---

## Phase 4: Feed Behavior - F-04 Feed Behaviour

**Goal:** Implement feed scrolling, ordering, and state management.

**Tasks:**
- TASK-20: Feed opens at the right position on launch
- TASK-21: New capture scrolls feed to new block
- TASK-22: Items always in capture-time order
- TASK-23: Each block shows a timestamp
- TASK-24: Scroll position preserved between sessions
- TASK-25: Empty feed shows prompt on first launch

**Dependencies:** F-05 (storage), F-03 (blocks), F-01/F-02 (capture)

**Key behaviors:**
- Chronological sort (oldest top, newest bottom)
- Auto-scroll to bottom on new capture
- Scroll position save/restore
- Empty state messaging

---

## Phase 5: Error Handling & Polish

### 5a: Storage Resilience - F-05 Completion

**Tasks:**
- TASK-29: Items survive app restart
- TASK-30: Storage failure surfaced to user

### 5b: Cross-Platform Edge Cases - F-06 Cross-Platform

**Tasks:**
- TASK-31: Paste with no element focused
- TASK-32: Paste works on macOS and Windows/Linux
- TASK-33: Global paste listener doesn't conflict with OS shortcuts
- TASK-34: Normal paste inside text inputs unaffected

**Why last:** These are edge cases and refinements that require the core flow to be stable first.

---

## Dependency Graph

```
F-05 Storage (Phase 1)
    │
    ▼
F-03 Render Blocks (Phase 2)
    │
    ├──► F-01 Paste (Phase 3a)
    │
    └──► F-02 Drop (Phase 3b)
            │
            └──► F-04 Feed Behaviour (Phase 4)
                        │
                        └──► F-05 Completion + F-06 (Phase 5)
```

---

## Sprint Planning Suggestion

| Sprint | Focus | Deliverable |
|--------|-------|-------------|
| 1 | Phase 1 | Items save to storage, survive restart |
| 2 | Phase 2 | All block types render correctly |
| 3 | Phase 3a | Paste works for text/URL/image |
| 4 | Phase 3b | File drop works with visual feedback |
| 5 | Phase 4 | Feed scrolls, orders, restores position |
| 6 | Phase 5 | Error handling, edge cases, polish |

---

## Risk Mitigation

**High-risk items:**
- F-05 storage schema changes are expensive after F-03/F-04 exist
- F-01 global paste can conflict with OS shortcuts (test early)
- F-02 drag-and-drop has platform differences

**Mitigation:**
- Finalize schema in Phase 1 before building on it
- Test F-01 on target platforms immediately
- Implement F-02 with feature detection fallbacks

---

## Definition of Done for Epic 1

- [ ] All 34 tasks complete
- [ ] User can paste text/URL/image anywhere
- [ ] User can drop files anywhere
- [ ] All items persist and survive restart
- [ ] Feed shows items chronologically with timestamps
- [ ] Scroll position preserved across sessions
- [ ] No paste interference with normal typing
- [ ] Works on macOS and Windows/Linux
