---
id: doc-1
title: Epic 1 — Capture Overview
type: other
created_date: '2026-03-17 23:56'
updated_date: '2026-03-27 02:48'
---

# Epic 1 — Capture

**Status:** Draft  
**Version:** 0.4.0  
**Last updated:** 2026-03-27

---

## Goal

The user has something they don't want to lose.
They paste, drop, or type it. It's saved. Done.

The vault is an unorganized, append-only pile of raw inputs.
Order and meaning come later.

---

## User Value

> "I have a place where I can throw anything instantly
> and trust it won't disappear."

---

## Input Types

| Type    | Example                                                                            |
| ------- | ---------------------------------------------------------------------------------- |
| `url`   | `https://github.com/...`                                                           |
| `text`  | "look into Nix flake templates for Python" or "for NixOS — https://nixos.wiki/..." |
| `image` | Screenshot pasted from clipboard                                                   |
| `file`  | Any file — PDF, markdown, zip, binary, no size or format restrictions              |

---

## Core Behaviour

- Paste, drop, or type anything into the app → saved immediately to local storage
- Sync is local-first; synchronization to remote is eventual and automatic when network is available
- No decisions required at capture time
- Raw input is sacred — never modified, never truncated
- Annotations can be added to any item at any time; never required

---

## Out of Scope

- Any LLM, agent, or protocol involvement
- Classification, tagging, or enrichment
- Deduplication
- Search or recall
- Editing or deleting items

---

## Features in this Epic

1. **F-01 — Instant Append on Paste** (P0)
2. **F-02 — Drag-and-Drop File Capture** (P0)
3. **F-03 — Block Types and Rendering** (P0)
4. **F-04 — Chronological Feed (Newest at Bottom)** (P0)
5. **F-05 — Local-First Persistence** (P0)
6. **F-06 — Keyboard-First Capture** (P1)
7. **F-07 — Global Typing Capture** (P1) — _NEW: Type anywhere to create text blocks_

---

## Decisions Log (from Feature Spec)

| #   | Question                           | Decision                                                                                                                                                                                 |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Text block font                    | Body font (readable/natural feel)                                                                                                                                                        |
| 2   | File block icons                   | Type-specific (PDF, zip, image, etc.)                                                                                                                                                    |
| 3   | Truncation threshold configurable? | No — fixed at 5 lines for now; may become configurable in a later epic                                                                                                                   |
| 4   | Annotation entry point             | To be designed in the annotations epic                                                                                                                                                   |
| 5   | Icon library                       | [Phosphor Icons](https://phosphoricons.com) (MIT) — chosen for native file-type icon coverage (`FilePdf`, `FileZip`, `FileMd`, `FileText`, `FileBinary`) and multi-framework SVG support |
| 6   | Typing trigger keys                | Only alphanumeric (a-z, A-Z, 0-9) — symbols excluded to prevent accidental triggers                                                                                                      |
| 7   | Draft persistence                  | Draft is NOT persisted — lost on refresh or cancel                                                                                                                                       |
| 8   | Draft cancel behavior              | Clicking outside keeps draft visible; only Escape or Ctrl+Enter ends editing                                                                                                             |
