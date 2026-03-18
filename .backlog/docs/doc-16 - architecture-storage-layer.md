---
id: doc-16
title: architecture-storage-layer
type: other
created_date: '2026-03-18 00:32'
---
# Storage Layer — Technical Architecture

**Epic:** 1 — Capture
**Status:** Draft
**Version:** 0.1.0
**Last updated:** 2026-03-14
**Stack:** React · Browser-only · IndexedDB via Dexie

---

## 1. Why Dexie

- **Transactional writes** — guarantees the write completes before the UI updates (US-05-01)
- **Binary support** — stores `Blob` / `ArrayBuffer` natively; no base64 inflation
- **Quota headroom** — IndexedDB gets substantially more storage than `localStorage` (typically origin-scoped to ~60% of free disk)
- **TypeScript-first** — Dexie 4 has first-class generics, no extra ceremony

---

## 2. Schema

```ts
// src/storage/db.ts

import Dexie, { type Table } from 'dexie';

export type ItemType = 'text' | 'url' | 'image' | 'file';

export interface Item {
  id: string;           // UUID v4
  type: ItemType;
  capturedAt: string;   // ISO 8601 — used for feed ordering
  raw: string | Blob;   // string for text/url, Blob for image/file
  filename?: string;    // file/image only — original filename if from drop
  filesize?: number;    // file only — bytes
  mimetype?: string;    // image/file — MIME type string
}

export class VaultDB extends Dexie {
  items!: Table<Item, string>;  // keyed by id

  constructor() {
    super('vault');
    this.version(1).stores({
      items: 'id, capturedAt, type',
      // capturedAt indexed → cheap ORDER BY for feed
      // type indexed → useful later for filtering (not in Epic 1 scope, but free)
    });
  }
}

export const db = new VaultDB();
```

### Schema decisions

- `raw` is typed as `string | Blob` — text and URLs stay as strings (cheap, queryable); binaries go in as `Blob` (no encoding cost, native browser support)
- `capturedAt` is **indexed** — feed ordering is an `orderBy('capturedAt')` with no full-table scan
- `filename`, `filesize`, `mimetype` are optional fields on the same table — no separate table needed at this stage
- Schema version is `1` — Dexie's migration system allows clean evolution in later epics

---

## 3. Write Service

A thin service layer sits between capture events and Dexie. The spec requires the write to complete **before** the UI updates — enforced by making the service `async` and `await`-ing it in the capture handler before dispatching any state update.

```ts
// src/storage/itemService.ts

import { db, type Item, type ItemType } from './db';
import { v4 as uuid } from 'uuid';

export async function persistItem(
  payload: string | Blob,
  type: ItemType,
  meta?: { filename?: string; filesize?: number; mimetype?: string }
): Promise<Item> {
  const item: Item = {
    id: uuid(),
    type,
    capturedAt: new Date().toISOString(),
    raw: payload,
    ...meta,
  };

  await db.items.add(item);   // throws on failure — caller handles
  return item;
}

export async function loadAllItems(): Promise<Item[]> {
  return db.items.orderBy('capturedAt').toArray();
}
```

**Error handling contract (US-05-05):** `persistItem` throws if the Dexie write fails. The capture handler catches this and surfaces the error to the user — no block is appended to the feed if the write did not complete.

---

## 4. Capture Handler Pattern

The glue that enforces the write-before-render contract at every call site.

```ts
async function handleCapture(payload: string | Blob, type: ItemType, meta?) {
  let item: Item;

  try {
    item = await persistItem(payload, type, meta);  // write first
  } catch (err) {
    showStorageError(err);   // surface to user, do NOT append block
    return;
  }

  appendToFeed(item);        // only reached if write succeeded
  scrollToBottom();
}
```

The feed state never gets ahead of the storage state.

---

## 5. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | How is `raw: Blob` retrieved and rendered (object URLs, `createObjectURL`)? | → F-03 rendering layer |
| 2 | Scroll position persistence — separate key in IndexedDB or `localStorage`? | → F-04 |
| 3 | Storage quota monitoring / error UX detail | → US-05-05, follow-up |

---

## 6. Next Step

Type detection — the logic that inspects clipboard / drop data and resolves `text | url | image | file` before calling `persistItem`. Feeds directly into F-01 and F-02
