---
id: doc-8
title: Epic 2 — Enrichment Overview
type: other
created_date: '2026-03-17 23:58'
---

# Epic 2 — Enrichment

**Status:** Draft  
**Version:** 0.1.0  
**Last updated:** 2026-03-16

---

## Overview

After an item is captured and persisted, a background enrichment pipeline adds derived metadata to it. Enrichment never touches `raw`, never changes `type`, and never blocks the capture flow. The feed renders correctly with or without enrichment data present.

There are two independent enrichment tracks:

- **URL metadata** — available to all users immediately; fetched via a minimal edge proxy
- **AI summaries** — opt-in only; powered by WebLLM running locally in the browser

---

## Design Constraints

| Constraint                                | Rationale                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Raw input is never modified               | Inherited from Epic 1 — `raw` is sacred                                 |
| Capture latency is unaffected             | Enrichment is always async and post-persist                             |
| Enrichment failure degrades gracefully    | The item exists regardless; enrichment is additive                      |
| AI summaries require explicit user opt-in | WebLLM requires a 1–4 GB model download; this must never be a surprise  |
| Feed renders without enrichment data      | Blocks display raw content until enrichment lands; then update in place |

---

## Features in this Epic

1. **F-07 — URL Metadata Enrichment** (P0)
2. **F-08 — Image Dimension Enrichment** (P1)
3. **F-09 — AI Summary Enrichment (Opt-In)** (P1)
4. **F-10 — Enrichment Status and Retry UI** (P0)

---

## Decisions Log

| #   | Question                       | Decision                                                                                                                                                      |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | URL metadata fetching strategy | Minimal edge proxy (Cloudflare Worker) — direct fetch fails on CORS for most pages                                                                            |
| 2   | AI summary engine              | WebLLM — runs fully in-browser, no data leaves the device                                                                                                     |
| 3   | Model download trigger         | Explicit user opt-in — user enables AI summaries knowingly; download never happens silently                                                                   |
| 4   | Enrichment tracks              | Two independent tracks: URL metadata (always-on) and AI summaries (opt-in). Each track is independently enabled/disabled                                      |
| 5   | Retry strategy                 | Transient failures get up to 3 automatic retries with exponential backoff; after that, status is set to `failed` and a retry affordance is shown on the block |
| 6   | Enrichment data location       | New optional `meta` field on the existing `Item` record — no new table needed at this stage                                                                   |
| 7   | WebLLM model                   | Phi-3 mini (~2 GB) — smaller download, fast enough for single-sentence summaries                                                                              |
| 8   | Proxy host                     | Cloudflare Worker — free tier (100k req/day), no cold starts, zero ops overhead                                                                               |
| 9   | Retry error display            | Clear error message describing the failure reason + retries remaining (e.g. "Could not reach page — 2 retries left")                                          |
| 10  | Model download UX              | Background download with a persistent progress indicator — does not block the UI                                                                              |

---

## Schema Extension

Enrichment data is appended to the existing `Item` record. Epic 1 fields are unchanged.

```ts
interface Item {
  // — Epic 1 fields, unchanged —
  id: string
  type: 'text' | 'url' | 'image' | 'file'
  capturedAt: string
  raw: string | Blob
  filename?: string
  filesize?: number
  mimetype?: string

  // — Epic 2 additions —
  enrichmentStatus?: 'pending' | 'running' | 'done' | 'failed' | 'skipped'
  enrichmentRetries?: number
  meta?: {
    // URL track
    title?: string
    description?: string
    // Image track
    width?: number
    height?: number
    // AI summary track
    summary?: string
  }
}
```

`raw` is never written to after initial capture. `type` is never changed.

---

## Pipeline Architecture

```
capture
  └─→ persist (Epic 1)
        └─→ enrich queue
              ├─→ URL enricher       (if type = url)
              ├─→ Image enricher     (if type = image)
              └─→ Summary enricher   (if type = text | file, AND AI opt-in = true)
                    └─→ update item.meta + item.enrichmentStatus
                          └─→ block re-renders in place
```

The queue is fire-and-forget from the capture handler's perspective. Each enricher is an independent async function. There is no orchestration layer at this scale.

---

## Out of Scope

- Retroactive enrichment of items captured before Epic 2
- Classification or tagging derived from enrichment output
- Search or filtering by enriched metadata
- Multiple AI model choices or model switching
- Remote LLM API calls — all AI processing is on-device
- Enrichment of `url` items with AI summaries (URL track handles metadata; page content summarisation is deferred)
- Deduplication based on enriched metadata
