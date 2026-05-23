# Chaotic Inbox — Project Analysis

**Date:** 2026-05-23
**Analyst:** OpenCode
**Scope:** Complete review of `../old/chaotic-inbox` (browser-only prototype)
**Objective:** Understand what exists, what works, and what must change to become a full-stack app (CLI + Web UI + Server + Database).

---

## 1. Project Overview

Chaotic Inbox is a **personal knowledge capture tool** built as a browser-only, local-first single-page application. Its core philosophy is **zero-friction capture**: the user pastes, drops, or types anything and it is saved immediately with no prompts, no loading spinners, and no organizational decisions required at capture time.

The application was explicitly designed as an **append-only chronological feed** where order and meaning are deferred to later stages (enrichment, search, categorization).

---

## 2. Tech Stack (Old)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19 | StrictMode, concurrent features available but unused |
| Build Tool | Vite | 8 | Zero-config SPA build |
| Language | TypeScript | 5.9 | Strict mode enabled |
| Styling | Tailwind CSS | v4 | Utility-first, custom theme tokens via `@theme` |
| Database | IndexedDB (Dexie 4) | 4.3 | Local-first, no remote sync |
| State Mgmt | Zustand | 5.0.12 | Flat store, migrated from useReducer+Context mid-project |
| Icons | Phosphor Icons | 2.1 | React package, tree-shakeable SVG |
| i18n | i18next + react-i18next | 26.0 / 17.0 | Browser language detection |
| IDs | uuid | 13.0 | v4 random UUIDs |
| Testing | Vitest + Testing Library | 4.1 | `fake-indexeddb` for storage tests |
| Storybook | Storybook | 10.3 | Component isolation |

---

## 3. Architecture (Old)

### 3.1 Application Type
- **Pure browser SPA** — no backend, no API, no server-side rendering
- Served as static files (Docker + nginx reverse-proxy ready)
- All data lives in the browser's IndexedDB via Dexie

### 3.2 Data Flow
```
User Action (paste/drop/type)
  └─→ Capture Handler (detects type)
        └─→ Factory Function (creates RawItem with metadata)
              └─→ Dexie/IndexedDB (persist)
                    └─→ Zustand Store (update UI state)
                          └─→ React Re-render (Feed → Block)
```

The **write-before-render contract** is strict: storage must complete before any UI update.

### 3.3 State Management (Zustand)
- Single flat store (`useAppStore`)
- State: `items[]`, `draftItem`, `draftContent`, `isDragging`, `isLoading`, `recentlyDeleted`
- Actions: CRUD on items, draft lifecycle, drag state
- Selectors exported as standalone hooks for performance

### 3.4 Component Architecture
```
App
├── Feed
│   ├── Block (xN) — type-switcher wrapper
│   │   ├── BlockIcon / BlockTitle / Timestamp
│   │   ├── BlockActionMenu (Edit, Delete)
│   │   └── Content (TextBlock | UrlBlock | ImageBlock | FileBlock)
│   └── DraftBlock (conditional, at bottom)
├── SettingsMenu (floating trigger)
├── SettingsModal (backup/restore, quota, online status)
└── ToastContainer (undoable toasts for deletion)
```

---

## 4. Features Implemented

### 4.1 Epic 1 — Capture (Complete)
| Feature | Status | Description |
|---------|--------|-------------|
| F-01 Instant Append on Paste | ✅ | Global `Cmd+V`/`Ctrl+V` listener; no focus required |
| F-02 Drag-and-Drop File Capture | ✅ | Full-window drop target; overlay on drag-enter |
| F-03 Block Types and Rendering | ✅ | `text`, `url`, `image`, `file` with type-specific rendering |
| F-04 Chronological Feed | ✅ | Oldest-first, auto-scroll to bottom, timestamp formatting |
| F-05 Local-First Persistence | ✅ | Dexie/IndexedDB; write-before-render guarantee |
| F-06 Keyboard-First Capture | ✅ | Ctrl+Enter to submit drafts |
| F-07 Global Typing Capture | ✅ | Alphanumeric keys create draft block at bottom |

### 4.2 Epic 2 — Enrichment (Partially Planned)
| Feature | Status | Description |
|---------|--------|-------------|
| F-07 URL Metadata Enrichment | 📋 Planned | Edge proxy (Cloudflare Worker) to fetch `og:title`, `og:description` |
| F-08 Image Dimension Enrichment | 📋 Planned | Extract width/height from images post-capture |
| F-09 AI Summary Enrichment | 📋 Planned | WebLLM (Phi-3 mini, ~2GB) running in-browser; opt-in |
| F-10 Enrichment Status & Retry UI | 📋 Planned | Per-track status (`pending/running/done/failed/skipped`) |

### 4.3 Additional Features (Post-Epic 2)
| Feature | Status | Description |
|---------|--------|-------------|
| Block Editing | ✅ | Edit text and URL blocks inline |
| Block Deletion | ✅ | Delete with undoable toast notification |
| Database Backup/Restore | ✅ | JSON export/import via dexie-export-import |
| Quota Monitoring | ✅ | Storage usage indicator with threshold alerts |
| Online/Offline Detection | ✅ | Toast notifications on status change |
| Settings Modal | ✅ | Backup, restore, quota, online status display |
| i18n Framework | ✅ | Translation infrastructure ready (en only) |
| Performance Monitoring | ✅ | Custom performance markers for critical paths |
| Stress Test Page | ✅ | `/dev/performance` route for load testing |

---

## 5. Data Model

### 5.1 Core Types
```ts
// Discriminated union — type and metadata always in sync
interface RawItemBase {
  id: UUID
  capturedAt: ISO8601Timestamp
  raw: string | Blob
}

type RawItem =
  | { type: 'file'; metadata: FileMetadata }
  | { type: 'text'; metadata: TextMetadata }
  | { type: 'url';   metadata: UrlMetadata }
  | { type: 'image'; metadata: ImageMetadata }
```

### 5.2 Metadata Shapes
- **File**: `{ kind, filename, filesize, mimetype }` — subtype detection (PDF, zip, md, txt, binary)
- **Text**: `{ kind: 'plain'|'markdown'|'code', wordCount? }`
- **URL**: `{ kind: 'url', title?, favicon? }`
- **Image**: `{ kind: 'image', width?, height?, alt? }`

### 5.3 Enrichment Schema Extension (Planned)
```ts
enrichmentStatus?: {
  url?: 'pending'|'running'|'done'|'failed'|'skipped'
  image?: 'pending'|'running'|'done'|'failed'|'skipped'
  ai?: 'pending'|'running'|'done'|'failed'|'skipped'
}
meta?: {
  title?, description?,     // URL track
  width?, height?,            // Image track
  summary?                    // AI track
}
```

### 5.4 Storage Layer
- **Dexie database**: single table `items` with index on `id`, `capturedAt`, `type`
- `capturedAt` indexed for cheap `ORDER BY` feed queries
- Metadata is NOT indexed (no queries by filename/size in Epic 1)
- `Blob` stored natively — no base64 encoding
- Schema version 1 with Dexie migration system ready

---

## 6. Design System

### 6.1 Philosophy
**Functional minimalism.** The UI is a surface for content. Chrome is reduced to the minimum. Typography and spacing do the structural work.

### 6.2 Key Tokens
- **Palette**: Catppuccin Macchiato (dark-first, light mode deferred)
- **Background**: `#181926` (Crust)
- **Surface**: `#1e2030` (Mantle)
- **Accent**: `#8bd5ca` (Teal, user-configurable)
- **Font**: Geist (sans), system monospace stack
- **Type scale**: 11px (xs), 13px (sm), 15px (base), 12px (label)
- **Spacing base**: 4px grid
- **Feed max-width**: 720px, centered
- **Block separation**: 1px divider lines, no card backgrounds
- **Motion**: Minimal — no decorative animations; instant append/expand

### 6.3 Block Rendering Rules
- `text`: Body font, truncated at 5 lines, "Show more/less" affordance
- `url`: Hostname as muted label, full URL in accent with hover underline
- `image`: Inline `<img>` constrained to feed width
- `file`: Type-specific icon + filename + formatted size

---

## 7. Capture Pipeline Detail

### 7.1 Type Detection
1. **Paste event**: inspect `clipboardData`
   - Image blob present → `image`
   - Text matching URL pattern (`http://` / `https://`) → `url`
   - Any other text → `text`
2. **Drop event**: inspect `dataTransfer.files`
   - Image file extensions (png, jpg, gif, webp) → `image`
   - Any other file → `file`
3. **Typing**: alphanumeric key with no focused input → `text` (draft mode)

### 7.2 Persistence Contract
```ts
async function handleCapture(payload) {
  try {
    const item = await persistXxx(payload, metadata)
    appendToFeed(item)     // UI update AFTER storage confirms
    scrollToBottom()
  } catch (err) {
    showStorageError(err)   // No UI append if storage fails
  }
}
```

### 7.3 Bulk Operations
- Chunked `bulkAdd` for large batches (1000 items per chunk)
- Large file detection (>1MB) triggers quota check

---

## 8. Strengths of the Old Prototype

1. **Exceptional UX philosophy**: "send and forget" — zero friction, zero decisions at capture time
2. **Write-before-render guarantee**: Data safety is architecturally enforced, not just tested
3. **Type safety**: Full TypeScript discriminated unions with type guards and factory functions
4. **Design system maturity**: Comprehensive token system, documented usage rules, showcase component
5. **Test coverage**: Vitest + Testing Library + fake-indexeddb for realistic storage tests
6. **Accessibility**: Focus traps, ARIA labels, keyboard-first design, baseline-aligned typography
7. **i18n readiness**: Framework in place for multi-language support
8. **Performance consciousness**: Performance markers, chunked bulk operations, memory leak prevention (blob URL cleanup)

---

## 9. Limitations & Why a Server is Needed

### 9.1 Browser-Only Constraints
| Limitation | Impact |
|------------|--------|
| IndexedDB quota (~60% of free disk, origin-scoped) | Cannot store large archives or long-term history |
| No server-side processing | AI/WebLLM requires ~2GB browser download per device; slow on mobile |
| No cross-device sync | Data trapped in one browser profile |
| No background processing | Browser tab must be open for enrichment to run |
| CORS on URL metadata | Requires edge proxy anyway; might as well be server |
| No embedding/vector search | Planned NLP features impossible without a compute backend |
| No CLI | Cannot capture from terminal, scripts, or automation |

### 9.2 The NLP/Vector Search Gap
The prototype's roadmap explicitly planned:
- **Embedding generation** for semantic search
- **Automatic categorization/tagging** of captured items
- **Content summarization** (AI enrichment)
- **Full-text + semantic search** across all items

These are **impossible** to implement well in a browser-only architecture:
- Embedding models are large (hundreds of MB to GBs)
- Vector search requires a vector index (pgvector, Qdrant, etc.)
- Background NLP processing needs persistent compute
- Cross-device search requires centralized storage

### 9.3 Maintainability Issues at Scale
- All business logic in React hooks and Zustand actions
- No separation between UI and domain logic
- No API contract — components directly call storage
- Testing requires DOM + fake-indexeddb environment
- Cannot share logic with a CLI or mobile app

---

## 10. What to Preserve in the New Architecture

| Asset | Preservation Strategy |
|-------|----------------------|
| Design tokens & palette | Port CSS custom properties to shared design tokens |
| Block rendering rules | Reuse as server-side rendering templates + client hydration |
| Type detection logic | Extract to shared library used by CLI, server, and web |
| Factory functions | Evolve into server-side entity constructors |
| Write-before-render guarantee | Evolve into "ack before response" API contract |
| "Send and forget" UX | Preserve in all frontends (CLI, Web, future mobile) |
| Accessibility patterns | Reuse in web UI component library |
| i18n keys & structure | Port to server-side localization + shared message catalog |

---

## 11. Migration Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Data migration from IndexedDB to Postgres | High | Implement JSON export/import bridge; preserve Dexie backup/restore as migration path |
| Feature parity during transition | Medium | Implement server API first, then rebuild web UI as client; keep old app runnable |
| Zustand state shape != server state | Medium | Design server-first API, then adapt Zustand store to cache server state |
| Blob handling (images/files) | High | Server needs blob storage (S3-compatible or filesystem); URLs replace blob references |
| Authentication introduction | Low-Medium | Start with single-user mode; auth is a later epic |

---

## 12. Conclusion

The old prototype is a **well-designed, mature browser application** with a strong UX philosophy and solid technical foundations. Its primary deficiency is not code quality or design — it is **architectural scope**. The browser is the wrong place for embedding generation, vector search, background NLP, and cross-device persistence.

The new full-stack architecture should:
1. **Keep the soul**: zero-friction capture, append-only feed, functional minimalism
2. **Move the brain**: all NLP, embedding, search, and categorization to the server
3. **Free the data**: Postgres + pgvector for persistent, queryable storage
4. **Multiply the interfaces**: CLI first (fastest to build), then web UI (richest experience)
5. **Share the logic**: extract type detection, factories, and formatting into a shared domain library

The old project's documentation, design system, and component patterns are **high-quality assets** that should be ported, not discarded.
