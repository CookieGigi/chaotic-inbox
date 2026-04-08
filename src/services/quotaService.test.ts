import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getQuotaInfo, formatBytes, checkThresholds } from './quotaService'
import { db } from '@/storage/local_db'
import { createTestTextItem } from '@/storage/test-utils'

describe('quotaService', () => {
  // Mock navigator.storage.estimate
  let mockEstimate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockEstimate = vi.fn()

    // Mock navigator.storage
    Object.defineProperty(navigator, 'storage', {
      writable: true,
      configurable: true,
      value: {
        estimate: mockEstimate,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getQuotaInfo', () => {
    it('should return quota info when storage API is supported', async () => {
      mockEstimate.mockResolvedValue({
        usage: 120000000, // 120MB
        quota: 250000000, // 250MB
      })

      // Add some items to the database
      await db.items.clear()
      await db.items.add(createTestTextItem({ id: 'test-1' }))
      await db.items.add(createTestTextItem({ id: 'test-2' }))

      const result = await getQuotaInfo()

      expect(result).not.toBeNull()
      expect(result?.used).toBe(120000000)
      expect(result?.quota).toBe(250000000)
      expect(result?.percent).toBe(48) // 120/250 * 100
      expect(result?.itemCount).toBe(2)
    })

    it('should return null when storage API is not supported', async () => {
      Object.defineProperty(navigator, 'storage', {
        writable: true,
        configurable: true,
        value: undefined,
      })

      const result = await getQuotaInfo()

      expect(result).toBeNull()
    })

    it('should handle when estimate() returns null values', async () => {
      mockEstimate.mockResolvedValue({
        usage: null,
        quota: null,
      })

      await db.items.clear()
      await db.items.add(createTestTextItem({ id: 'test-1' }))

      const result = await getQuotaInfo()

      expect(result).toBeNull()
    })

    it('should handle when estimate() throws an error', async () => {
      mockEstimate.mockRejectedValue(new Error('Storage access denied'))

      const result = await getQuotaInfo()

      expect(result).toBeNull()
    })

    it('should return itemCount of 0 when database is empty', async () => {
      mockEstimate.mockResolvedValue({
        usage: 0,
        quota: 250000000,
      })

      await db.items.clear()

      const result = await getQuotaInfo()

      expect(result?.itemCount).toBe(0)
      expect(result?.percent).toBe(0)
    })

    it('should calculate percent correctly at boundary values', async () => {
      mockEstimate.mockResolvedValue({
        usage: 200000000,
        quota: 250000000,
      })

      await db.items.clear()

      const result = await getQuotaInfo()

      expect(result?.percent).toBe(80) // 200/250 * 100
    })

    it('should handle quota of 0 without throwing', async () => {
      mockEstimate.mockResolvedValue({
        usage: 0,
        quota: 0,
      })

      await db.items.clear()

      const result = await getQuotaInfo()

      expect(result).toBeNull() // or handle gracefully
    })
  })

  describe('formatBytes', () => {
    it('should format bytes to MB', () => {
      expect(formatBytes(120000000)).toBe('120MB')
      expect(formatBytes(50000000)).toBe('50MB')
    })

    it('should format bytes to GB when over 1000MB', () => {
      expect(formatBytes(1500000000)).toBe('1.5GB')
      expect(formatBytes(2000000000)).toBe('2GB')
    })

    it('should handle 0 bytes', () => {
      expect(formatBytes(0)).toBe('0MB')
    })

    it('should round to whole numbers for MB', () => {
      expect(formatBytes(125000000)).toBe('125MB')
    })

    it('should show one decimal for GB', () => {
      expect(formatBytes(1536000000)).toBe('1.5GB') // 1.5GB
    })
  })

  describe('checkThresholds', () => {
    it('should return empty array when below all thresholds', () => {
      const result = checkThresholds(45, [80, 90, 95, 99])
      expect(result).toEqual([])
    })

    it('should return 80 when at 80%', () => {
      const result = checkThresholds(80, [80, 90, 95, 99])
      expect(result).toEqual([80])
    })

    it('should return 80 when above 80% but below 90%', () => {
      const result = checkThresholds(85, [80, 90, 95, 99])
      expect(result).toEqual([80])
    })

    it('should return all crossed thresholds', () => {
      const result = checkThresholds(95, [80, 90, 95, 99])
      expect(result).toEqual([80, 90, 95])
    })

    it('should return all thresholds at 100%', () => {
      const result = checkThresholds(100, [80, 90, 95, 99])
      expect(result).toEqual([80, 90, 95, 99])
    })

    it('should handle empty thresholds array', () => {
      const result = checkThresholds(50, [])
      expect(result).toEqual([])
    })

    it('should handle 0 percent', () => {
      const result = checkThresholds(0, [80, 90])
      expect(result).toEqual([])
    })
  })
})
