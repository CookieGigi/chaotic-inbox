---
id: doc-12
title: 'Epic 2 — F-10: Enrichment Status and Retry UI'
type: other
created_date: '2026-03-17 23:59'
updated_date: '2026-03-18 23:05'
---
# Epic 2 — Enrichment: F-10 — Enrichment Status and Retry UI

**Priority:** P0  
**Status:** Draft  
**Version:** 0.2.0  
**Last updated:** 2026-03-19

---

## Description

Blocks reflect their enrichment status visually per enrichment track. Users can retry failed enrichments without leaving the feed. Status is tracked independently for each enrichment track (URL, image, AI).

---

## Per-Track Status States

Each enrichment track (`url`, `image`, `ai`) has its own independent status:

| Status    | Meaning                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `pending` | Item is queued for enrichment for this track                            |
| `running` | Enrichment is actively in progress for this track                       |
| `done`    | Enrichment completed successfully for this track                        |
| `skipped` | This track was not applicable or was disabled                           |
| `failed`  | Enrichment failed after all retries for this track                      |
| `undefined` | Equivalent to `skipped` — no enrichment attempted for this track      |

---

## Behaviour

### Status Display Rules

- `pending` / `running` → subtle loading indicator on the block (spinner or shimmer on the metadata area)
- `done` → no indicator; enriched data is displayed inline
- `skipped` → no indicator; block renders with raw content only
- `failed` → loading indicator replaced by a muted "Could not load — retry" affordance
- Tapping retry → sets status back to `pending`, re-queues the enrichment, shows loading state
- Retry is available indefinitely — the 3-attempt limit resets on manual retry

### Undefined vs Skipped Equivalence

The renderer must treat `undefined` status identically to `skipped`:

- A track with status `undefined` renders exactly the same as `skipped`
- No loading indicator, no error state, no empty placeholder
- This ensures backward compatibility with items captured before Epic 2

---

## Multi-Track Handling

Blocks may have enrichment from multiple tracks (e.g., a URL item with `url` track and optionally `ai` track). The UI shows status indicators per-track:

- URL metadata loading → spinner near title/description area
- AI summary loading → spinner near summary area  
- Each track's retry affordance appears independently

---

## Acceptance Criteria

- A block track in `pending` or `running` state shows a loading indicator in the metadata area only — not over the raw content
- A block track in `failed` state shows a retry affordance specific to that track
- Clicking retry re-queues enrichment for that track and shows the loading indicator again
- A block track in `done` state shows no status indicator
- A block track in `skipped` state (or undefined) shows no status indicator and no empty metadata placeholder
- Status indicators never obscure or replace the raw content of the block
- Items without any `enrichmentStatus` field (Epic 1 items) render identically to items with all tracks `skipped`

---

## Dependencies

- Epic 2 per-track enrichment status schema
- Epic 1 block rendering
- Backward compatibility with Epic 1 items (no enrichment fields)
