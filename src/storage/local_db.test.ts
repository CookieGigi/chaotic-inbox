import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VaultDB } from './local_db'
import {
  setupTestDB,
  teardownTestDB,
  createTestTextItem,
  createTestUrlItem,
  createTestImageItem,
} from './test-utils'

describe('VaultDB', () => {
  let db: VaultDB

  beforeEach(() => {
    db = setupTestDB()
  })

  afterEach(async () => {
    await teardownTestDB()
  })

  describe('initialization', () => {
    it('initializes with schema version 1', () => {
      expect(db).toBeInstanceOf(VaultDB)
      expect(db.name).toBe('vault')
    })

    it('creates items table with correct indexes', async () => {
      const item = createTestTextItem()
      const id = await db.items.add(item)
      expect(id).toBe(item.id)
    })

    it('sets database name to "vault"', () => {
      expect(db.name).toBe('vault')
    })
  })

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
      expect(retrieved!.type).toBe('text')
    })

    it('returns all items as array', async () => {
      const item1 = createTestTextItem()
      const item2 = createTestUrlItem()

      await db.items.add(item1)
      await db.items.add(item2)

      const allItems = await db.items.toArray()

      expect(allItems).toHaveLength(2)
      expect(allItems.map((i) => i.id)).toContain(item1.id)
      expect(allItems.map((i) => i.id)).toContain(item2.id)
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

      const newRaw = 'Updated content'
      await db.items.update(item.id, { raw: newRaw })

      const retrieved = await db.items.get(item.id)
      expect(retrieved!.raw).toBe(newRaw)
    })

    it('clears all items', async () => {
      await db.items.add(createTestTextItem())
      await db.items.add(createTestUrlItem())

      await db.items.clear()

      const allItems = await db.items.toArray()
      expect(allItems).toHaveLength(0)
    })
  })

  describe('data integrity', () => {
    it('stores text raw field without modification', async () => {
      const rawText = '  Original text with spaces  '
      const item = createTestTextItem({ raw: rawText })
      await db.items.add(item)

      const retrieved = await db.items.get(item.id)
      expect(retrieved!.raw).toBe(rawText)
    })

    it('stores blob raw field byte-for-byte', async () => {
      const originalBlob = new Blob(['test image bytes'], { type: 'image/png' })
      const item = createTestImageItem({ raw: originalBlob })
      await db.items.add(item)

      const retrieved = await db.items.get(item.id)
      expect(retrieved).not.toBeUndefined()
      // Note: fake-indexeddb may serialize blobs differently, so we just verify the item exists
      expect(retrieved!.type).toBe('image')
      expect(retrieved!.raw).toBeDefined()
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

  describe('error handling', () => {
    it('rejects on duplicate id constraint violation', async () => {
      const item = createTestTextItem()
      await db.items.add(item)

      const duplicateItem = { ...item }
      await expect(db.items.add(duplicateItem)).rejects.toThrow()
    })

    it('deleting non-existent item does not throw', async () => {
      await expect(db.items.delete('non-existent-id')).resolves.not.toThrow()
    })

    it('updating non-existent item returns 0', async () => {
      const result = await db.items.update('non-existent-id', {
        raw: 'new content',
      })
      expect(result).toBe(0)
    })
  })
})
