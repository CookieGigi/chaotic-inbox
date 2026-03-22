import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ISO8601Timestamp } from '@/types/branded'
import { Timestamp, formatTimestamp } from './Timestamp'

describe('Timestamp', () => {
  describe('formatTimestamp', () => {
    beforeEach(() => {
      // Mock current date to March 22, 2026 14:30:00 UTC
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-22T14:30:00.000Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('formats today timestamps as HH:MM in local timezone', () => {
      const today = '2026-03-22T09:15:30.000Z' as ISO8601Timestamp
      const result = formatTimestamp(today)
      const expected = new Date(today).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      expect(result).toBe(expected)
    })

    it('formats this year timestamps as "Mon DD · HH:MM" in local timezone', () => {
      const thisYear = '2026-01-15T10:05:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(thisYear)

      const date = new Date(thisYear)
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      expect(result).toBe(`${datePart} · ${timePart}`)
    })

    it('formats older timestamps as "YYYY Mon DD · HH:MM" in local timezone', () => {
      const older = '2023-06-10T08:30:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(older)

      const date = new Date(older)
      const yearPart = date.getFullYear()
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      expect(result).toBe(`${yearPart} ${datePart} · ${timePart}`)
    })

    it('formats yesterday (different day) with date and time', () => {
      const yesterday = '2026-03-21T14:30:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(yesterday)

      // Should include date since it's not today
      expect(result).toContain('·')
    })

    it('recognizes items from last year as older', () => {
      const lastYear = '2025-12-25T00:00:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(lastYear)

      // Should include year
      expect(result).toContain('2025')
    })

    it('handles end of day edge case correctly', () => {
      // Use early morning UTC which is still yesterday in any local timezone
      const earlyYesterday = '2026-03-21T02:00:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(earlyYesterday)

      // Should not be treated as today (different date in local timezone)
      expect(result).toContain('·')
    })

    it('handles start of year edge case correctly', () => {
      const newYearsDay = '2026-01-01T00:00:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(newYearsDay)

      const date = new Date(newYearsDay)
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      expect(result).toContain(datePart)
    })

    it('handles leap year correctly', () => {
      const leapDay = '2024-02-29T12:30:00.000Z' as ISO8601Timestamp
      const result = formatTimestamp(leapDay)

      // Should include year since it's older
      expect(result).toContain('2024')
      expect(result).toContain('Feb')
    })
  })

  describe('component rendering', () => {
    it('renders with correct <time> element and datetime attribute', () => {
      const timestamp = '2026-03-22T14:30:00.000Z' as ISO8601Timestamp
      render(<Timestamp value={timestamp} />)

      const timeElement = screen.getByText(formatTimestamp(timestamp))
      expect(timeElement.tagName).toBe('TIME')
      expect(timeElement).toHaveAttribute('datetime', timestamp)
    })

    it('has ISO timestamp as title attribute for hover tooltip', () => {
      const timestamp = '2026-01-15T10:05:00.000Z' as ISO8601Timestamp
      render(<Timestamp value={timestamp} />)

      const timeElement = screen.getByText(formatTimestamp(timestamp))
      expect(timeElement).toHaveAttribute('title')
      expect(timeElement.getAttribute('title')).toContain('UTC')
    })

    it('applies correct CSS classes for muted styling', () => {
      const timestamp = '2023-06-10T08:30:00.000Z' as ISO8601Timestamp
      render(<Timestamp value={timestamp} />)

      const timeElement = screen.getByText(formatTimestamp(timestamp))
      expect(timeElement.className).toContain('text-sm')
      expect(timeElement.className).toContain('text-text-muted')
    })

    it('renders today format without date prefix', () => {
      const now = new Date()
      const todayTimestamp = now.toISOString() as ISO8601Timestamp

      vi.useFakeTimers()
      vi.setSystemTime(now)

      render(<Timestamp value={todayTimestamp} />)

      const result = formatTimestamp(todayTimestamp)
      // Today format should not contain "·"
      expect(result).not.toContain('·')

      vi.useRealTimers()
    })
  })
})
