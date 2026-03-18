---
id: doc-15
title: architecture-tech-stack
type: other
created_date: '2026-03-18 00:31'
---
# Tech Stack — Technical Architecture

**Epic:** 1 — Capture  
**Status:** Draft  
**Version:** 0.1.0  
**Last updated:** 2026-03-14  
**Stack:** React · Vite · TypeScript · Tailwind CSS · IndexedDB via Dexie

---

## 1. Overview

This document records the technical stack decisions for Epic 1 — Capture. The application is a browser-only, local-first web app. There is no server, no backend, and no remote sync in this epic.

The guiding principle is **minimum viable stack**: every choice is justified by a concrete requirement, and nothing is added speculatively.

---

## 2. Stack Decisions

### 2.1 Framework — React 19

**Decision:** React 19 (latest stable)

React is the component model for the feed UI. The Capture screen is a dynamic, stateful list of heterogeneous blocks — text, URL, image, file — each requiring its own render logic. React's component model maps directly onto the block-based feed described in the feature spec.

React 19's concurrent features (transitions, deferred updates) are available but not required in Epic 1. They remain an option for feed performance optimisation in later epics.

---

### 2.2 Build Tool — Vite 6

**Decision:** Vite 6

Vite provides fast HMR during development and a clean, zero-config production build via native ESM. No server-side rendering, API routes, or framework conventions are needed — plain Vite is the right fit.

Next.js and Remix were considered and rejected: both impose server-oriented abstractions that add friction without benefit for a browser-only, local-first app.

---

### 2.3 Language — TypeScript

**Decision:** TypeScript (strict mode)

The storage schema, block type union, and capture handler pattern are already specified in TypeScript in [architecture-storage-layer.md](backlog://doc/doc-16). The entire codebase will be TypeScript. Strict mode is enabled from day one to catch nullability and type narrowing issues early — especially important around the `raw: string | Blob` field.

---

### 2.4 Styling — Tailwind CSS v4

**Decision:** Tailwind CSS v4

Tailwind's utility-first approach is well-suited to a custom feed UI with no shared component library. Tailwind v4 removes the config file requirement for simple setups, reducing boilerplate.

No component library (Radix, shadcn/ui, etc.) is adopted at this stage. The feed, block, and overlay components are custom enough that a component library introduces more constraints than it solves. This decision is revisited if the annotations epic introduces more complex UI patterns.

---

### 2.5 Database — IndexedDB via Dexie 4

**Decision:** Dexie 4 (IndexedDB wrapper)

Already decided in [architecture-storage-layer.md](backlog://doc/doc-16). Retained here for completeness.

Dexie provides transactional writes (required by US-05-01), native `Blob` / `ArrayBuffer` storage (required for image and file capture), substantially larger quota than `localStorage`, and first-class TypeScript generics.

`localStorage` was explicitly rejected: it is string-only (no binary), quota-constrained (~5 MB), and does not support indexed queries for feed ordering.

---

### 2.6 IDs — `uuid` (v4)

**Decision:** `uuid` package, v4 (random)

Every item record requires a globally unique, stable `id` (US-05-03). UUID v4 satisfies this without a server round-trip. The `uuid` npm package is the standard browser-compatible implementation.

---

### 2.7 Icons — `@phosphor-icons/react`

**Decision:** Phosphor Icons (MIT)

Already decided in Feature Spec Decision #5. Retained here for completeness.

Phosphor provides native coverage for all required file-type icons: `FilePdf`, `FileZip`, `FileMd`, `FileText`, `FileBinary`. The React package exposes tree-shakeable SVG components. License is MIT.

---

### 2.8 State Management — `useReducer` + Context

**Decision:** React built-ins only (`useReducer` + `createContext`)

The feed state in Epic 1 is a flat, append-only list of `Item` records. There is no cross-cutting derived state, no optimistic updates, and no remote sync. A single `FeedContext` with a `useReducer` holding the item array is sufficient.

Zustand was considered. It is a better fit if the state shape grows complex across epics (e.g. filter state, sync state, annotation overlays). This decision is revisited at the start of Epic 2 if state complexity has grown.

**State shape (initial):**

```ts
type FeedState = {
  items: Item[];
  scrollPosition: number;
};

type FeedAction =
  | { type: 'ITEM_APPENDED'; item: Item }
  | { type: 'SCROLL_POSITION_SAVED'; position: number };
```

---

### 2.9 Testing — Vitest + Testing Library

**Decision:** Vitest + `@testing-library/react`

Vitest integrates natively with Vite — no separate Jest config, no Babel transform. The API is compatible with Jest, so test patterns are familiar. `@testing-library/react` provides component-level testing against the DOM, which is the right level for testing capture handlers and block rendering.

Dexie ships a `fake-indexeddb` adapter for test environments. Storage layer tests will use this to avoid mocking.

---

### 2.10 Tooling

| Tool | Choice | Notes |
|------|--------|-------|
| Package manager | **pnpm** | Fast installs, strict dependency resolution, disk-efficient via content-addressable store |
| Linting | **ESLint** | Standard React + TypeScript ruleset |
| Formatting | **Prettier** | Non-negotiable for a shared codebase; single opinionated config |

---

## 3. What Is Explicitly Out of Scope

The following were considered and deferred or rejected for Epic 1:

| Item | Status | Reason |
|------|--------|--------|
| Remote sync / backend | Deferred | Out of Epic 1 scope |
| Component library (Radix, shadcn/ui) | Deferred | Custom feed UI; revisit in annotations epic |
| Zustand / Redux | Deferred | State is too simple to justify; revisit at Epic 2 |
| React Query / SWR | Rejected | No server state in this epic |
| Storybook | Deferred | Not worth the setup cost for 5 block types |
| Service Worker / PWA | Deferred | Local-first via IndexedDB is sufficient; offline PWA is a later concern |

---

## 4. Dependency Reference

| Package | Version | Role |
|---------|---------|------|
| `react` | 19 | UI framework |
| `react-dom` | 19 | DOM renderer |
| `vite` | 6 | Build tool |
| `typescript` | 5 | Language |
| `tailwindcss` | 4 | Styling |
| `dexie` | 4 | IndexedDB ORM |
| `uuid` | 11 | UUID v4 generation |
| `@phosphor-icons/react` | latest | File-type and UI icons |
| `vitest` | latest | Test runner |
| `@testing-library/react` | latest | Component testing |
| `fake-indexeddb` | latest | In-memory IndexedDB for tests |
| `eslint` | latest | Linting |
| `prettier` | latest | Formatting |

---

## 5. Related Documents

| Document | Notes |
|----------|-------|
| [architecture-storage-layer.md](backlog://doc/doc-16) | Storage schema, Dexie setup, write service, capture handler pattern |
| [epic-1-feature-spec-1.md](./specs/epic-1-feature-spec-1.md) | Feature definitions and acceptance criteria |
| [epic-1-f05-user-stories.md](./specs/epic-1-f05-user-stories.md) | Persistence user stories — primary driver of storage decisions |
