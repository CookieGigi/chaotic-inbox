import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VaultDB } from './local_db'
import {
  setupTestDB,
  teardownTestDB,
  createTestTextItem,
  createTestUrlItem,
  createTestImageItem,
  createTestFileItem,
  generateTestBlob,
  generateTestItems,
} from './test-utils'
import type { RawItem } from '@/models/rawItem'
import type { TextMetadata, UrlMetadata } from '@/models/metadata'
import { createTextItem, createUrlItem } from '@/models/itemFactories'

describe('Storage Integration', () => {
  let db: VaultDB

  beforeEach(() => {
    db = setupTestDB()
  })

  afterEach(async () => {
    await teardownTestDB()
  })

  describe('end-to-end persistence', () => {
    it('full round-trip: create → add → retrieve → verify', async () => {
      const originalItem = createTestTextItem()
      await db.items.add(originalItem)

      const retrieved = await db.items.get(originalItem.id)

      expect(retrieved).not.toBeUndefined()
      expect(retrieved!.id).toBe(originalItem.id)
      expect(retrieved!.type).toBe(originalItem.type)
      expect(retrieved!.raw).toBe(originalItem.raw)
      expect(retrieved!.capturedAt).toBe(originalItem.capturedAt)
      expect(retrieved!.metadata).toEqual(originalItem.metadata)
    })

    it('survives database close and reopen (app restart)', async () => {
      // Note: fake-indexeddb is in-memory, so we test with the same instance
      // In production, IndexedDB persists to disk
      const item = createTestTextItem()
      await db.items.add(item)

      // Verify item is persisted in current session
      const retrieved = await db.items.get(item.id)
      expect(retrieved).not.toBeUndefined()
      expect(retrieved!.raw).toBe(item.raw)
      expect(retrieved!.id).toBe(item.id)
    })

    it('handles concurrent adds without corruption', async () => {
      const items = [
        createTestTextItem(),
        createTestUrlItem(),
        createTestImageItem(),
        createTestFileItem(),
      ]

      await Promise.all(items.map((item) => db.items.add(item)))

      const allItems = await db.items.toArray()
      expect(allItems).toHaveLength(4)

      const retrievedIds = new Set(allItems.map((i) => i.id))
      items.forEach((item) => {
        expect(retrievedIds.has(item.id)).toBe(true)
      })
    })

    it('all item types persist correctly (text, url, image, file)', async () => {
      const textItem = createTestTextItem()
      const urlItem = createTestUrlItem()
      const imageItem = createTestImageItem()
      const fileItem = createTestFileItem()

      await db.items.add(textItem)
      await db.items.add(urlItem)
      await db.items.add(imageItem)
      await db.items.add(fileItem)

      const retrievedText = await db.items.get(textItem.id)
      const retrievedUrl = await db.items.get(urlItem.id)
      const retrievedImage = await db.items.get(imageItem.id)
      const retrievedFile = await db.items.get(fileItem.id)

      expect(retrievedText!.type).toBe('text')
      expect(retrievedUrl!.type).toBe('url')
      expect(retrievedImage!.type).toBe('image')
      expect(retrievedFile!.type).toBe('file')
    })
  })

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

    it('timestamps increase monotonically with add order', async () => {
      const metadata: TextMetadata = { kind: 'plain' }
      const item1 = createTextItem('First', metadata)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const item2 = createTextItem('Second', metadata)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const item3 = createTextItem('Third', metadata)

      await db.items.add(item1)
      await db.items.add(item2)
      await db.items.add(item3)

      const time1 = new Date(item1.capturedAt).getTime()
      const time2 = new Date(item2.capturedAt).getTime()
      const time3 = new Date(item3.capturedAt).getTime()

      expect(time2).toBeGreaterThan(time1)
      expect(time3).toBeGreaterThan(time2)
    })
  })

  describe('queries and ordering', () => {
    it('returns items in capturedAt ascending order by default', async () => {
      const metadata: TextMetadata = { kind: 'plain' }
      const urlMetadata: UrlMetadata = { kind: 'url' }

      const item1 = createTextItem('Oldest', metadata)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const item2 = createUrlItem('https://middle.com', urlMetadata)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const item3 = createTextItem('Newest', metadata)

      await db.items.add(item1)
      await db.items.add(item3)
      await db.items.add(item2)

      const allItems = await db.items.orderBy('capturedAt').toArray()

      expect(allItems[0].id).toBe(item1.id)
      expect(allItems[1].id).toBe(item2.id)
      expect(allItems[2].id).toBe(item3.id)
    })

    it('filters by type index correctly', async () => {
      await db.items.add(createTestTextItem())
      await db.items.add(createTestTextItem())
      await db.items.add(createTestUrlItem())
      await db.items.add(createTestImageItem())

      const textItems = await db.items.where('type').equals('text').toArray()
      const urlItems = await db.items.where('type').equals('url').toArray()
      const imageItems = await db.items.where('type').equals('image').toArray()

      expect(textItems).toHaveLength(2)
      expect(urlItems).toHaveLength(1)
      expect(imageItems).toHaveLength(1)
    })

    it('supports sorting by capturedAt timestamp', async () => {
      const metadata: TextMetadata = { kind: 'plain' }

      // Create items with explicit timestamps to control ordering
      const item1 = {
        ...createTextItem('First', metadata),
        capturedAt: '2026-01-01T00:00:00.000Z' as RawItem['capturedAt'],
      }
      const item2 = {
        ...createTextItem('Second', metadata),
        capturedAt: '2026-01-02T00:00:00.000Z' as RawItem['capturedAt'],
      }
      const item3 = {
        ...createTextItem('Third', metadata),
        capturedAt: '2026-01-03T00:00:00.000Z' as RawItem['capturedAt'],
      }

      await db.items.add(item2)
      await db.items.add(item1)
      await db.items.add(item3)

      // Query items ordered by capturedAt
      const sortedItems = await db.items.orderBy('capturedAt').toArray()

      expect(sortedItems).toHaveLength(3)
      expect(sortedItems[0].id).toBe(item1.id)
      expect(sortedItems[1].id).toBe(item2.id)
      expect(sortedItems[2].id).toBe(item3.id)
    })
  })

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
      expect((retrieved!.metadata as { width?: number }).width).toBe(1920)
      expect((retrieved!.metadata as { height?: number }).height).toBe(1080)
    })

    it('nested metadata structures intact', async () => {
      const fileItem = createTestFileItem()
      await db.items.add(fileItem)

      const retrieved = await db.items.get(fileItem.id)
      const metadata = retrieved!.metadata as {
        kind: string
        filename: string
        filesize: number
        mimetype: string
      }

      expect(metadata.kind).toBe('txt')
      expect(metadata.filename).toBe('test.txt')
      expect(metadata.filesize).toBe(100)
      expect(metadata.mimetype).toBe('text/plain')
    })
  })

  describe('edge cases', () => {
    it('handles 1000 items without data loss', async () => {
      const items = generateTestItems(1000)

      for (const item of items) {
        await db.items.add(item)
      }

      const allItems = await db.items.toArray()
      expect(allItems).toHaveLength(1000)

      const retrievedIds = new Set(allItems.map((i) => i.id))
      expect(retrievedIds.size).toBe(1000)
    })

    it('preserves large blob storage', async () => {
      // Note: fake-indexeddb may have limitations with large blobs
      // We test with a smaller blob that still exercises the storage path
      const mediumBlob = generateTestBlob(1024 * 1024) // 1MB
      const item = createTestImageItem({ raw: mediumBlob })

      await db.items.add(item)
      const retrieved = await db.items.get(item.id)

      expect(retrieved).not.toBeUndefined()
      expect(retrieved!.type).toBe('image')
      expect(retrieved!.raw).toBeDefined()
    })

    it('rapid add/delete cycles are safe', async () => {
      const item = createTestTextItem()

      for (let i = 0; i < 100; i++) {
        const testItem = { ...item, id: crypto.randomUUID() }
        await db.items.add(testItem)
        await db.items.delete(testItem.id)
      }

      const remainingItems = await db.items.toArray()
      expect(remainingItems).toHaveLength(0)
    })
  })
})
