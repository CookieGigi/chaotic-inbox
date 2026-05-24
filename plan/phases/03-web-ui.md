# Phase 3 — Web UI Implementation

**Status:** 📋 Planned
**Depends on:** Phase 1 (API must be ready)
**Duration:** 3-4 days
**Goal:** Build React SPA that consumes the Python API

---

## Deliverables

- [ ] React app refactored to use Python API instead of IndexedDB
- [ ] API client layer (`fetch` wrapper with error handling)
- [ ] Zustand store adapted for server-backed state
- [ ] Capture features: paste, drop, type, file upload (multipart to API)
- [ ] Feed rendering with type-specific blocks
- [ ] Search interface with filters
- [ ] Item detail view with tags/categories
- [ ] Settings: server URL config, theme, export
- [ ] E2E tests with Playwright

---

## Tasks

### T-01: API Client Layer

**File:** `web/src/lib/api.ts`

Create fetch wrapper:
```typescript
class InboxAPI {
  constructor(private baseUrl: string) {}

  async createItem(data: ItemCreate): Promise<Item> { ... }
  async listItems(params: ListParams): Promise<Item[]> { ... }
  async getItem(id: string): Promise<Item> { ... }
  async updateItem(id: string, data: Partial<Item>): Promise<Item> { ... }
  async deleteItem(id: string): Promise<void> { ... }
  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> { ... }
}
```

- Error handling with user-friendly messages
- Request/response logging in dev mode
- Automatic retry on network errors
- Configurable base URL (from environment or settings)

### T-02: State Management Refactor

**File:** `web/src/store/useAppStore.ts`

Adapt Zustand store for server state:
```typescript
interface AppState {
  items: Item[]
  isLoading: boolean
  error: string | null
  draftItem: DraftItem | null
  isDragging: boolean
  recentlyDeleted: Item | null

  // Actions
  fetchItems: (limit?: number, offset?: number) => Promise<void>
  createItem: (data: ItemCreate) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  restoreItem: (id: string) => Promise<void>
  searchItems: (query: string) => Promise<void>
}
```

- Optimistic updates for capture (show in UI before server confirms)
- Rollback on server error
- Pagination state management
- Search results cache

### T-03: Capture Implementation

**Files:** `web/src/components/Capture/*`

- **Global paste listener:** `document.addEventListener('paste')` → `api.createItem()`
- **Drag-and-drop:** `dragenter`/`drop` → multipart upload via `fetch`
- **Global typing:** `keydown` listener → create draft → `api.createItem()` on submit
- **File upload:** Native file input + multipart form data
- **Type detection:** Client-side URL regex, image mimetype check
- **Progress indicator:** Upload progress bar for large files

### T-04: Feed & Block Rendering

**Files:** `web/src/components/Feed.tsx`, `web/src/components/Block.tsx`

- Fetch items on mount with pagination
- Infinite scroll or "Load more" button
- Type-specific rendering (reuse old Block components)
- Inline editing (PATCH to API)
- Delete with undo toast (POST restore if within timeout)
- Auto-scroll to new items

### T-05: Search Interface

**File:** `web/src/components/Search.tsx`

- Search bar with debounced input
- Filter buttons: type, tag, category, date range
- Results list with relevance indicators
- Empty state with suggestions

### T-06: Item Detail & Management

- Detail modal/sidebar with full metadata
- Tag assignment (create new or select existing)
- Category assignment
- Raw JSON view (for debugging)
- Permalink share

### T-07: Settings

**File:** `web/src/components/SettingsModal.tsx`

- Server URL configuration
- Theme selection (Catppuccin variants)
- Export all items (JSON download)
- Keyboard shortcuts reference
- About / version info

### T-08: Real-Time Updates (Optional)

- Poll for new items every 30s
- Or use Server-Sent Events (FastAPI natively supports SSE)
- Show "New items" notification with refresh button

### T-09: Testing

- Unit tests for API client (Vitest + MSW)
- Component tests for Feed, Block, Search
- E2E tests with Playwright:
  - Capture flow (paste, drop, type)
  - Search flow
  - Delete + undo flow
  - Settings configuration

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript 5.9 |
| Styling | Tailwind CSS v4, Catppuccin tokens |
| State | Zustand |
| HTTP | Native fetch |
| Testing | Vitest, Testing Library, Playwright |

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Feature parity | 100% of old prototype features |
| Capture latency | < 500ms to API response |
| Feed rendering | < 100ms for 50 items |
| Search response | < 200ms |
| Test coverage | > 80% |
| E2E pass rate | 100% |
