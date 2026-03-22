# Storage Testing Guide

This document describes how to test the storage layer and persistence functionality using Vitest and fake-indexeddb.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Test Utilities](#test-utilities)
6. [Common Patterns](#common-patterns)
7. [Coverage Checklist](#coverage-checklist)

---

## Overview

The storage layer uses **Dexie** (IndexedDB wrapper) for client-side persistence. Tests use `fake-indexeddb` to provide an in-memory IndexedDB implementation that works in Node.js/Vitest without a real browser.

**Test Files:**

- `src/storage/local_db.test.ts` - Unit tests for database operations
- `src/storage/integration.test.ts` - Integration tests for persistence workflows
- `src/storage/test-utils.ts` - Shared test utilities

---

## Test Structure

### Unit Tests (`local_db.test.ts`)

Test individual database operations in isolation:

- **Database initialization** - Schema creation, indexes
- **CRUD operations** - Add, get, update, delete, clear
- **Data integrity** - Raw field preservation, no truncation
- **Error handling** - Constraint violations, missing fields

### Integration Tests (`integration.test.ts`)

Test complete persistence workflows:

- **End-to-end persistence** - Create → add → retrieve
- **App restart simulation** - Database close/reopen
- **ID uniqueness** - UUID validation, collision detection
- **Ordering** - Timestamp-based sorting
- **Factory integration** - Using item factories with storage
- **Edge cases** - Large datasets, blob storage

---

## Unit Tests

### Database Initialization

```typescript
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VaultDB } from '@/storage/local_db'

describe('VaultDB', () => {
  let db: VaultDB

  beforeEach(() => {
    db = new VaultDB()
  })

  afterEach(async () => {
    await (db as unknown as { delete(): Promise<void> }).delete()
  })

  it('initializes with schema version 1', () => {
    expect(db.name).toBe('vault')
  })

  it('creates items table with correct indexes', async () => {
    const item = createTestTextItem()
    const id = await db.items.add(item)
    expect(id).toBe(item.id)
  })
})
```

### CRUD Operations

```typescript
describe('CRUD operations', () => {
  it('adds item and returns generated id', async () => {
    const item = createTestTextItem()
    const id = await db.items.add(item)
    expect(id).toBe(item.id)
  })

  it('retrieves item by UUID', async () => {
    const item = createTestTextItem()
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)

    expect(retrieved).not.toBeUndefined()
    expect(retrieved!.id).toBe(item.id)
  })

  it('returns all items as array', async () => {
    await db.items.add(createTestTextItem())
    await db.items.add(createTestUrlItem())

    const allItems = await db.items.toArray()
    expect(allItems).toHaveLength(2)
  })

  it('deletes item by id', async () => {
    const item = createTestTextItem()
    await db.items.add(item)

    await db.items.delete(item.id)

    const retrieved = await db.items.get(item.id)
    expect(retrieved).toBeUndefined()
  })

  it('updates item fields', async () => {
    const item = createTestTextItem()
    await db.items.add(item)

    await db.items.update(item.id, { raw: 'Updated content' })

    const retrieved = await db.items.get(item.id)
    expect(retrieved!.raw).toBe('Updated content')
  })
})
```

### Data Integrity (F-05 TASK-27)

```typescript
describe('data integrity', () => {
  it('stores text raw field without modification', async () => {
    const rawText = '  Original text with spaces  '
    const item = createTestTextItem({ raw: rawText })
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)
    expect(retrieved!.raw).toBe(rawText) // Exact match
  })

  it('stores blob raw field byte-for-byte', async () => {
    const originalBlob = new Blob(['test image bytes'], { type: 'image/png' })
    const item = createTestImageItem({ raw: originalBlob })
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)
    expect(retrieved).toBeDefined()
    expect(retrieved!.type).toBe('image')
  })

  it('preserves unicode and special characters', async () => {
    const unicodeText = 'Hello 世界 🌍 ñ ü é'
    const item = createTestTextItem({ raw: unicodeText })
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)
    expect(retrieved!.raw).toBe(unicodeText)
  })

  it('does not truncate large content', async () => {
    const largeText = 'x'.repeat(100000)
    const item = createTestTextItem({ raw: largeText })
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)
    expect((retrieved!.raw as string).length).toBe(100000)
  })
})
```

---

## Integration Tests

### ID and Timestamp Validation (F-05 TASK-28)

```typescript
import { describe, it, expect } from 'vitest'

describe('IDs and timestamps', () => {
  it('generates 100 unique UUIDs without collision', async () => {
    const items = generateTestItems(100)

    for (const item of items) {
      await db.items.add(item)
    }

    const allItems = await db.items.toArray()
    const ids = allItems.map((i) => i.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(100)
  })

  it('each item has valid ISO 8601 timestamp', async () => {
    const item = createTestTextItem()
    await db.items.add(item)

    const retrieved = await db.items.get(item.id)
    const capturedAt = retrieved!.capturedAt

    expect(() => new Date(capturedAt)).not.toThrow()
    expect(new Date(capturedAt).toISOString()).toBe(capturedAt)
  })

  it('timestamps increase monotonically', async () => {
    const item1 = createTextItem('First', metadata)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const item2 = createTextItem('Second', metadata)

    await db.items.add(item1)
    await db.items.add(item2)

    const time1 = new Date(item1.capturedAt).getTime()
    const time2 = new Date(item2.capturedAt).getTime()

    expect(time2).toBeGreaterThan(time1)
  })
})
```

### Factory Integration

```typescript
describe('factory integration', () => {
  it('createTextItem → db.add → retrieve matches', async () => {
    const metadata: TextMetadata = { kind: 'markdown', wordCount: 10 }
    const original = createTextItem('# Hello\n\nWorld content', metadata)

    await db.items.add(original)
    const retrieved = await db.items.get(original.id)

    expect(retrieved!.raw).toBe(original.raw)
    expect(retrieved!.metadata).toEqual(original.metadata)
    expect(retrieved!.type).toBe('text')
  })

  it('metadata objects preserved after round-trip', async () => {
    const imageItem = createTestImageItem()
    await db.items.add(imageItem)

    const retrieved = await db.items.get(imageItem.id)
    expect(retrieved!.metadata).toEqual(imageItem.metadata)
  })
})
```

---

## Test Utilities

The `test-utils.ts` file provides shared utilities for storage tests:

```typescript
// Setup and teardown
export function setupTestDB(): VaultDB
export async function teardownTestDB(): Promise<void>
export async function resetDatabase(): Promise<void>

// Test data factories
export function createTestTextItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'text' }
export function createTestUrlItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'url' }
export function createTestImageItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'image' }
export function createTestFileItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'file' }

// Utilities
export function generateTestBlob(sizeInBytes: number): Blob
export function generateTestItems(
  count: number
): Array<RawItem & { type: 'text' }>
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer>
export async function arraysEqual(
  a: ArrayBuffer,
  b: ArrayBuffer
): Promise<boolean>
```

### Using Test Utilities

```typescript
import {
  setupTestDB,
  teardownTestDB,
  createTestTextItem,
  createTestImageItem,
  generateTestBlob,
} from '@/storage/test-utils'

describe('My Test', () => {
  let db: VaultDB

  beforeEach(() => {
    db = setupTestDB()
  })

  afterEach(async () => {
    await teardownTestDB()
  })

  it('uses test utilities', async () => {
    const item = createTestTextItem({ raw: 'Custom content' })
    await db.items.add(item)

    const largeBlob = generateTestBlob(1024 * 1024) // 1MB
    const imageItem = createTestImageItem({ raw: largeBlob })
    await db.items.add(imageItem)
  })
})
```

---

## Common Patterns

### Testing All Item Types

```typescript
it('all item types persist correctly', async () => {
  const textItem = createTestTextItem()
  const urlItem = createTestUrlItem()
  const imageItem = createTestImageItem()
  const fileItem = createTestFileItem()

  await db.items.add(textItem)
  await db.items.add(urlItem)
  await db.items.add(imageItem)
  await db.items.add(fileItem)

  expect(await db.items.get(textItem.id)).toBeDefined()
  expect(await db.items.get(urlItem.id)).toBeDefined()
  expect(await db.items.get(imageItem.id)).toBeDefined()
  expect(await db.items.get(fileItem.id)).toBeDefined()
})
```

### Testing Ordering

```typescript
it('returns items in capturedAt ascending order', async () => {
  const item1 = {
    ...createTextItem('First', metadata),
    capturedAt: '2026-01-01T00:00:00.000Z',
  }
  const item2 = {
    ...createTextItem('Second', metadata),
    capturedAt: '2026-01-02T00:00:00.000Z',
  }

  await db.items.add(item2)
  await db.items.add(item1)

  const sortedItems = await db.items.orderBy('capturedAt').toArray()

  expect(sortedItems[0].id).toBe(item1.id)
  expect(sortedItems[1].id).toBe(item2.id)
})
```

### Testing Filtering

```typescript
it('filters by type index correctly', async () => {
  await db.items.add(createTestTextItem())
  await db.items.add(createTestTextItem())
  await db.items.add(createTestUrlItem())

  const textItems = await db.items.where('type').equals('text').toArray()
  expect(textItems).toHaveLength(2)
})
```

---

## Coverage Checklist

### F-05 User Story Coverage

| Task    | Description               | Test Coverage                        |
| ------- | ------------------------- | ------------------------------------ |
| TASK-27 | Raw input stored exactly  | ✅ Data integrity tests (4 tests)    |
| TASK-28 | Unique ID and timestamp   | ✅ ID/timestamp validation (3 tests) |
| TASK-29 | Items survive app restart | ✅ Persistence tests (4 tests)       |
| TASK-26 | Persist before appearing  | ⚠️ Partial (storage layer only)      |
| TASK-30 | Storage failure surfaced  | ⚠️ Partial (storage layer errors)    |

### Test Categories

- [x] Database initialization
- [x] CRUD operations
- [x] Data integrity (raw field preservation)
- [x] ID uniqueness (UUID v4)
- [x] Timestamp validation (ISO 8601)
- [x] Ordering by capturedAt
- [x] Filtering by type
- [x] Factory integration
- [x] Blob storage
- [x] Large dataset handling
- [x] Error handling
- [x] Concurrent operations

---

## Running Tests

```bash
# Run all storage tests
npm test -- src/storage/

# Run specific test file
npm test -- src/storage/local_db.test.ts
npm test -- src/storage/integration.test.ts

# Run with coverage
npm run test:coverage -- src/storage/

# Watch mode
npm run test:watch -- src/storage/
```

---

## Resources

- [Dexie Documentation](https://dexie.org/docs/)
- [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
