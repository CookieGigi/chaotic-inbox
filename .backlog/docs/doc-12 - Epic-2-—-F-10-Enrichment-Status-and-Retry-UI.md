---
id: doc-12
title: 'Epic 2 — F-10: Enrichment Status and Retry UI'
type: other
created_date: '2026-03-17 23:59'
---
# Epic 2 — Enrichment: F-10 — Enrichment Status and Retry UI

**Priority:** P0  
**Status:** Draft  
**Version:** 0.1.0  
**Last updated:** 2026-03-16  

---

## Description

Blocks reflect their enrichment status visually. Users can retry failed enrichments without leaving the feed.

---

## Behaviour

- `pending` / `running` → subtle loading indicator on the block (spinner or shimmer on the metadata area)
- `done` → no indicator; enriched data is displayed inline
- `skipped` → no indicator; block renders with raw content only
- `failed` → loading indicator replaced by a muted "Could not load — retry" affordance
- Tapping retry → sets status back to `pending`, re-queues the enrichment, shows loading state
- Retry is available indefinitely — the 3-attempt limit resets on manual retry

---

## Acceptance Criteria

- A block in `pending` or `running` state shows a loading indicator in the metadata area only — not over the raw content
- A block in `failed` state shows a retry affordance
- Clicking retry re-queues enrichment and shows the loading indicator again
- A block in `done` state shows no status indicator
- A block in `skipped` state shows no status indicator and no empty metadata placeholder
- Status indicators never obscure or replace the raw content of the block

---

## Dependencies

- Epic 2 enrichment status field on Item schema
- Epic 1 block rendering
