# Epic 1 — Capture: F-06 User Stories

**Feature:** F-06 — Keyboard-First Capture
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-14

---

## User Stories

---

### US-06-01 — Paste with no element focused

**As a** user,
**I want** to press `Cmd+V` / `Ctrl+V` when no input field is focused
**so that** I can capture from the clipboard the moment I switch to the app, without clicking anything first.

> **Note:** This story overlaps with US-01-01 (owned by F-01). It is restated here because F-06 owns the global listener mechanism; F-01 owns the paste-to-capture outcome. Both features share the same acceptance criteria for this scenario.

**Acceptance Criteria**
- App launched, no element focused, `Cmd+V` / `Ctrl+V` pressed → item is captured and appended to the feed
- The feed scrolls to the new block
- No click, focus, or navigation step is required before the keystroke

---

### US-06-02 — Paste works on macOS and Windows / Linux

**As a** user,
**I want** the global paste shortcut to work on whichever OS I am running
**so that** I do not have to think about which modifier key to use.

**Acceptance Criteria**
- `Cmd+V` on macOS captures the clipboard contents as a new block
- `Ctrl+V` on Windows and Linux captures the clipboard contents as a new block
- Behaviour is otherwise identical across platforms

---

### US-06-03 — Global paste listener does not conflict with OS-level shortcuts

**As a** user,
**I want** the app's paste listener to stay out of the way of my OS and other apps
**so that** switching to the app never causes unexpected side effects.

**Acceptance Criteria**
- The listener only fires when the app window has focus
- No OS-level paste shortcut is intercepted or suppressed outside of the app window
- No conflict arises with OS clipboard manager shortcuts on any supported platform (e.g. `Cmd+Shift+V` on macOS, `Win+V` on Windows)

---

### US-06-04 — Normal paste inside text inputs is unaffected

**As a** user,
**I want** pasting into any text input or editable field inside the app to behave normally
**so that** the global listener never double-captures or interferes with in-app text editing.

> **Note:** This story overlaps with US-01-04 (owned by F-01). It is restated here because F-06 owns the global listener implementation; F-01 owns the paste-to-capture outcome. Both features share the same acceptance criteria for this edge case.

**Acceptance Criteria**
- Pasting inside an `<input>`, `<textarea>`, or `contenteditable` element pastes into that field only
- No duplicate block is created in the feed
- The global listener yields to focused editable elements

---

## Decision Record

### No additional keyboard shortcuts in Epic 1

No keyboard shortcuts beyond `Cmd+V` / `Ctrl+V` are introduced in this epic. This is a deliberate constraint to avoid disrupting existing muscle memory and OS-level bindings. Any future shortcuts belong to a later epic and must be explicitly scoped.

- No shortcut help overlay, tooltip, or documentation references shortcuts that do not exist in Epic 1

---

## Cross-Cutting Story (owned by F-05)

### US-05-05 — Storage failure is surfaced to the user

> **Note:** This story is owned by **F-05 — Local-First Persistence**. It applies to all capture triggers including the keyboard listener. If a paste initiated via `Cmd+V` / `Ctrl+V` cannot be written to local storage, the failure behaviour is governed by US-05-05. F-06 inherits this guarantee via F-01.

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-06-01 | F-01 US-01-01 — shared scenario; F-05 persistence via F-01 |
| US-06-02 | F-01 paste detection |
| US-06-03 | F-01 global listener implementation |
| US-06-04 | F-01 US-01-04 — shared acceptance criteria |
