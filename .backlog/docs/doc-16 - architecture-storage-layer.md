---
id: doc-16
title: architecture-storage-layer
type: other
created_date: '2026-03-18 00:32'
updated_date: '2026-03-22 08:29'
---

# Storage Layer — Technical Architecture

**Epic:** 1 — Capture
**Status:** Draft
**Version:** 0.2.0
**Last updated:** 2026-03-22
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

import Dexie, { type Table } from 'dexie'
import type { RawItem } from '@/models/rawItem'

export class VaultDB extends Dexie {
  items!: Table<RawItem, string> // keyed by id

  constructor() {
    super('vault')
    this.version(1).stores({
      items: 'id, capturedAt, type',
      // capturedAt indexed → cheap ORDER BY for feed
      // type indexed → useful later for filtering (not in Epic 1 scope, but free)
    })
  }
}

export const db = new VaultDB()
```

### Schema decisions

- `raw` is typed as `string | Blob` — text and URLs stay as strings (cheap, queryable); binaries go in as `Blob` (no encoding cost, native browser support)
- `capturedAt` is **indexed** — feed ordering is an `orderBy('capturedAt')` with no full-table scan
- `metadata` is a **discriminated union** field containing type-specific properties (filename, size, etc.) — see [Item & Metadata Model](./doc-17)
- Metadata is NOT indexed since we don't query by filename/filesize
- Schema version is `1` — Dexie's migration system allows clean evolution in later epics

---

## 3. Write Service

A thin service layer sits between capture events and Dexie. The spec requires the write to complete **before** the UI updates — enforced by making the service `async` and `await`-ing it in the capture handler before dispatching any state update.

```ts
// src/storage/itemService.ts

import { db } from './db'
import type { RawItem } from '@/models/rawItem'
import {
  createFileItem,
  createTextItem,
  createUrlItem,
  createImageItem,
} from '@/models/itemFactories'

export async function persistFile(
  payload: Blob,
  metadata: {
    kind: string
    filename: string
    filesize: number
    mimetype: string
  }
): Promise<RawItem> {
  const item = createFileItem(payload, metadata)
  await db.items.add(item)
  return item
}

export async function persistText(
  payload: string,
  metadata: { kind: string; wordCount?: number }
): Promise<RawItem> {
  const item = createTextItem(payload, metadata)
  await db.items.add(item)
  return item
}

export async function persistUrl(
  payload: string,
  metadata: { kind: string; title?: string; favicon?: string }
): Promise<RawItem> {
  const item = createUrlItem(payload, metadata)
  await db.items.add(item)
  return item
}

export async function persistImage(
  payload: Blob,
  metadata: { kind: string; width?: number; height?: number }
): Promise<RawItem> {
  const item = createImageItem(payload, metadata)
  await db.items.add(item)
  return item
}

export async function loadAllItems(): Promise<RawItem[]> {
  return db.items.orderBy('capturedAt').toArray()
}
```

**Factory pattern benefits:**

- Compile-time type safety — TypeScript ensures correct metadata for each item type
- Centralized construction logic — ID generation, timestamp creation in one place
- Discriminated union safety — `type` and `metadata` are always in sync

**Error handling contract (US-05-05):** Factory functions and `db.items.add()` can throw. The capture handler catches this and surfaces the error to the user — no block is appended to the feed if the write did not complete.

---

## 4. Capture Handler Pattern

The glue that enforces the write-before-render contract at every call site.

```ts
import { persistFile } from '@/storage/itemService'
import type { FileSubType } from '@/models/metadata'

async function handleFileDrop(file: File) {
  // Determine file subtype from extension (caller responsibility)
  const fileSubType: FileSubType = detectFileType(file.name)

  let item: RawItem

  try {
    item = await persistFile(file, {
      kind: fileSubType,
      filename: file.name,
      filesize: file.size,
      mimetype: file.type,
    })
  } catch (err) {
    showStorageError(err)
    return
  }

  appendToFeed(item)
  scrollToBottom()
}
```

The feed state never gets ahead of the storage state.

---

## 5. Type Narrowing (Read Operations)

When reading items from storage, use type guards to safely access type-specific metadata:

```ts
import { isFileItem, isTextItem } from '@/models/metadata'

function renderItem(item: RawItem) {
  if (isFileItem(item)) {
    // TypeScript knows item.metadata has FileMetadata shape
    console.log(item.metadata.filename)
    console.log(item.metadata.filesize)
  } else if (isTextItem(item)) {
    // TypeScript knows item.metadata has TextMetadata shape
    console.log(item.metadata.wordCount)
  }
  // ... etc
}
```

---

## 6. Open Questions

| #   | Question                                                                    | Status                 |
| --- | --------------------------------------------------------------------------- | ---------------------- |
| 1   | How is `raw: Blob` retrieved and rendered (object URLs, `createObjectURL`)? | → F-03 rendering layer |
| 2   | Scroll position persistence — separate key in IndexedDB or `localStorage`?  | → F-04                 |
| 3   | Storage quota monitoring / error UX detail                                  | → US-05-05, follow-up  |

---

## 7. Related Documents

- [Item & Metadata Model](./doc-17) — Complete type definitions, metadata structures, factory functions, and type guards

---

## 8. Next Step

Type detection — the logic that inspects clipboard / drop data and resolves `text | url | image | file` before calling the appropriate persist function. Feeds directly into F-01 and F-02
