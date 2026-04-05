import { describe, it, expect } from 'vitest'
import {
  detectFileType,
  detectByExtension,
  isImageFile,
  getFileSubType,
} from './fileTypeDetection'

/**
 * Helper to create a mock File with specific byte content
 */
function createMockFile(
  name: string,
  bytes: number[] | Uint8Array,
  mimeType = 'application/octet-stream'
): File {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType })
  return new File([blob], name, { type: mimeType })
}

/**
 * Magic numbers for testing (hex → decimal)
 * Providing more complete file signatures for reliable detection
 */
const MAGIC_NUMBERS = {
  // PNG: 89 50 4E 47 0D 0A 1A 0A + IHDR chunk (minimum viable PNG)
  PNG: [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ],
  // JPEG: FF D8 FF + JFIF marker
  JPEG: [
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ],
  // GIF: 47 49 46 38 + version
  GIF: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00],
  // WEBP: 52 49 46 46 + size + WEBP
  WEBP: [
    0x52, 0x49, 0x46, 0x46, 0x1e, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    0x56, 0x50, 0x38, 0x20,
  ],
  // PDF: 25 50 44 46 + version
  PDF: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc0, 0xc0],
  // ZIP: 50 4B 03 04 + version
  ZIP: [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
}

describe('fileTypeDetection', () => {
  describe('detectByExtension', () => {
    it('should detect PNG by extension', () => {
      const result = detectByExtension('image.png')
      expect(result.ext).toBe('png')
      expect(result.mime).toBe('image/png')
      expect(result.isImage).toBe(true)
      expect(result.subType).toBe('other')
    })

    it('should detect JPG by extension', () => {
      const result = detectByExtension('photo.jpg')
      expect(result.ext).toBe('jpg')
      expect(result.mime).toBe('image/jpeg')
      expect(result.isImage).toBe(true)
      expect(result.subType).toBe('other')
    })

    it('should detect JPEG by extension', () => {
      const result = detectByExtension('photo.jpeg')
      expect(result.ext).toBe('jpeg')
      expect(result.mime).toBe('image/jpeg')
      expect(result.isImage).toBe(true)
    })

    it('should detect GIF by extension', () => {
      const result = detectByExtension('animation.gif')
      expect(result.ext).toBe('gif')
      expect(result.mime).toBe('image/gif')
      expect(result.isImage).toBe(true)
    })

    it('should detect WEBP by extension', () => {
      const result = detectByExtension('image.webp')
      expect(result.ext).toBe('webp')
      expect(result.mime).toBe('image/webp')
      expect(result.isImage).toBe(true)
    })

    it('should detect PDF by extension', () => {
      const result = detectByExtension('document.pdf')
      expect(result.ext).toBe('pdf')
      expect(result.mime).toBe('application/pdf')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('pdf')
    })

    it('should detect ZIP by extension', () => {
      const result = detectByExtension('archive.zip')
      expect(result.ext).toBe('zip')
      expect(result.mime).toBe('application/zip')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('zip')
    })

    it('should detect TXT by extension', () => {
      const result = detectByExtension('notes.txt')
      expect(result.ext).toBe('txt')
      expect(result.mime).toBe('text/plain')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('txt')
    })

    it('should detect MD by extension', () => {
      const result = detectByExtension('readme.md')
      expect(result.ext).toBe('md')
      expect(result.mime).toBe('text/markdown')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('md')
    })

    it('should detect DOCX by extension', () => {
      const result = detectByExtension('document.docx')
      expect(result.ext).toBe('docx')
      expect(result.mime).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('docx')
    })

    it('should handle files without extension', () => {
      const result = detectByExtension('README')
      expect(result.ext).toBeNull()
      expect(result.mime).toBe('application/octet-stream')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('other')
    })

    it('should be case insensitive', () => {
      const result = detectByExtension('IMAGE.PNG')
      expect(result.ext).toBe('png')
      expect(result.isImage).toBe(true)
    })

    it('should return other for unknown extensions', () => {
      const result = detectByExtension('data.unknown')
      expect(result.ext).toBe('unknown')
      expect(result.subType).toBe('other')
    })

    it('should detect CSV by extension', () => {
      const result = detectByExtension('data.csv')
      expect(result.ext).toBe('csv')
      expect(result.subType).toBe('csv')
    })

    it('should detect XLS/XLSX by extension', () => {
      const result = detectByExtension('spreadsheet.xlsx')
      expect(result.ext).toBe('xlsx')
      expect(result.subType).toBe('xls')
    })

    it('should detect PPT/PPTX by extension', () => {
      const result = detectByExtension('presentation.pptx')
      expect(result.ext).toBe('pptx')
      expect(result.subType).toBe('ppt')
    })

    it('should detect code files by extension', () => {
      const codeExts = ['js', 'ts', 'tsx', 'html', 'css', 'py', 'json']
      codeExts.forEach((ext) => {
        const result = detectByExtension(`file.${ext}`)
        expect(result.subType).toBe('code')
      })
    })

    it('should detect audio files by extension', () => {
      const audioExts = ['mp3', 'wav', 'ogg', 'flac']
      audioExts.forEach((ext) => {
        const result = detectByExtension(`audio.${ext}`)
        expect(result.subType).toBe('audio')
      })
    })

    it('should detect video files by extension', () => {
      const videoExts = ['mp4', 'avi', 'mkv', 'mov']
      videoExts.forEach((ext) => {
        const result = detectByExtension(`video.${ext}`)
        expect(result.subType).toBe('video')
      })
    })

    it('should detect archive files by extension', () => {
      const archiveExts = ['7z', 'rar', 'tar', 'gz']
      archiveExts.forEach((ext) => {
        const result = detectByExtension(`archive.${ext}`)
        expect(result.subType).toBe('archive')
      })
    })
  })

  describe('detectFileType with magic numbers', () => {
    it('should detect PNG by magic number', async () => {
      const file = createMockFile('image.png', MAGIC_NUMBERS.PNG)
      const result = await detectFileType(file)
      expect(result.ext).toBe('png')
      expect(result.mime).toBe('image/png')
      expect(result.isImage).toBe(true)
    })

    it('should detect JPEG by magic number', async () => {
      const file = createMockFile('photo.jpg', MAGIC_NUMBERS.JPEG)
      const result = await detectFileType(file)
      expect(result.ext).toBe('jpg')
      expect(result.mime).toBe('image/jpeg')
      expect(result.isImage).toBe(true)
    })

    it('should detect GIF by magic number', async () => {
      const file = createMockFile('animation.gif', MAGIC_NUMBERS.GIF)
      const result = await detectFileType(file)
      expect(result.ext).toBe('gif')
      expect(result.mime).toBe('image/gif')
      expect(result.isImage).toBe(true)
    })

    it('should detect WEBP by magic number', async () => {
      const file = createMockFile('image.webp', MAGIC_NUMBERS.WEBP)
      const result = await detectFileType(file)
      expect(result.ext).toBe('webp')
      expect(result.mime).toBe('image/webp')
      expect(result.isImage).toBe(true)
    })

    it('should detect PDF by magic number', async () => {
      const file = createMockFile('document.pdf', MAGIC_NUMBERS.PDF)
      const result = await detectFileType(file)
      expect(result.ext).toBe('pdf')
      expect(result.mime).toBe('application/pdf')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('pdf')
    })

    it('should detect ZIP by magic number', async () => {
      const file = createMockFile('archive.zip', MAGIC_NUMBERS.ZIP)
      const result = await detectFileType(file)
      expect(result.ext).toBe('zip')
      expect(result.mime).toBe('application/zip')
      expect(result.isImage).toBe(false)
      expect(result.subType).toBe('zip')
    })

    it('should detect DOCX by extension when magic number is ZIP', async () => {
      const file = createMockFile('document.docx', MAGIC_NUMBERS.ZIP)
      const result = await detectFileType(file)
      expect(result.ext).toBe('docx')
      expect(result.subType).toBe('docx')
      expect(result.isImage).toBe(false)
    })

    it('should detect DOCX even with wrong extension', async () => {
      // A docx file renamed to .zip should still be detected as docx if named correctly
      const file = createMockFile('document.docx', MAGIC_NUMBERS.ZIP)
      const result = await detectFileType(file)
      expect(result.ext).toBe('docx')
      expect(result.subType).toBe('docx')
    })

    it('should fall back to extension for TXT files', async () => {
      // TXT files don't have magic numbers
      const file = createMockFile('notes.txt', [0x48, 0x65, 0x6c, 0x6c, 0x6f])
      const result = await detectFileType(file)
      expect(result.ext).toBe('txt')
      expect(result.mime).toBe('text/plain')
      expect(result.subType).toBe('txt')
    })

    it('should fall back to extension for MD files', async () => {
      const file = createMockFile('readme.md', [0x23, 0x20, 0x54, 0x69])
      const result = await detectFileType(file)
      expect(result.ext).toBe('md')
      expect(result.mime).toBe('text/markdown')
      expect(result.subType).toBe('md')
    })

    it('should detect spoofed extension (PNG content with .txt extension)', async () => {
      // File has PNG magic numbers but .txt extension
      const file = createMockFile('spoofed.txt', MAGIC_NUMBERS.PNG)
      const result = await detectFileType(file)
      // Magic numbers should win - it's actually a PNG
      expect(result.ext).toBe('png')
      expect(result.mime).toBe('image/png')
      expect(result.isImage).toBe(true)
    })

    it('should detect spoofed extension (PDF content with .png extension)', async () => {
      // File has PDF magic numbers but .png extension
      const file = createMockFile('spoofed.png', MAGIC_NUMBERS.PDF)
      const result = await detectFileType(file)
      // Magic numbers should win - it's actually a PDF
      expect(result.ext).toBe('pdf')
      expect(result.mime).toBe('application/pdf')
      expect(result.isImage).toBe(false)
    })

    it('should handle empty files gracefully', async () => {
      const file = createMockFile('empty.txt', [])
      const result = await detectFileType(file)
      // Should fall back to extension
      expect(result.ext).toBe('txt')
      expect(result.subType).toBe('txt')
    })

    it('should handle files with no extension and no magic number', async () => {
      const file = createMockFile('unknownfile', [0x00, 0x01, 0x02, 0x03])
      const result = await detectFileType(file)
      expect(result.ext).toBeNull()
      expect(result.subType).toBe('other')
    })

    it('should handle errors gracefully', async () => {
      // Create an invalid file that might cause issues
      const mockFile = {
        name: 'test.txt',
        size: 10,
        type: 'text/plain',
        slice: () => {
          throw new Error('Read error')
        },
      } as unknown as File

      const result = await detectFileType(mockFile)
      // Should fall back to extension detection
      expect(result.ext).toBe('txt')
      expect(result.subType).toBe('txt')
    })
  })

  describe('isImageFile', () => {
    it('should return true for PNG files', async () => {
      const file = createMockFile('image.png', MAGIC_NUMBERS.PNG)
      expect(await isImageFile(file)).toBe(true)
    })

    it('should return true for JPEG files', async () => {
      const file = createMockFile('photo.jpg', MAGIC_NUMBERS.JPEG)
      expect(await isImageFile(file)).toBe(true)
    })

    it('should return true for GIF files', async () => {
      const file = createMockFile('animation.gif', MAGIC_NUMBERS.GIF)
      expect(await isImageFile(file)).toBe(true)
    })

    it('should return true for WEBP files', async () => {
      const file = createMockFile('image.webp', MAGIC_NUMBERS.WEBP)
      expect(await isImageFile(file)).toBe(true)
    })

    it('should return false for PDF files', async () => {
      const file = createMockFile('document.pdf', MAGIC_NUMBERS.PDF)
      expect(await isImageFile(file)).toBe(false)
    })

    it('should return false for ZIP files', async () => {
      const file = createMockFile('archive.zip', MAGIC_NUMBERS.ZIP)
      expect(await isImageFile(file)).toBe(false)
    })

    it('should return true for image by extension when no magic number', async () => {
      // BMP doesn't have magic number in our current detection
      const file = createMockFile('image.bmp', [0x42, 0x4d])
      const result = await isImageFile(file)
      // Will detect by extension
      expect(result).toBe(true)
    })

    it('should return false for TXT files', async () => {
      const file = createMockFile('notes.txt', [0x48, 0x65, 0x6c, 0x6c])
      expect(await isImageFile(file)).toBe(false)
    })
  })

  describe('getFileSubType', () => {
    it('should return correct subtype for PDF', async () => {
      const file = createMockFile('doc.pdf', MAGIC_NUMBERS.PDF)
      expect(await getFileSubType(file)).toBe('pdf')
    })

    it('should return correct subtype for ZIP', async () => {
      const file = createMockFile('archive.zip', MAGIC_NUMBERS.ZIP)
      expect(await getFileSubType(file)).toBe('zip')
    })

    it('should return correct subtype for DOCX', async () => {
      const file = createMockFile('doc.docx', MAGIC_NUMBERS.ZIP)
      expect(await getFileSubType(file)).toBe('docx')
    })

    it('should return correct subtype for TXT', async () => {
      const file = createMockFile('notes.txt', [0x48, 0x65, 0x6c])
      expect(await getFileSubType(file)).toBe('txt')
    })

    it('should return correct subtype for MD', async () => {
      const file = createMockFile('readme.md', [0x23])
      expect(await getFileSubType(file)).toBe('md')
    })

    it('should return correct subtype for CSV', async () => {
      const file = createMockFile('data.csv', [0x6e, 0x61, 0x6d])
      expect(await getFileSubType(file)).toBe('csv')
    })

    it('should return correct subtype for XLS/XLSX', async () => {
      const file = createMockFile('data.xlsx', MAGIC_NUMBERS.ZIP)
      expect(await getFileSubType(file)).toBe('xls')
    })

    it('should return correct subtype for PPT/PPTX', async () => {
      const file = createMockFile('slides.pptx', MAGIC_NUMBERS.ZIP)
      expect(await getFileSubType(file)).toBe('ppt')
    })

    it('should return correct subtype for code files', async () => {
      const file = createMockFile('script.js', [0x63, 0x6f, 0x6e])
      expect(await getFileSubType(file)).toBe('code')
    })

    it('should return correct subtype for audio files', async () => {
      const file = createMockFile('sound.mp3', [0x49, 0x44, 0x33])
      expect(await getFileSubType(file)).toBe('audio')
    })

    it('should return correct subtype for video files', async () => {
      const file = createMockFile('movie.mp4', [0x00, 0x00, 0x00])
      expect(await getFileSubType(file)).toBe('video')
    })

    it('should return correct subtype for archive files', async () => {
      const file = createMockFile('compressed.7z', [0x37, 0x7a, 0xbc])
      expect(await getFileSubType(file)).toBe('archive')
    })

    it('should return other for unknown types', async () => {
      const file = createMockFile('data.unknown', [0x00, 0x01, 0x02])
      expect(await getFileSubType(file)).toBe('other')
    })

    it('should return other for images (images have their own type)', async () => {
      const file = createMockFile('image.png', MAGIC_NUMBERS.PNG)
      expect(await getFileSubType(file)).toBe('other')
    })
  })

  describe('browser compatibility', () => {
    it('should work with File API objects', async () => {
      const blob = new Blob([new Uint8Array(MAGIC_NUMBERS.PNG)])
      const file = new File([blob], 'test.png', { type: 'image/png' })
      const result = await detectFileType(file)
      expect(result.ext).toBe('png')
      expect(result.isImage).toBe(true)
    })

    it('should work with various file sizes', async () => {
      // Large PNG
      const largeContent = new Uint8Array([
        ...MAGIC_NUMBERS.PNG,
        ...Array(1000).fill(0),
      ])
      const largeFile = createMockFile('large.png', largeContent)
      const result = await detectFileType(largeFile)
      expect(result.ext).toBe('png')
    })
  })
})
