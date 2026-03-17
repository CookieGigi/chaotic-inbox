---
id: doc-11
title: 'Epic 2 — F-09: AI Summary Enrichment (Opt-In)'
type: other
created_date: '2026-03-17 23:58'
---
# Epic 2 — Enrichment: F-09 — AI Summary Enrichment (Opt-In)

**Priority:** P1  
**Status:** Draft  
**Version:** 0.1.0  
**Last updated:** 2026-03-16  

---

## Description

Users who opt in to AI summaries get a one-sentence summary added to `text` and supported `file` items (PDF, markdown, plain text). The model runs entirely in the browser via WebLLM — no data leaves the device.

---

## Opt-in Flow

- AI summaries are disabled by default
- A settings toggle labelled "AI summaries (runs on device)" enables the feature
- On first enable, the user is shown a one-time confirmation dialog explaining the model download size (~1–4 GB depending on model) and that processing happens locally
- The user must confirm before the download begins
- Download progress is shown as a persistent indicator until the model is ready
- Once downloaded, the model is cached in the browser; subsequent launches do not re-download

---

## Enrichment Flow (once opted in and model ready)

- Triggered for every new item with `type: text` or `type: file` (PDF, `.md`, `.txt` only)
- A one-sentence summary is generated and written to `meta.summary`
- The block re-renders in place to show the summary in a muted style below the content
- Items captured before opt-in are not retroactively summarised in this epic
- After 3 failed generation attempts, `enrichmentStatus` is set to `failed` with a retry affordance

---

## Supported File Types for Summarisation

| Type | Condition |
|---|---------|
| `text` | Always (if opted in) |
| `file` | Only if `mimetype` is `application/pdf`, `text/markdown`, or `text/plain` |
| `image` | Never |
| `url` | Never — URL track handles this separately |

---

## Acceptance Criteria

- AI summaries toggle is off by default
- Enabling the toggle shows a confirmation dialog with download size and on-device processing disclosure
- Declining the dialog leaves the toggle off and triggers no download
- Confirming the dialog starts the model download with a visible progress indicator
- After model is ready, new `text` items show a one-sentence summary below their content
- `raw` field is unchanged after summarisation
- Items captured before opt-in have no summary and show no empty placeholder
- Unsupported file types (zip, binary) are skipped silently — `enrichmentStatus: skipped`
- After 3 failed summary attempts → retry affordance shown on block

---

## Dependencies

- Epic 1 F-05 persistence schema
- F-10 retry UI
- WebLLM integration
