---
id: doc-20
title: Item & Metadata Model
type: other
created_date: '2026-03-22 08:29'
---

# Item & Metadata Model

**Status:** Active  
**Version:** 1.0.0  
**Last updated:** 2026-03-22  
**Related:** [Storage Layer Architecture](./doc-16)

---

## 1. Overview

This document defines the core data model for items stored in the chaotic inbox. Items use a **discriminated union** pattern with type-specific metadata dictionaries.

### Key Design Decisions

- **Metadata as discriminated union** — Each item type has its own metadata shape, enforced at compile time
- **Type guards for narrowing** — Runtime type checking with compile-time type inference
- **Factory functions for construction** — Guaranteed correct metadata assignment
- **No optional fields** — Metadata is always present and type-appropriate

---

## 2. Metadata Types

### 2.1 File Metadata

```ts
// src/models/metadata.ts

export type FileSubType = 'pdf' | 'docx' | 'txt' | 'zip' | 'other'

export interface FileMetadata {
  kind: FileSubType
  filename: string
  filesize: number
  mimetype: string
}
```

### 2.2 Text Metadata

```ts
export interface TextMetadata {
  kind: 'plain' | 'markdown' | 'code'
  wordCount?: number
}
```

### 2.3 URL Metadata

```ts
export interface UrlMetadata {
  kind: 'url'
  title?: string
  favicon?: string
}
```

### 2.4 Image Metadata

```ts
export interface ImageMetadata {
  kind: 'image'
  width?: number
  height?: number
}
```

### 2.5 Metadata Union

```ts
export type Metadata = FileMetadata | TextMetadata | UrlMetadata | ImageMetadata
```

---

## 3. RawItem Discriminated Union

```ts
// src/models/rawItem.ts

import type { ISO8601Timestamp } from '@/types/branded'
import type { UUIDTypes } from 'uuid'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
} from './metadata'

interface RawItemBase {
  id: UUIDTypes
  capturedAt: ISO8601Timestamp
  raw: string | Blob
}

export type RawItem =
  | (RawItemBase & { type: 'file'; metadata: FileMetadata })
  | (RawItemBase & { type: 'text'; metadata: TextMetadata })
  | (RawItemBase & { type: 'url'; metadata: UrlMetadata })
  | (RawItemBase & { type: 'image'; metadata: ImageMetadata })
```

### Why "RawItem"?

Even with metadata, these are still "raw" items because they only store basic capture information. Future processing (OCR, summarization, indexing) will create enriched variants.

---

## 4. Type Guards

Type guards enable safe narrowing of the discriminated union at runtime with full TypeScript inference.

```ts
// src/models/metadata.ts

import type { RawItem } from './rawItem'

export const isFileItem = (item: RawItem): item is RawItem & { type: 'file' } =>
  item.type === 'file'

export const isTextItem = (item: RawItem): item is RawItem & { type: 'text' } =>
  item.type === 'text'

export const isUrlItem = (item: RawItem): item is RawItem & { type: 'url' } =>
  item.type === 'url'

export const isImageItem = (
  item: RawItem
): item is RawItem & { type: 'image' } => item.type === 'image'
```

### Usage Example

```ts
import { isFileItem } from '@/models/metadata'

function getItemLabel(item: RawItem): string {
  if (isFileItem(item)) {
    // TypeScript infers: item.metadata is FileMetadata
    return item.metadata.filename
  }

  if (isTextItem(item)) {
    // TypeScript infers: item.metadata is TextMetadata
    return `Text (${item.metadata.wordCount ?? '?'} words)`
  }

  // ... etc
  return 'Unknown'
}
```

---

## 5. Factory Functions

Factories ensure type-safe construction of RawItem instances with correct metadata.

```ts
// src/models/itemFactories.ts

import { v4 as uuidv4 } from 'uuid'
import type { RawItem } from './rawItem'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
} from './metadata'

function createBaseItem(): Pick<RawItem, 'id' | 'capturedAt'> {
  return {
    id: uuidv4(),
    capturedAt: new Date().toISOString(),
  }
}

export function createFileItem(
  raw: Blob,
  metadata: FileMetadata
): RawItem & { type: 'file' } {
  return {
    ...createBaseItem(),
    type: 'file',
    raw,
    metadata,
  }
}

export function createTextItem(
  raw: string,
  metadata: TextMetadata
): RawItem & { type: 'text' } {
  return {
    ...createBaseItem(),
    type: 'text',
    raw,
    metadata,
  }
}

export function createUrlItem(
  raw: string,
  metadata: UrlMetadata
): RawItem & { type: 'url' } {
  return {
    ...createBaseItem(),
    type: 'url',
    raw,
    metadata,
  }
}

export function createImageItem(
  raw: Blob,
  metadata: ImageMetadata
): RawItem & { type: 'image' } {
  return {
    ...createBaseItem(),
    type: 'image',
    raw,
    metadata,
  }
}
```

### Factory Pattern Benefits

1. **Compile-time safety** — TypeScript enforces correct metadata for each type
2. **Centralized construction** — ID generation, timestamps in one place
3. **Discriminated union safety** — `type` and `metadata.kind` are always in sync
4. **No manual object construction** — Prevents accidentally mismatched types

---

## 6. Extending the Model

To add a new item type:

1. **Create metadata interface** in `metadata.ts`:

   ```ts
   export interface AudioMetadata {
     kind: 'audio'
     duration?: number
     bitrate?: number
   }
   ```

2. **Add to Metadata union** in `metadata.ts`:

   ```ts
   export type Metadata = ... | AudioMetadata
   ```

3. **Add type guard** in `metadata.ts`:

   ```ts
   export const isAudioItem = (
     item: RawItem
   ): item is RawItem & { type: 'audio' } => item.type === 'audio'
   ```

4. **Update RawItem union** in `rawItem.ts`:

   ```ts
   export type RawItem = ... | (RawItemBase & { type: 'audio'; metadata: AudioMetadata })
   ```

5. **Create factory** in `itemFactories.ts`:

   ```ts
   export function createAudioItem(raw: Blob, metadata: AudioMetadata) { ... }
   ```

6. **Update Dexie schema** if you need to index by the new type:
   ```ts
   // No change needed - 'type' field is already indexed
   ```

---

## 7. Migration from Optional Fields

If migrating from an older schema with optional fields:

```ts
// Migration script
async function migrateToMetadataDictionary() {
  const oldItems = await db.items.toArray()

  for (const oldItem of oldItems) {
    // Transform based on type
    if (oldItem.type === 'file') {
      const newItem = createFileItem(oldItem.raw as Blob, {
        kind: detectFileType(oldItem.filename ?? 'unknown'),
        filename: oldItem.filename ?? 'unknown',
        filesize: oldItem.filesize ?? 0,
        mimetype: oldItem.mimetype ?? 'application/octet-stream',
      })
      await db.items.put(newItem)
    }
    // ... etc for other types
  }
}
```

---

## 8. Summary

| Aspect                | Implementation                                         |
| --------------------- | ------------------------------------------------------ |
| **Type safety**       | Compile-time via TypeScript discriminated unions       |
| **Runtime narrowing** | Type guards (`isFileItem`, etc.)                       |
| **Construction**      | Factory functions guarantee correct metadata           |
| **Storage**           | Dexie/IndexedDB with single `metadata` field           |
| **Indexing**          | By `type` for queries, metadata is unindexed           |
| **Extensibility**     | Add metadata type + type guard + factory + union entry |

---

**Next:** See [Storage Layer Architecture](./doc-16) for integration with Dexie and write patterns.
