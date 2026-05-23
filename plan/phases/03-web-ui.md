# Phase 3: Web UI — Capture & Feed

**Goal**: React SPA that recreates the old prototype's core capture + feed experience, backed by the new API server. Same "zero-friction" UX philosophy.

## Dependencies

- Phase 0 (Technical Stack Foundation)
- Phase 1 (Domain Model + Database + Core API) — API server must be running and healthy

## Tasks

| # | Feature | Detail |
|---------|---------|--------|
| 3.1 | Design tokens | Port CSS custom properties from `design/ui/v0.html` into Tailwind v4's `@theme` block in `web/src/styles/theme.css`. Tokens: `--color-bg` (#181926), `--color-surface` (#1e2030), `--color-overlay` (#24273a), `--color-border` (#363a4f), `--color-border-subtle` (#494d64), `--color-text` (#cad3f5), `--color-text-muted` (#a5adcb), `--color-text-faint` (#939ab7). Semantic: `--color-error` (#ed8796), `--color-success` (#a6da95), `--color-warning` (#eed49f), `--color-accent` (#8bd5ca teal default, user-configurable). Typography: `--font-sans` Geist (via `@fontsource/geist` or Google Fonts), `--font-mono` system mono. Type scale: xs (11px), sm (13px), base (15px), label (12px). Spacing: 4px grid, 8 levels. `--container-feed` (720px), `--radius-sm` (4px), `--z-overlay` (50). |
| 3.2 | Zustand store | `web/src/store/appStore.ts`. State shape: `items: Item[]`, `draftItem: DraftItem | null`, `draftContent: string`, `isDragging: boolean`, `recentlyDeleted: { item: Item; timeoutId: number } | null`, `isLoading: boolean`. Actions: `addItem(item)`, `updateItem(id, patch)`, `deleteItem(id)`, `setItems(items)`, `setDraftContent(content)`, `commitDraft()`, `setDragging(bool)`, `undoDelete()`. Selectors: `useItems()`, `useItemById(id)`, `useDraft()`, `useIsDragging()`. |
| 3.3 | TanStack Query hooks | `web/src/api/hooks.ts`. `useItemsQuery(cursor?, limit?)` — `useInfiniteQuery` against `GET /v1/items`. `useCreateItem()` mutation — on success, invalidate `items` query. `useUpdateItem(id)` mutation. `useDeleteItem(id)` mutation — on success, store item in `recentlyDeleted` for 5s (undo window). Query keys: `['items', { cursor, limit }]`. Stale time: 30s. Cache time: 5min. |
| 3.4 | Feed page | `web/src/pages/FeedPage.tsx`. Layout: `<main>` with 720px max-width, centered, padding. `<Feed>` component: `<ul>` or `<div>` list. Items ordered by `captured_at` ASC (oldest first). Auto-scroll to bottom on initial load and when new item appended. `<EmptyState>` when no items: "Capture something to get started." Empty state has subtle icon (Inbox from Phosphor). Loading state: skeleton shimmer bars matching block heights. |
| 3.5 | Block components | `web/src/components/blocks/`. `<TextBlock>`: renders `raw` as text. Truncated at 5 lines (CSS `line-clamp-5`). "Show more/less" toggle button if text > 5 lines. Supports markdown rendering if `metadata.kind === 'markdown'`. `<UrlBlock>`: hostname as `<span className="text-muted text-sm">`, full URL as `<a>` in accent color, underline on hover. If `metadata.title` available, show as block title. `<ImageBlock>`: `<img src={blob_url}>` constrained to feed width, object-fit contain. Alt text from `metadata.alt`. `<FileBlock>`: type-specific icon (PDF, zip, generic), filename, formatted size (KB/MB). All blocks: left edge has type icon (Phosphor), right edge has relative timestamp. Divider line (1px, `--color-border`) between blocks. No card backgrounds — surface is continuous. |
| 3.6 | Capture: paste | Global event listener on `document`: `paste` event. `e.preventDefault()` on paste when no `<input>`/`<textarea>` is focused. Read `e.clipboardData`: if `items` contains image file → upload as `image`. If text contains URL pattern (regex `https?://`) → create `url` item. Else → create `text` item. Fires `useCreateItem` mutation. Optimistic update: append item to Zustand store immediately, remove on error. |
| 3.7 | Capture: drag & drop | Global listeners: `dragenter` → set `isDragging` true → show overlay. `dragleave` → if leaving document, set `isDragging` false. `drop` → read `e.dataTransfer.files`: iterate files, detect type by extension/MIME. Image files → `image`, others → `file`. Upload each as multipart via `useCreateItem`. Overlay: full-screen, `--color-overlay` background at 80% opacity, dashed border `--color-border`, centered text "Drop files here to capture". |
| 3.8 | Capture: type-to-capture | Global `keydown` listener on `document`. If key is alphanumeric AND no `<input>`/`<textarea>`/contenteditable is focused → create draft block at bottom. Draft: `<textarea>` with `autoFocus`, placeholder "Type your capture...". `Ctrl+Enter` or `Cmd+Enter` commits draft → fires `useCreateItem`. `Esc` cancels draft. Draft block has minimal styling: 1px border, no background change. |
| 3.9 | Block actions | Each block has a 3-dot menu button (top-right, appears on hover or always visible on mobile). Dropdown menu: "Edit" and "Delete". Edit: replaces block content with `<textarea>`, `Ctrl+Enter` saves, `Esc` cancels. Delete: fires `useDeleteItem` → shows undo toast at bottom of screen. Toast: "Item deleted. Undo" with countdown timer (5s). Click "Undo" → restores item via `undoDelete()`. Toast auto-dismisses after 5s. |
| 3.10 | Virtualized feed | Use `@tanstack/react-virtual` for feeds with > 100 items. Virtual container with `count={items.length}`, `getScrollElement` pointing to feed container. Render only visible blocks. Preserve scroll position on pagination load (load more button or infinite scroll). |
| 3.11 | Telemetry bar | Bottom sticky bar (or footer). Shows: total item count, storage used (sum of file sizes, fetched from `/v1/stats`), online/offline status (navigator.onLine + fallback ping to `/health`). Muted styling, `--color-text-faint`. |

## Human Test Checklist

- [ ] `pnpm dev` → open `localhost:5173` → see empty state with "Capture something to get started."
- [ ] Press any alphanumeric key (not in an input) → draft block appears at bottom with focused textarea
- [ ] Type text in draft, press `Ctrl+Enter` → block appears in feed. Refresh page → item persists (from server)
- [ ] Paste plain text (Ctrl+V) → text block appears immediately
- [ ] Paste a URL (Ctrl+V) → URL block appears with hostname label
- [ ] Paste an image (from clipboard or screenshot) → image block appears
- [ ] Drag a file onto the window → overlay appears, drop → file block appears
- [ ] Create 20+ items → feed scrolls, scroll position maintained
- [ ] Click 3-dot menu → "Edit" → textarea appears, edit text, Ctrl+Enter → updated
- [ ] Click "Delete" → toast appears with "Undo", item removed from feed. Click "Undo" → item restored.
- [ ] Wait 5s after delete → toast disappears, item permanently gone
- [ ] Resize browser → feed stays 720px max-width, centered. On mobile (<640px) → single column, full width
- [ ] Accent color: open browser dev tools, change `--color-accent` in `<html>` style → UI accent changes everywhere

## Auto Test Checklist

- [ ] Vitest + React Testing Library. Mock API with `msw` (Mock Service Worker).
- [ ] Test `<Feed>` renders items from store → assert DOM contains item content
- [ ] Test `<TextBlock>` renders text, truncates at 5 lines, "Show more" expands
- [ ] Test `<UrlBlock>` renders hostname and clickable link
- [ ] Test `<FileBlock>` renders icon, filename, size
- [ ] Test `<ImageBlock>` renders `<img>` with correct src
- [ ] Test `handlePaste(clipboardData)` → dispatches correct `useCreateItem` mutation with correct type
- [ ] Test `handleDrop(dataTransfer.files)` → dispatches mutations for each file
- [ ] Test draft creation: keydown with alphanumeric + no focused input → draft appears
- [ ] Test draft commit: `Ctrl+Enter` → mutation fires, draft cleared
- [ ] Test `useDeleteItem` → optimistic removal from store, undo restore
- [ ] Test Zustand selectors: `useItems()` returns correct subset
- [ ] Test pagination: infinite query loads next page on scroll/load-more
- [ ] Test empty state: no items → empty message rendered
- [ ] Test loading state: initial fetch → skeleton bars visible

## Deliverable

A functional React SPA at `web/` that connects to the API server. Supports paste, drag-drop, and type-to-capture. Renders a chronological feed with type-specific blocks. Delete with undo. Ready for search and management features in later phases.
