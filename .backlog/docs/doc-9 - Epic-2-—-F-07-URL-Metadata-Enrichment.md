---
id: doc-9
title: 'Epic 2 — F-07: URL Metadata Enrichment'
type: other
created_date: '2026-03-17 23:58'
updated_date: '2026-03-18 23:04'
---
# Epic 2 — Enrichment: F-07 — URL Metadata Enrichment

**Priority:** P0  
**Status:** Draft  
**Version:** 0.2.0  
**Last updated:** 2026-03-19

---

## Description

When a `url` item is captured, the pipeline fetches its title and description via an edge proxy and updates the block in place. Users can disable URL enrichment globally if desired.

---

## Behaviour

- Triggered automatically for every item with `type: url` when URL enrichment is enabled (on by default)
- Users can disable URL enrichment via a settings toggle labeled "Fetch URL metadata" (enabled by default)
- When disabled, new URL items are created with `enrichmentStatus.url: 'skipped'` immediately
- The proxy fetches the target page server-side and extracts `og:title`, `og:description`, and the page `<title>` as fallback
- The block shows a loading indicator while enrichment is in flight
- On success, `meta.title` and `meta.description` are written; the block re-renders in place
- On failure after 3 retries, `enrichmentStatus.url` is set to `failed` and a retry affordance appears on the block
- The raw URL is always visible — metadata is displayed alongside it, never replacing it

---

## Proxy Contract

```
GET /enrich/url?target=<encoded-url>

200 → { title: string | null, description: string | null }
4xx/5xx → error, trigger retry logic
```

---

## Acceptance Criteria

- Pasting a URL → block shows a loading state immediately (when enrichment enabled)
- On enrichment success → block displays title and description without navigation or reload
- `raw` URL field is unchanged after enrichment
- If the proxy returns no title or description → block renders the raw URL only, no empty placeholder
- After 3 failed attempts → loading state replaced by a retry affordance
- Clicking retry → re-queues the enrichment and shows loading state again
- URL enrichment toggle is on by default in settings
- Disabling the toggle causes all new URL items to be created with `enrichmentStatus.url: 'skipped'`
- Re-enabling the toggle does not retroactively enrich previously skipped URLs

---

## Dependencies

- Epic 1 F-05 persistence schema
- Cloudflare Worker proxy deployed
- F-10 per-track enrichment status handling
