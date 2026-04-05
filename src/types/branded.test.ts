import { describe, it, expect } from 'vitest'
import {
  type ISO8601Timestamp,
  isISO8601Timestamp,
  createISO8601Timestamp,
  parseISO8601Timestamp,
} from './branded'

describe('branded types - ISO8601Timestamp', () => {
  describe('isISO8601Timestamp', () => {
    it('should return true for valid ISO8601 timestamps with Z suffix', () => {
      expect(isISO8601Timestamp('2023-01-15T10:05:00Z')).toBe(true)
      expect(isISO8601Timestamp('2026-03-22T09:15:30.000Z')).toBe(true)
      expect(isISO8601Timestamp('2023-06-10T08:30:00.123456Z')).toBe(true)
    })

    it('should return true for valid ISO8601 timestamps with timezone offset', () => {
      expect(isISO8601Timestamp('2023-01-15T10:05:00+00:00')).toBe(true)
      expect(isISO8601Timestamp('2023-01-15T10:05:00-05:00')).toBe(true)
      expect(isISO8601Timestamp('2023-01-15T10:05:00+05:30')).toBe(true)
    })

    it('should return true for date-only ISO8601 strings', () => {
      expect(isISO8601Timestamp('2023-01-15')).toBe(true)
      expect(isISO8601Timestamp('2026-12-31')).toBe(true)
    })

    it('should return true for ISO8601 with space separator', () => {
      expect(isISO8601Timestamp('2023-01-15 10:05:00')).toBe(true)
      expect(isISO8601Timestamp('2023-01-15 10:05:00.000')).toBe(true)
    })

    it('should return false for invalid date strings', () => {
      expect(isISO8601Timestamp('not-a-date')).toBe(false)
      expect(isISO8601Timestamp('2023-13-45')).toBe(false) // Invalid month/day
      expect(isISO8601Timestamp('')).toBe(false)
      expect(isISO8601Timestamp('2023')).toBe(false)
    })

    it('should return false for malformed ISO8601 strings', () => {
      expect(isISO8601Timestamp('2023/01/15')).toBe(false) // Wrong separator
      expect(isISO8601Timestamp('15-01-2023')).toBe(false) // Wrong order
    })

    it('should properly narrow type when used in type guard', () => {
      const value: string = '2023-01-15T10:05:00Z'
      if (isISO8601Timestamp(value)) {
        // TypeScript should recognize this as ISO8601Timestamp
        const timestamp: ISO8601Timestamp = value
        expect(timestamp).toBe(value)
      }
    })
  })

  describe('createISO8601Timestamp', () => {
    it('should create a valid ISO8601Timestamp from current time by default', () => {
      const timestamp = createISO8601Timestamp()
      expect(isISO8601Timestamp(timestamp)).toBe(true)
      expect(typeof timestamp).toBe('string')
    })

    it('should create a valid ISO8601Timestamp from a provided Date', () => {
      const date = new Date('2023-06-15T12:30:45.000Z')
      const timestamp = createISO8601Timestamp(date)
      expect(timestamp).toBe('2023-06-15T12:30:45.000Z')
      expect(isISO8601Timestamp(timestamp)).toBe(true)
    })

    it('should create unique timestamps for different calls', async () => {
      const timestamp1 = createISO8601Timestamp()
      await new Promise((resolve) => setTimeout(resolve, 10))
      const timestamp2 = createISO8601Timestamp()
      expect(timestamp1).not.toBe(timestamp2)
    })

    it('should return a string that can be parsed back to the same date', () => {
      const date = new Date('2023-01-15T10:05:00.123Z')
      const timestamp = createISO8601Timestamp(date)
      const parsed = new Date(timestamp)
      expect(parsed.toISOString()).toBe(timestamp)
    })
  })

  describe('parseISO8601Timestamp', () => {
    it('should return the string as ISO8601Timestamp if valid', () => {
      const input = '2023-01-15T10:05:00Z'
      const result = parseISO8601Timestamp(input)
      expect(result).toBe(input)
      expect(isISO8601Timestamp(result!)).toBe(true)
    })

    it('should return null for invalid strings', () => {
      expect(parseISO8601Timestamp('not-a-date')).toBeNull()
      expect(parseISO8601Timestamp('')).toBeNull()
      expect(parseISO8601Timestamp('invalid')).toBeNull()
    })

    it('should handle timestamps with milliseconds', () => {
      const input = '2023-01-15T10:05:00.123Z'
      const result = parseISO8601Timestamp(input)
      expect(result).toBe(input)
    })

    it('should handle timestamps with timezone offsets', () => {
      const input = '2023-01-15T10:05:00+05:30'
      const result = parseISO8601Timestamp(input)
      expect(result).toBe(input)
    })
  })

  describe('integration with type system', () => {
    it('should enforce branded type at compile time', () => {
      // This test verifies the type system works correctly
      const validTimestamp = '2023-01-15T10:05:00Z' as ISO8601Timestamp

      // Type guard should work
      if (isISO8601Timestamp(validTimestamp)) {
        // Should be able to assign to ISO8601Timestamp variable
        const branded: ISO8601Timestamp = validTimestamp
        expect(branded).toBe(validTimestamp)
      }
    })

    it('should allow creating timestamps from various valid date formats', () => {
      const validFormats = [
        '2023-01-15T10:05:00Z',
        '2023-01-15T10:05:00.000Z',
        '2023-01-15T10:05:00+00:00',
        '2023-01-15T10:05:00-08:00',
        '2023-01-15',
        '2023-01-15 10:05:00',
      ]

      validFormats.forEach((format) => {
        expect(isISO8601Timestamp(format)).toBe(true)
        expect(parseISO8601Timestamp(format)).toBe(format)
      })
    })
  })
})
