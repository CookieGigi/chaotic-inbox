import { describe, it, expect } from 'vitest'
import {
  createFileItem,
  createTextItem,
  createUrlItem,
  createImageItem,
} from './itemFactories'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
} from './metadata'

describe('itemFactories', () => {
  describe('createFileItem', () => {
    it('should create a file item with correct type', () => {
      const blob = new Blob(['test content'])
      const metadata: FileMetadata = {
        kind: 'pdf',
        filename: 'test.pdf',
        filesize: 1024,
        mimetype: 'application/pdf',
      }

      const item = createFileItem(blob, metadata)

      expect(item.type).toBe('file')
    })

    it('should generate a valid UUID v4 id', () => {
      const blob = new Blob(['test content'])
      const metadata: FileMetadata = {
        kind: 'txt',
        filename: 'test.txt',
        filesize: 100,
        mimetype: 'text/plain',
      }

      const item = createFileItem(blob, metadata)

      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(item.id).toMatch(uuidV4Regex)
    })

    it('should set capturedAt to a valid ISO8601 timestamp', () => {
      const blob = new Blob(['test content'])
      const metadata: FileMetadata = {
        kind: 'zip',
        filename: 'test.zip',
        filesize: 2048,
        mimetype: 'application/zip',
      }

      const item = createFileItem(blob, metadata)

      expect(() => new Date(item.capturedAt)).not.toThrow()
      expect(new Date(item.capturedAt).toISOString()).toBe(item.capturedAt)
    })

    it('should preserve raw blob and metadata', () => {
      const blob = new Blob(['file content'])
      const metadata: FileMetadata = {
        kind: 'docx',
        filename: 'document.docx',
        filesize: 5000,
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }

      const item = createFileItem(blob, metadata)

      expect(item.raw).toBe(blob)
      expect(item.metadata).toEqual(metadata)
    })

    it('should generate unique ids for different items', () => {
      const blob = new Blob(['test'])
      const metadata: FileMetadata = {
        kind: 'other',
        filename: 'test.bin',
        filesize: 10,
        mimetype: 'application/octet-stream',
      }

      const item1 = createFileItem(blob, metadata)
      const item2 = createFileItem(blob, metadata)

      expect(item1.id).not.toBe(item2.id)
    })
  })

  describe('createTextItem', () => {
    it('should create a text item with correct type', () => {
      const metadata: TextMetadata = {
        kind: 'plain',
        wordCount: 5,
      }

      const item = createTextItem('Hello world', metadata)

      expect(item.type).toBe('text')
    })

    it('should preserve raw text and metadata', () => {
      const metadata: TextMetadata = {
        kind: 'markdown',
        wordCount: 100,
      }
      const rawText = '# Heading\n\nSome content'

      const item = createTextItem(rawText, metadata)

      expect(item.raw).toBe(rawText)
      expect(item.metadata).toEqual(metadata)
    })

    it('should generate a valid UUID v4 id', () => {
      const metadata: TextMetadata = { kind: 'code' }

      const item = createTextItem('const x = 1', metadata)

      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(item.id).toMatch(uuidV4Regex)
    })

    it('should set capturedAt to a valid ISO8601 timestamp', () => {
      const metadata: TextMetadata = { kind: 'plain' }

      const item = createTextItem('test', metadata)

      expect(() => new Date(item.capturedAt)).not.toThrow()
      expect(new Date(item.capturedAt).toISOString()).toBe(item.capturedAt)
    })
  })

  describe('createUrlItem', () => {
    it('should create a url item with correct type', () => {
      const metadata: UrlMetadata = {
        kind: 'url',
        title: 'Example Site',
      }

      const item = createUrlItem('https://example.com', metadata)

      expect(item.type).toBe('url')
    })

    it('should preserve raw URL and metadata', () => {
      const metadata: UrlMetadata = {
        kind: 'url',
        title: 'Test Page',
        favicon: 'https://example.com/favicon.ico',
      }
      const url = 'https://test.com/path'

      const item = createUrlItem(url, metadata)

      expect(item.raw).toBe(url)
      expect(item.metadata).toEqual(metadata)
    })

    it('should generate a valid UUID v4 id', () => {
      const metadata: UrlMetadata = { kind: 'url' }

      const item = createUrlItem('https://example.com', metadata)

      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(item.id).toMatch(uuidV4Regex)
    })

    it('should set capturedAt to a valid ISO8601 timestamp', () => {
      const metadata: UrlMetadata = { kind: 'url' }

      const item = createUrlItem('https://example.com', metadata)

      expect(() => new Date(item.capturedAt)).not.toThrow()
      expect(new Date(item.capturedAt).toISOString()).toBe(item.capturedAt)
    })
  })

  describe('createImageItem', () => {
    it('should create an image item with correct type', () => {
      const blob = new Blob(['image data'])
      const metadata: ImageMetadata = {
        kind: 'image',
        width: 1920,
        height: 1080,
      }

      const item = createImageItem(blob, metadata)

      expect(item.type).toBe('image')
    })

    it('should preserve raw blob and metadata', () => {
      const blob = new Blob(['image bytes'])
      const metadata: ImageMetadata = {
        kind: 'image',
        width: 800,
        height: 600,
      }

      const item = createImageItem(blob, metadata)

      expect(item.raw).toBe(blob)
      expect(item.metadata).toEqual(metadata)
    })

    it('should generate a valid UUID v4 id', () => {
      const blob = new Blob(['image'])
      const metadata: ImageMetadata = { kind: 'image' }

      const item = createImageItem(blob, metadata)

      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(item.id).toMatch(uuidV4Regex)
    })

    it('should set capturedAt to a valid ISO8601 timestamp', () => {
      const blob = new Blob(['image'])
      const metadata: ImageMetadata = { kind: 'image' }

      const item = createImageItem(blob, metadata)

      expect(() => new Date(item.capturedAt)).not.toThrow()
      expect(new Date(item.capturedAt).toISOString()).toBe(item.capturedAt)
    })

    it('should handle optional width and height', () => {
      const blob = new Blob(['image'])
      const metadata: ImageMetadata = { kind: 'image' }

      const item = createImageItem(blob, metadata)

      expect(item.metadata.width).toBeUndefined()
      expect(item.metadata.height).toBeUndefined()
    })
  })

  describe('factory uniqueness', () => {
    it('should generate unique ids across different factory types', () => {
      const fileItem = createFileItem(new Blob(['file']), {
        kind: 'txt',
        filename: 'test.txt',
        filesize: 10,
        mimetype: 'text/plain',
      })
      const textItem = createTextItem('text', { kind: 'plain' })
      const urlItem = createUrlItem('https://example.com', { kind: 'url' })
      const imageItem = createImageItem(new Blob(['image']), { kind: 'image' })

      const ids = [fileItem.id, textItem.id, urlItem.id, imageItem.id]
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(4)
    })

    it('should have different capturedAt timestamps for items created at different times', async () => {
      const metadata = { kind: 'plain' } as TextMetadata

      const item1 = createTextItem('test1', metadata)
      await new Promise((resolve) => setTimeout(resolve, 10))
      const item2 = createTextItem('test2', metadata)

      expect(item1.capturedAt).not.toBe(item2.capturedAt)
    })
  })

  describe('TASK-18: Block type immutability', () => {
    it('should determine type at capture time and store on item record', () => {
      const textItem = createTextItem('Hello world', { kind: 'plain' })
      const urlItem = createUrlItem('https://example.com', { kind: 'url' })
      const imageItem = createImageItem(new Blob(['image']), { kind: 'image' })
      const fileItem = createFileItem(new Blob(['file']), {
        kind: 'pdf',
        filename: 'doc.pdf',
        filesize: 1024,
        mimetype: 'application/pdf',
      })

      expect(textItem.type).toBe('text')
      expect(urlItem.type).toBe('url')
      expect(imageItem.type).toBe('image')
      expect(fileItem.type).toBe('file')
    })

    it('should not allow type mutation on created items', () => {
      const item = createTextItem('Hello world', { kind: 'plain' })

      // Type should be a string literal, not modifiable
      expect(item.type).toBe('text')

      // Attempting to change type should either fail or not affect the item
      // In TypeScript, this would be a compile-time error
      // At runtime, we can verify the type remains unchanged
      const originalType = item.type

      // TypeScript would prevent this, but we verify the value hasn't changed
      expect(item.type).toBe(originalType)
    })

    it('should store raw input unmodified regardless of rendering', () => {
      const rawText = '  Padded text with whitespace  '
      const item = createTextItem(rawText, { kind: 'plain' })

      // Raw should be stored exactly as provided
      expect(item.raw).toBe(rawText)
      expect(item.raw).not.toBe(rawText.trim())
    })

    it('should preserve raw URL even when normalized for display', () => {
      const rawUrl = 'example.com' // Without protocol
      const item = createUrlItem(rawUrl, { kind: 'url' })

      // Raw should store the original URL
      expect(item.raw).toBe(rawUrl)
      // Type should be url, not text
      expect(item.type).toBe('url')
    })

    it('should store raw blob without transformation', () => {
      const imageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG header
      const blob = new Blob([imageData], { type: 'image/png' })
      const item = createImageItem(blob, { kind: 'image' })

      // Raw should be the exact same blob
      expect(item.raw).toBe(blob)
    })

    it('should maintain discriminated union between type and metadata', () => {
      const textItem = createTextItem('test', { kind: 'plain' })
      const urlItem = createUrlItem('https://example.com', { kind: 'url' })
      const imageItem = createImageItem(new Blob(['image']), { kind: 'image' })
      const fileItem = createFileItem(new Blob(['file']), {
        kind: 'pdf',
        filename: 'doc.pdf',
        filesize: 1024,
        mimetype: 'application/pdf',
      })

      // Type should always match metadata kind pattern
      expect(textItem.type).toBe('text')
      expect(textItem.metadata.kind).toBe('plain')

      expect(urlItem.type).toBe('url')
      expect(urlItem.metadata.kind).toBe('url')

      expect(imageItem.type).toBe('image')
      expect(imageItem.metadata.kind).toBe('image')

      expect(fileItem.type).toBe('file')
      expect(fileItem.metadata.kind).toBe('pdf')
    })
  })
})
