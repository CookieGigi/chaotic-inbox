# Epic 1 — Capture

**Status:** Draft
**Version:** 0.3.0
**Last updated:** 2026-03-14

---

## Goal

The user has something they don't want to lose.
They paste or drop it. It's saved. Done.

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

- Paste or drop anything into the app → saved immediately to local storage
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
