---
id: doc-13
title: Heynote — Feature Analysis
type: other
created_date: '2026-03-17 23:59'
---

# Heynote-Inspired Feed — Feature Analysis

**Context:** Epic 1 — Capture · Draft reference · 2026-03-14

---

## Core Concept

Heynote's central idea is a **single, continuous, append-only buffer**. Every item lands at the bottom of a growing feed. There is no filing, no folders, no decisions. This maps almost exactly onto Epic 1's vault model: an unorganized pile of raw inputs where order and meaning come later.

The key interaction principle to borrow: **the feed is the UI**. The user doesn't navigate to a destination to save something — they just paste or drop, and the item appears at the top (or bottom) of the stream.

---

## Features Worth Adopting

### 1. Block-based items

Each captured item is a discrete, visually separated block. Blocks are self-contained — they know their type (text, URL, image, file) and render accordingly. This avoids the wall-of-text problem of a raw log while still feeling like a live feed rather than a structured list.

### 2. Instant append on paste / drop

No confirmation, no modal, no form. The act of pasting _is_ the save action. The item appears immediately, persisted to local storage before any UI feedback. This is the "trust it won't disappear" guarantee from the Epic 1 user value statement.

### 3. Visible chronological ordering

Items are ordered strictly by capture time, newest visible first (or last — to be decided). No sorting, grouping, or filtering at this stage. The timestamp is the only metadata that matters at capture time.

### 4. Inline image rendering

Heynote renders pasted images inline within the feed. This is the right model: screenshots should be visible immediately, not represented as file icons. Files (PDFs, zips, binaries) can fall back to a typed block with filename and size.

### 5. Keyboard-first capture

Heynote is entirely keyboard-driven. For Epic 1, `Cmd+V` / `Ctrl+V` anywhere in the app should trigger capture with no focused input required. Drag-and-drop is the parallel gesture for files.

---

## Features to Explicitly Not Adopt

| Heynote Feature                    | Reason to Exclude                            |
| ---------------------------------- | -------------------------------------------- |
| Language-aware syntax highlighting | Out of scope — no enrichment at capture time |
| Math block evaluation              | Out of scope                                 |
| Multiple named buffers             | Contradicts the single-vault model           |
| Manual block deletion              | Epic 1: no editing or deleting items         |

---

## Open Questions for Design

- **Feed direction:** newest-at-top (inbox feel) vs. newest-at-bottom (chat/log feel)? Heynote uses bottom; most inboxes use top.
- **Block height:** should long text blocks be truncated with a "show more" affordance, or always fully expanded?
- **File blocks:** what does a dropped binary look like in the feed — icon + filename only, or a preview where possible?
- **Annotation entry point:** Heynote has no annotations; this needs to be designed from scratch without breaking the zero-friction capture flow.
