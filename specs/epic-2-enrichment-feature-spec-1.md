# Epic 2 — Enrichment: Feature Spec

**Status:** Draft
**Version:** 0.1.0
**Last updated:** 2026-03-16
**Based on:** Epic 1 v0.3.0 · Architecture Storage Layer v0.1.0

---

## Overview

After an item is captured and persisted, a background enrichment pipeline adds derived metadata to it. Enrichment never touches `raw`, never changes `type`, and never blocks the capture flow. The feed renders correctly with or without enrichment data present.

There are two independent enrichment tracks:

- **URL metadata** — available to all users immediately; fetched via a minimal edge proxy
- **AI summaries** — opt-in only; powered by WebLLM running locally in the browser

---

## Design Constraints

| Constraint | Rationale |
|---|---|
| Raw input is never modified | Inherited from Epic 1 — `raw` is sacred |
| Capture latency is unaffected | Enrichment is always async and post-persist |
| Enrichment failure degrades gracefully | The item exists regardless; enrichment is additive |
| AI summaries require explicit user opt-in | WebLLM requires a 1–4 GB model download; this must never be a surprise |
| Feed renders without enrichment data | Blocks display raw content until enrichment lands; then update in place |

---

## Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | URL metadata fetching strategy | Minimal edge proxy (Cloudflare Worker) — direct fetch fails on CORS for most pages |
| 2 | AI summary engine | WebLLM — runs fully in-browser, no data leaves the device |
| 3 | Model download trigger | Explicit user opt-in — user enables AI summaries knowingly; download never happens silently |
| 4 | Enrichment tracks | Two independent tracks: URL metadata (always-on) and AI summaries (opt-in). Each track is independently enabled/disabled |
| 5 | Retry strategy | Transient failures get up to 3 automatic retries with exponential backoff; after that, status is set to `failed` and a retry affordance is shown on the block |
| 6 | Enrichment data location | New optional `meta` field on the existing `Item` record — no new table needed at this stage |
| 7 | WebLLM model | Phi-3 mini (~2 GB) — smaller download, fast enough for single-sentence summaries |
| 8 | Proxy host | Cloudflare Worker — free tier (100k req/day), no cold starts, zero ops overhead |
| 9 | Retry error display | Clear error message describing the failure reason + retries remaining (e.g. "Could not reach page — 2 retries left") |
| 10 | Model download UX | Background download with a persistent progress indicator — does not block the UI |

---

## Schema Extension

Enrichment data is appended to the existing `Item` record. Epic 1 fields are unchanged.

```ts
interface Item {
  // — Epic 1 fields, unchanged —
  id: string;
  type: 'text' | 'url' | 'image' | 'file';
  capturedAt: string;
  raw: string | Blob;
  filename?: string;
  filesize?: number;
  mimetype?: string;

  // — Epic 2 additions —
  enrichmentStatus?: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  enrichmentRetries?: number;
  meta?: {
    // URL track
    title?: string;
    description?: string;
    // Image track
    width?: number;
    height?: number;
    // AI summary track
    summary?: string;
  };
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

## Features

---

### F-07 — URL Metadata Enrichment

**Priority:** P0

**Description**
When a `url` item is captured, the pipeline fetches its title and description via an edge proxy and updates the block in place.

**Behaviour**
- Triggered automatically for every item with `type: url`
- The proxy fetches the target page server-side and extracts `og:title`, `og:description`, and the page `<title>` as fallback
- The block shows a loading indicator while enrichment is in flight
- On success, `meta.title` and `meta.description` are written; the block re-renders in place
- On failure after 3 retries, `enrichmentStatus` is set to `failed` and a retry affordance appears on the block
- The raw URL is always visible — metadata is displayed alongside it, never replacing it

**Proxy contract**

```
GET /enrich/url?target=<encoded-url>

200 → { title: string | null, description: string | null }
4xx/5xx → error, trigger retry logic
```

**Acceptance Criteria**
- Pasting a URL → block shows a loading state immediately
- On enrichment success → block displays title and description without navigation or reload
- `raw` URL field is unchanged after enrichment
- If the proxy returns no title or description → block renders the raw URL only, no empty placeholder
- After 3 failed attempts → loading state replaced by a retry affordance
- Clicking retry → re-queues the enrichment and shows loading state again

---

### F-08 — Image Dimension Enrichment

**Priority:** P1

**Description**
When an `image` item is captured, its natural dimensions are read client-side and stored on the item record.

**Behaviour**
- Triggered automatically for every item with `type: image`
- Dimensions are read from the rendered `<img>` element's `naturalWidth` / `naturalHeight` — no network call required
- `meta.width` and `meta.height` are written immediately after the image loads
- Enrichment is synchronous enough that no loading state is needed
- Failure (e.g. corrupt image data) sets `enrichmentStatus` to `failed` silently — no user-facing error for this track

**Acceptance Criteria**
- After an image block renders, `meta.width` and `meta.height` are present in storage
- No network request is made for image dimension enrichment
- A corrupt or unrenderable image sets `enrichmentStatus: failed` without surfacing an error to the user

---

### F-09 — AI Summary Enrichment (Opt-In)

**Priority:** P1

**Description**
Users who opt in to AI summaries get a one-sentence summary added to `text` and supported `file` items (PDF, markdown, plain text). The model runs entirely in the browser via WebLLM — no data leaves the device.

**Behaviour**

**Opt-in flow**
- AI summaries are disabled by default
- A settings toggle labelled "AI summaries (runs on device)" enables the feature
- On first enable, the user is shown a one-time confirmation dialog explaining the model download size (~1–4 GB depending on model) and that processing happens locally
- The user must confirm before the download begins
- Download progress is shown as a persistent indicator until the model is ready
- Once downloaded, the model is cached in the browser; subsequent launches do not re-download

**Enrichment flow (once opted in and model ready)**
- Triggered for every new item with `type: text` or `type: file` (PDF, `.md`, `.txt` only)
- A one-sentence summary is generated and written to `meta.summary`
- The block re-renders in place to show the summary in a muted style below the content
- Items captured before opt-in are not retroactively summarised in this epic
- After 3 failed generation attempts, `enrichmentStatus` is set to `failed` with a retry affordance

**Supported file types for summarisation**

| Type | Condition |
|---|---|
| `text` | Always (if opted in) |
| `file` | Only if `mimetype` is `application/pdf`, `text/markdown`, or `text/plain` |
| `image` | Never |
| `url` | Never — URL track handles this separately |

**Acceptance Criteria**
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

### F-10 — Enrichment Status and Retry UI

**Priority:** P0

**Description**
Blocks reflect their enrichment status visually. Users can retry failed enrichments without leaving the feed.

**Behaviour**
- `pending` / `running` → subtle loading indicator on the block (spinner or shimmer on the metadata area)
- `done` → no indicator; enriched data is displayed inline
- `skipped` → no indicator; block renders with raw content only
- `failed` → loading indicator replaced by a muted "Could not load — retry" affordance
- Tapping retry → sets status back to `pending`, re-queues the enrichment, shows loading state
- Retry is available indefinitely — the 3-attempt limit resets on manual retry

**Acceptance Criteria**
- A block in `pending` or `running` state shows a loading indicator in the metadata area only — not over the raw content
- A block in `failed` state shows a retry affordance
- Clicking retry re-queues enrichment and shows the loading indicator again
- A block in `done` state shows no status indicator
- A block in `skipped` state shows no status indicator and no empty metadata placeholder
- Status indicators never obscure or replace the raw content of the block

---

## Out of Scope

- Retroactive enrichment of items captured before Epic 2
- Classification or tagging derived from enrichment output
- Search or filtering by enriched metadata
- Multiple AI model choices or model switching
- Remote LLM API calls — all AI processing is on-device
- Enrichment of `url` items with AI summaries (URL track handles metadata; page content summarisation is deferred)
- Deduplication based on enriched metadata

---

## Open Questions

All questions resolved. See Decisions Log.
