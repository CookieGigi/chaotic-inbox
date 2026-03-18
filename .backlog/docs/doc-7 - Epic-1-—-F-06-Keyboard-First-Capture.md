---
id: doc-7
title: 'Epic 1 — F-06: Keyboard-First Capture'
type: other
created_date: '2026-03-17 23:57'
---

# Epic 1 — Capture: F-06 — Keyboard-First Capture

**Priority:** P1  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14

---

## Description

The entire capture flow is operable without a mouse. `Cmd+V` / `Ctrl+V` is the primary interaction; drag-and-drop is the parallel gesture for files.

---

## Behaviour

- Global paste listener requires no input to be focused.
- No new keyboard shortcuts are introduced in this epic beyond paste.
- No conflicts with OS-level bindings.

---

## Acceptance Criteria

- App launched, no element focused, `Cmd+V` pressed → item captured.
- Works on macOS (`Cmd+V`) and Windows/Linux (`Ctrl+V`).

---

## Decision Record

### No additional keyboard shortcuts in Epic 1

No keyboard shortcuts beyond `Cmd+V` / `Ctrl+V` are introduced in this epic. This is a deliberate constraint to avoid disrupting existing muscle memory and OS-level bindings. Any future shortcuts belong to a later epic and must be explicitly scoped.

- No shortcut help overlay, tooltip, or documentation references shortcuts that do not exist in Epic 1

---

## Dependencies

- F-01 US-01-01 — shared scenario
- F-01 US-01-04 — shared acceptance criteria
- F-05 persistence via F-01
