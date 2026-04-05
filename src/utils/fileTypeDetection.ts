import { fileTypeFromBlob } from 'file-type'
import type { FileSubType } from '@/models/metadata'

/**
 * Result of file type detection
 */
export interface FileTypeInfo {
  /** Detected file extension (e.g., 'png', 'pdf') */
  ext: string | null
  /** Detected MIME type (e.g., 'image/png', 'application/pdf') */
  mime: string | null
  /** Whether the file is an image */
  isImage: boolean
  /** File subtype for metadata */
  subType: FileSubType
}

/**
 * Image MIME type prefixes
 */
const IMAGE_MIME_PREFIXES = ['image/']

/**
 * Known image extensions
 */
const IMAGE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'tiff',
  'svg',
]

/**
 * Code file extensions
 */
const CODE_EXTENSIONS = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'py',
  'rb',
  'php',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'go',
  'rs',
  'swift',
  'kt',
  'scala',
  'sql',
  'json',
  'xml',
  'yaml',
  'yml',
  'vue',
  'svelte',
  'sh',
  'bash',
  'zsh',
  'ps1',
  'bat',
  'cmd',
]

/**
 * Audio file extensions
 */
const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'ogg',
  'flac',
  'aac',
  'm4a',
  'wma',
  'aiff',
  'opus',
]

/**
 * Video file extensions
 */
const VIDEO_EXTENSIONS = [
  'mp4',
  'avi',
  'mkv',
  'mov',
  'wmv',
  'flv',
  'webm',
  'm4v',
  'mpeg',
  'mpg',
  '3gp',
  'ogv',
]

/**
 * Archive file extensions (beyond zip)
 */
const ARCHIVE_EXTENSIONS = ['7z', 'rar', 'tar', 'gz', 'bz2', 'xz', 'lz', 'lzma']

/**
 * Extension to FileSubType mapping
 */
function extensionToSubType(ext: string): FileSubType {
  const lowerExt = ext.toLowerCase()

  // Document types
  switch (lowerExt) {
    case 'pdf':
      return 'pdf'
    case 'docx':
    case 'doc':
      return 'docx'
    case 'txt':
    case 'text':
      return 'txt'
    case 'md':
    case 'markdown':
    case 'mkd':
      return 'md'
    case 'csv':
      return 'csv'
    case 'xls':
    case 'xlsx':
      return 'xls'
    case 'ppt':
    case 'pptx':
      return 'ppt'
    case 'zip':
      return 'zip'
  }

  // Check code files
  if (CODE_EXTENSIONS.includes(lowerExt)) {
    return 'code'
  }

  // Check audio files
  if (AUDIO_EXTENSIONS.includes(lowerExt)) {
    return 'audio'
  }

  // Check video files
  if (VIDEO_EXTENSIONS.includes(lowerExt)) {
    return 'video'
  }

  // Check archive files
  if (ARCHIVE_EXTENSIONS.includes(lowerExt)) {
    return 'archive'
  }

  return 'other'
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string | null {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : null
}

/**
 * Check if extension indicates an image file
 */
function isImageExtension(ext: string): boolean {
  return IMAGE_EXTENSIONS.includes(ext.toLowerCase())
}

/**
 * Check if MIME type indicates a code file
 */
function isCodeMimeType(mime: string): boolean {
  const codeMimePrefixes = [
    'application/javascript',
    'application/json',
    'application/xml',
    'text/html',
    'text/css',
    'text/x-',
    'application/x-',
  ]
  return codeMimePrefixes.some((prefix) => mime.startsWith(prefix))
}

/**
 * Check if MIME type indicates an audio file
 */
function isAudioMimeType(mime: string): boolean {
  return mime.startsWith('audio/')
}

/**
 * Check if MIME type indicates a video file
 */
function isVideoMimeType(mime: string): boolean {
  return mime.startsWith('video/')
}

/**
 * Detect file type using magic numbers via file-type library
 * Falls back to extension-based detection for text files
 *
 * @param file - File or Blob to analyze
 * @returns Promise resolving to FileTypeInfo
 */
export async function detectFileType(file: File): Promise<FileTypeInfo> {
  try {
    // Try magic number detection first
    const type = await fileTypeFromBlob(file)

    if (type) {
      const { ext, mime } = type
      const isImage = IMAGE_MIME_PREFIXES.some((prefix) =>
        mime.startsWith(prefix)
      )

      // Check for specific MIME type categories
      if (isAudioMimeType(mime)) {
        return {
          ext,
          mime,
          isImage: false,
          subType: 'audio',
        }
      }

      if (isVideoMimeType(mime)) {
        return {
          ext,
          mime,
          isImage: false,
          subType: 'video',
        }
      }

      if (isCodeMimeType(mime)) {
        return {
          ext,
          mime,
          isImage: false,
          subType: 'code',
        }
      }

      // Handle ZIP-based formats
      if (ext === 'zip') {
        const fileExt = getExtension(file.name)
        if (fileExt === 'docx' || fileExt === 'doc') {
          return {
            ext: 'docx',
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            isImage: false,
            subType: 'docx',
          }
        }
        if (fileExt === 'xlsx' || fileExt === 'xls') {
          return {
            ext: 'xlsx',
            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            isImage: false,
            subType: 'xls',
          }
        }
        if (fileExt === 'pptx' || fileExt === 'ppt') {
          return {
            ext: 'pptx',
            mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            isImage: false,
            subType: 'ppt',
          }
        }
      }

      // Handle other archive formats detected by file-type
      const archiveExts = ['7z', 'rar', 'tar', 'gz', 'bz2', 'xz']
      if (archiveExts.includes(ext)) {
        return {
          ext,
          mime,
          isImage: false,
          subType: 'archive',
        }
      }

      return {
        ext,
        mime,
        isImage,
        subType: extensionToSubType(ext),
      }
    }

    // Fallback to extension-based detection for files without magic numbers
    return detectByExtension(file.name)
  } catch (error) {
    // On error, try extension fallback or return safe defaults
    console.warn('Error detecting file type:', error)
    return detectByExtension(file.name)
  }
}

/**
 * Detect file type based on extension only
 * Used as fallback when magic number detection fails
 *
 * @param filename - Name of the file
 * @returns FileTypeInfo based on extension
 */
export function detectByExtension(filename: string): FileTypeInfo {
  const ext = getExtension(filename)

  if (!ext) {
    return {
      ext: null,
      mime: 'application/octet-stream',
      isImage: false,
      subType: 'other',
    }
  }

  const isImage = isImageExtension(ext)
  const subType = extensionToSubType(ext)

  // Map common extensions to MIME types
  const mimeMap: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    // Documents
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    md: 'text/markdown',
    csv: 'text/csv',
    // Archives
    zip: 'application/zip',
    '7z': 'application/x-7z-compressed',
    rar: 'application/vnd.rar',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    webm: 'video/webm',
    // Code
    js: 'application/javascript',
    ts: 'application/typescript',
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    py: 'text/x-python',
    sql: 'application/sql',
  }

  return {
    ext,
    mime: mimeMap[ext] || 'application/octet-stream',
    isImage,
    subType,
  }
}

/**
 * Check if a file is an image
 * Uses magic numbers with extension fallback
 *
 * @param file - File to check
 * @returns Promise resolving to true if file is an image
 */
export async function isImageFile(file: File): Promise<boolean> {
  const info = await detectFileType(file)
  return info.isImage
}

/**
 * Get the file subtype for metadata
 * Uses magic numbers with extension fallback
 *
 * @param file - File to analyze
 * @returns Promise resolving to FileSubType
 */
export async function getFileSubType(file: File): Promise<FileSubType> {
  const info = await detectFileType(file)
  return info.subType
}
