import { describe, it, expect } from 'vitest'
import { isFileItem, isTextItem, isUrlItem, isImageItem } from './metadata'

describe('metadata type guards', () => {
  describe('isFileItem', () => {
    it('should return true for file type', () => {
      expect(isFileItem({ type: 'file' })).toBe(true)
    })

    it('should return false for non-file types', () => {
      expect(isFileItem({ type: 'text' })).toBe(false)
      expect(isFileItem({ type: 'url' })).toBe(false)
      expect(isFileItem({ type: 'image' })).toBe(false)
    })

    it('should return false for unknown types', () => {
      expect(isFileItem({ type: 'unknown' })).toBe(false)
      expect(isFileItem({ type: '' })).toBe(false)
    })
  })

  describe('isTextItem', () => {
    it('should return true for text type', () => {
      expect(isTextItem({ type: 'text' })).toBe(true)
    })

    it('should return false for non-text types', () => {
      expect(isTextItem({ type: 'file' })).toBe(false)
      expect(isTextItem({ type: 'url' })).toBe(false)
      expect(isTextItem({ type: 'image' })).toBe(false)
    })

    it('should return false for unknown types', () => {
      expect(isTextItem({ type: 'unknown' })).toBe(false)
      expect(isTextItem({ type: '' })).toBe(false)
    })
  })

  describe('isUrlItem', () => {
    it('should return true for url type', () => {
      expect(isUrlItem({ type: 'url' })).toBe(true)
    })

    it('should return false for non-url types', () => {
      expect(isUrlItem({ type: 'file' })).toBe(false)
      expect(isUrlItem({ type: 'text' })).toBe(false)
      expect(isUrlItem({ type: 'image' })).toBe(false)
    })

    it('should return false for unknown types', () => {
      expect(isUrlItem({ type: 'unknown' })).toBe(false)
      expect(isUrlItem({ type: '' })).toBe(false)
    })
  })

  describe('isImageItem', () => {
    it('should return true for image type', () => {
      expect(isImageItem({ type: 'image' })).toBe(true)
    })

    it('should return false for non-image types', () => {
      expect(isImageItem({ type: 'file' })).toBe(false)
      expect(isImageItem({ type: 'text' })).toBe(false)
      expect(isImageItem({ type: 'url' })).toBe(false)
    })

    it('should return false for unknown types', () => {
      expect(isImageItem({ type: 'unknown' })).toBe(false)
      expect(isImageItem({ type: '' })).toBe(false)
    })
  })

  describe('type guard mutual exclusivity', () => {
    it('should have only one type guard return true for each type', () => {
      const types = ['file', 'text', 'url', 'image'] as const

      types.forEach((type) => {
        const item = { type }
        const results = [
          isFileItem(item),
          isTextItem(item),
          isUrlItem(item),
          isImageItem(item),
        ]
        const trueCount = results.filter(Boolean).length

        expect(trueCount).toBe(1)
      })
    })
  })

  describe('type guard type narrowing', () => {
    it('should narrow type correctly for file items', () => {
      const item = { type: 'file' as const, data: 'test' }

      if (isFileItem(item)) {
        expect(item.type).toBe('file')
      } else {
        throw new Error('Should have narrowed to file type')
      }
    })

    it('should narrow type correctly for text items', () => {
      const item = { type: 'text' as const, data: 'test' }

      if (isTextItem(item)) {
        expect(item.type).toBe('text')
      } else {
        throw new Error('Should have narrowed to text type')
      }
    })

    it('should narrow type correctly for url items', () => {
      const item = { type: 'url' as const, data: 'test' }

      if (isUrlItem(item)) {
        expect(item.type).toBe('url')
      } else {
        throw new Error('Should have narrowed to url type')
      }
    })

    it('should narrow type correctly for image items', () => {
      const item = { type: 'image' as const, data: 'test' }

      if (isImageItem(item)) {
        expect(item.type).toBe('image')
      } else {
        throw new Error('Should have narrowed to image type')
      }
    })
  })

  describe('type guard edge cases', () => {
    it('should handle items with additional properties', () => {
      const fileWithExtras = { type: 'file', extra: 'data', count: 42 }
      expect(isFileItem(fileWithExtras)).toBe(true)

      const textWithExtras = { type: 'text', metadata: { key: 'value' } }
      expect(isTextItem(textWithExtras)).toBe(true)
    })

    it('should be case sensitive', () => {
      expect(isFileItem({ type: 'File' })).toBe(false)
      expect(isTextItem({ type: 'TEXT' })).toBe(false)
      expect(isUrlItem({ type: 'URL' })).toBe(false)
      expect(isImageItem({ type: 'Image' })).toBe(false)
    })
  })
})
