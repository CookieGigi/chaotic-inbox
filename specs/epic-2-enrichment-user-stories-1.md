# Epic 2 — Enrichment: User Stories

**Status:** Draft
**Version:** 0.1.0
**Last updated:** 2026-03-16
**Based on:** Epic 2 Feature Spec v0.1.0

---

## F-07 — URL Metadata Enrichment

---

### US-07-01 — URL block shows a loading state while metadata is being fetched

**As a** user,
**I want** to see a subtle loading indicator on a URL block immediately after I paste a link,
**so that** I know enrichment is in progress and the block isn't stuck.

**Acceptance Criteria**
- Immediately after a `url` item is persisted, its block shows a loading indicator in the metadata area
- The loading indicator appears below the raw URL — the URL itself is always visible
- The raw URL is never hidden or replaced during loading
- The loading indicator is removed as soon as enrichment completes (success or failure)

---

### US-07-02 — URL block displays title and description after successful enrichment

**As a** user,
**I want** the title and description of a pasted URL to appear on its block,
**so that** I can identify the page at a glance without opening it.

**Acceptance Criteria**
- On enrichment success, `meta.title` is displayed prominently on the block
- `meta.description` is displayed below the title in a muted style
- The raw URL remains visible — title and description are shown alongside it, not instead of it
- The block updates in place without any navigation, reload, or scroll disruption
- If the proxy returns a title but no description → title is shown, description area is absent (no empty placeholder)
- If the proxy returns neither title nor description → block renders the raw URL only, with no empty metadata area

---

### US-07-03 — URL enrichment retries automatically on transient failure

**As a** user,
**I want** the app to retry a failed URL enrichment automatically,
**so that** a brief network blip doesn't permanently leave a block unenriched.

**Acceptance Criteria**
- On fetch failure, the enrichment is retried up to 3 times with exponential backoff
- The loading indicator remains visible during retries
- The retry count is not surfaced to the user during automatic retries — only the loading state is shown
- After 3 failed attempts, automatic retries stop and `enrichmentStatus` is set to `failed`

---

### US-07-04 — URL block shows a clear error and retry affordance after all retries are exhausted

**As a** user,
**I want** to see what went wrong and be able to retry manually when URL enrichment fails permanently,
**so that** I'm never left with a silently broken block.

**Acceptance Criteria**
- After 3 failed automatic attempts, the loading indicator is replaced by an error message describing the failure reason (e.g. "Could not reach page", "Proxy error", "Page did not respond")
- The error message includes the number of retries remaining on the next manual attempt (e.g. "Could not reach page — 3 retries left")
- A "Retry" affordance is shown alongside the error message
- Tapping "Retry" resets the retry counter to 3, sets status back to `pending`, re-queues the enrichment, and shows the loading indicator again
- The raw URL is always visible regardless of error state
- The retry counter resets on every manual retry — manual retries are available indefinitely

---

### US-07-05 — URL enrichment does not affect the raw field

**As a** user,
**I want** to trust that enrichment never modifies what I originally pasted,
**so that** the URL I saved is always exactly what I captured.

**Acceptance Criteria**
- The `raw` field of a `url` item is identical before and after enrichment
- `meta.title` and `meta.description` are written only to the `meta` field — never to `raw`
- The block always displays the original raw URL regardless of enrichment status

---

## F-08 — Image Dimension Enrichment

---

### US-08-01 — Image dimensions are stored after an image block renders

**As a** user,
**I want** the natural dimensions of a captured image to be stored automatically,
**so that** the app has accurate size data without me doing anything.

**Acceptance Criteria**
- After an image block renders in the feed, `meta.width` and `meta.height` are written to the item record
- Dimensions reflect the image's natural size, not its display size in the feed
- No network request is made — dimensions are read from the rendered `<img>` element
- No loading indicator is shown — dimension capture is fast enough to be imperceptible
- If the image fails to render (corrupt data), `enrichmentStatus` is set to `failed` silently — no user-facing error is shown

---

## F-09 — AI Summary Enrichment (Opt-In)

---

### US-09-01 — AI summaries are off by default

**As a** user,
**I want** AI summaries to be disabled until I choose to enable them,
**so that** a large model download never happens without my knowledge.

**Acceptance Criteria**
- On first launch, the AI summaries setting is off
- No model download is initiated at any point before the user enables the setting
- Text and file blocks show no summary placeholder or empty summary area when the setting is off

---

### US-09-02 — Enabling AI summaries shows a confirmation dialog before downloading

**As a** user,
**I want** to see a clear explanation of what enabling AI summaries involves before anything is downloaded,
**so that** I can make an informed decision about the storage and bandwidth cost.

**Acceptance Criteria**
- Toggling AI summaries on immediately shows a confirmation dialog before any download begins
- The dialog states that a ~2 GB model (Phi-3 mini) will be downloaded
- The dialog states that all processing happens on-device — no data is sent to any server
- The dialog has two actions: "Download and enable" and "Cancel"
- Choosing "Cancel" leaves the toggle off and initiates no download
- Choosing "Download and enable" closes the dialog and begins the background download

---

### US-09-03 — Model download runs in the background with a progress indicator

**As a** user,
**I want** to see the download progress without being blocked from using the app,
**so that** I can keep capturing while the model downloads.

**Acceptance Criteria**
- After confirming, the model download begins in the background
- A persistent progress indicator is visible (e.g. in a status bar or settings area) showing download percentage
- The feed and all capture interactions remain fully functional during the download
- If the download is interrupted (app closed, network lost), it resumes automatically on next launch
- When the download completes, the progress indicator is replaced by a confirmation that AI summaries are ready
- Summaries are only generated for items captured after the model is ready — not retroactively

---

### US-09-04 — New text items receive a one-sentence summary after opt-in

**As a** user,
**I want** a short summary to appear below my text captures once AI summaries are enabled,
**so that** I can scan the feed and understand each item without reading the full content.

**Acceptance Criteria**
- After model is ready, every new `text` item triggers summary generation
- The summary is one sentence, displayed below the block content in a muted style
- The block updates in place when the summary is ready — no navigation or reload
- The raw text content is unchanged — the summary is written only to `meta.summary`
- While the summary is generating, the block shows a subtle loading indicator in the summary area
- After 3 failed generation attempts, `enrichmentStatus` is set to `failed` and a retry affordance is shown (see F-10)

---

### US-09-05 — Supported file items receive a one-sentence summary after opt-in

**As a** user,
**I want** dropped PDFs, markdown files, and plain text files to also be summarised,
**so that** file captures are as scannable as text captures.

**Acceptance Criteria**
- After model is ready, every new `file` item with `mimetype` of `application/pdf`, `text/markdown`, or `text/plain` triggers summary generation
- Summary behaviour, display, and failure handling are identical to US-09-04
- File types not in the supported list (zip, binary, unknown) are silently skipped — `enrichmentStatus: skipped`, no placeholder shown

---

### US-09-06 — Items captured before opt-in are not retroactively summarised

**As a** user,
**I want** the app to leave my existing captures untouched when I enable AI summaries,
**so that** enabling the feature doesn't trigger unexpected background processing over my entire vault.

**Acceptance Criteria**
- Enabling AI summaries and completing the model download does not trigger summarisation for any pre-existing items
- Pre-existing text and file blocks show no summary area and no empty placeholder
- Only items captured after the model is ready receive summaries

---

### US-09-07 — Disabling AI summaries stops future summarisation

**As a** user,
**I want** to be able to turn off AI summaries at any time,
**so that** I can stop generating summaries without losing what I've already captured.

**Acceptance Criteria**
- Toggling AI summaries off immediately stops summary generation for new captures
- Existing summaries on already-enriched blocks remain visible — they are not deleted
- The model is not deleted from cache when the setting is turned off — re-enabling does not require a re-download
- No confirmation dialog is shown when disabling

---

## F-10 — Enrichment Status and Retry UI

---

### US-10-01 — Blocks in a loading state show a subtle indicator without obscuring content

**As a** user,
**I want** to see that enrichment is in progress without it interfering with my content,
**so that** the feed remains readable while the background work happens.

**Acceptance Criteria**
- Blocks with `enrichmentStatus: pending` or `running` show a loading indicator in the metadata area only
- The raw content of the block (URL, text, image, file) is never hidden or obscured by the loading indicator
- The loading indicator is visually subtle — it does not compete with the block content

---

### US-10-02 — Blocks in a failed state show the failure reason and retries remaining

**As a** user,
**I want** to understand why enrichment failed and how many retries I have left,
**so that** I can decide whether to retry or leave the block as-is.

**Acceptance Criteria**
- Blocks with `enrichmentStatus: failed` show a human-readable failure reason (e.g. "Could not reach page", "Generation failed", "Proxy error")
- The failure message includes retries remaining on the next manual attempt (e.g. "Could not reach page — 3 retries left")
- The failure message is displayed in the metadata area — below the raw content, never over it
- Blocks with `enrichmentStatus: done` show no status indicator
- Blocks with `enrichmentStatus: skipped` show no status indicator and no empty metadata placeholder

---

### US-10-03 — Tapping retry re-queues the enrichment

**As a** user,
**I want** to be able to retry a failed enrichment with a single tap,
**so that** I don't have to re-capture an item just because a network request failed.

**Acceptance Criteria**
- Every block with `enrichmentStatus: failed` has a "Retry" affordance
- Tapping "Retry" sets `enrichmentStatus` back to `pending`, resets the retry counter to 3, and re-queues the enrichment
- The loading indicator replaces the error message immediately on tap
- Manual retries are available indefinitely — there is no cap on how many times the user can manually retry
- Retry is available for all enrichment types: URL metadata, AI summaries

---

## Dependencies

| Story | Depends on |
|-------|-----------|
| US-07-01 | Epic 1 F-05 persistence schema; Cloudflare Worker proxy deployed |
| US-07-02 | US-07-01; Cloudflare Worker returning `title` and `description` |
| US-07-03 | US-07-01 |
| US-07-04 | US-07-03; F-10 retry UI |
| US-07-05 | Epic 1 F-05 `raw` field contract |
| US-08-01 | Epic 1 F-03 image block rendering |
| US-09-01 | — |
| US-09-02 | US-09-01 |
| US-09-03 | US-09-02; WebLLM integration |
| US-09-04 | US-09-03; F-10 retry UI |
| US-09-05 | US-09-03; F-10 retry UI |
| US-09-06 | US-09-03 |
| US-09-07 | US-09-03 |
| US-10-01 | Epic 2 enrichment status field on Item schema |
| US-10-02 | US-10-01 |
| US-10-03 | US-10-02 |
