---
id: doc-2
title: 'Epic 1 — F-01: Instant Append on Paste'
type: other
created_date: '2026-03-17 23:56'
---

# Epic 1 — Capture: F-01 — Instant Append on Paste

**Priority:** P0  
**Status:** Draft  
**Version:** 0.3.0  
**Last updated:** 2026-03-14

---

## Overview

The Capture screen is a single, continuous, append-only feed. The user pastes or drops anything — a URL, text, image, or file — and it appears immediately at the bottom of the feed as a discrete block. No decisions, no forms, no friction.

The feed _is_ the UI. There is no separate "save" action.

---

## Description

When the user presses `Cmd+V` / `Ctrl+V` anywhere in the app — regardless of focus state — the clipboard contents are captured and a new block is appended to the bottom of the feed.

---

## Behaviour

- No focused input required. The global paste listener intercepts the event.
- The block is persisted to local storage _before_ any UI update is rendered.
- The new block appears at the bottom of the feed and the view scrolls to it.
- No confirmation dialog, modal, or toast is shown on success.
- If the clipboard is empty or the type is unrecognised, the event is silently ignored.

---

## Acceptance Criteria

- `Cmd+V` with a text string on the clipboard → text block appended, feed scrolls to bottom.
- `Cmd+V` with an image on the clipboard → image block appended inline.
- `Cmd+V` with a URL string → URL block appended (not text block).
- Block is retrievable from local storage immediately after paste, before any re-render.

---

## Dependencies

- F-05 persistence schema
- F-03 block type detection

---

## Cross-Cutting Stories

- US-05-XX — Trust that nothing is lost (owned by F-05, referenced here as F-01 is a primary trigger)
