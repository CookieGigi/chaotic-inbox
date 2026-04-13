import { v4 as uuidv4 } from 'uuid'
import type { RawItem } from '@/models/rawItem'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
  FileSubType,
} from '@/models/metadata'
import { createISO8601Timestamp } from '@/types/branded'

// Sample data for realistic item generation
const sampleTitles = [
  'Project Ideas',
  'Meeting Notes',
  'Research Paper',
  'Design Mockup',
  'Important Document',
  'Travel Plans',
  'Shopping List',
  'Code Snippet',
  'Article Draft',
  'Budget Spreadsheet',
  'Presentation Slides',
  'Photo Collection',
  'Audio Recording',
  'Video Tutorial',
  'Reference Material',
  'Contract Agreement',
  'Invoice Receipt',
  'User Manual',
  'Bug Report',
  'Feature Request',
  'Weekly Report',
  'Monthly Review',
  'Quarterly Analysis',
  'Annual Summary',
  'Client Feedback',
  'Team Updates',
  'Product Roadmap',
  'Marketing Plan',
  'Sales Data',
  'Support Tickets',
]

const sampleDomains = [
  'github.com',
  'stackoverflow.com',
  'docs.google.com',
  'notion.so',
  'figma.com',
  'youtube.com',
  'medium.com',
  'dev.to',
  'twitter.com',
  'linkedin.com',
  'reddit.com',
  'producthunt.com',
  'hackernews.ycombinator.com',
  'dribbble.com',
  'behance.net',
  'unsplash.com',
  'pexels.com',
  'wikipedia.org',
  'archive.org',
  'arxiv.org',
]

const sampleWords = [
  'Lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'Ut',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'Duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'Excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
]

const fileExtensions = [
  'pdf',
  'docx',
  'txt',
  'md',
  'zip',
  'mp3',
  'mp4',
  'csv',
  'xlsx',
  'pptx',
]

const fileSubTypes: FileSubType[] = [
  'pdf',
  'docx',
  'txt',
  'md',
  'zip',
  'audio',
  'video',
  'csv',
  'xls',
  'ppt',
]

const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
  zip: 'application/zip',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random Date within the last year
 */
function randomDate(): Date {
  const now = new Date()
  return new Date(now.getTime() - randomInt(0, 365 * 24 * 60 * 60 * 1000))
}

/**
 * Generate random text content of specified size in KB
 */
export function generateLargeText(sizeInKB: number): string {
  const targetLength = sizeInKB * 1024
  let text = ''

  while (text.length < targetLength) {
    const sentenceLength = randomInt(5, 20)
    const sentence = []
    for (let i = 0; i < sentenceLength; i++) {
      sentence.push(randomElement(sampleWords))
    }
    text += sentence.join(' ') + '. '
  }

  return text.slice(0, targetLength)
}

/**
 * Generate a simulated file blob of specified size in MB
 */
export function generateSimulatedFile(sizeInMB: number): Blob {
  const bytes = sizeInMB * 1024 * 1024
  const buffer = new Uint8Array(bytes)

  // Fill with random data to simulate a real file
  for (let i = 0; i < bytes; i++) {
    buffer[i] = Math.floor(Math.random() * 256)
  }

  return new Blob([buffer])
}

/**
 * Generate a text item
 */
export function generateTextItem(
  textSizeInKB?: number
): RawItem & { type: 'text' } {
  const content = textSizeInKB
    ? generateLargeText(textSizeInKB)
    : randomElement(sampleTitles) +
      ' - ' +
      randomElement(sampleWords) +
      ' ' +
      randomElement(sampleWords)

  const wordCount = content.split(/\s+/).length

  const metadata: TextMetadata = {
    kind: randomElement(['plain', 'markdown', 'code']),
    wordCount,
  }

  return {
    id: uuidv4(),
    capturedAt: createISO8601Timestamp(randomDate()),
    type: 'text',
    raw: content,
    metadata,
  }
}

/**
 * Generate a URL item
 */
export function generateUrlItem(): RawItem & { type: 'url' } {
  const domain = randomElement(sampleDomains)
  const path =
    randomElement(sampleWords).toLowerCase() +
    '-' +
    randomElement(sampleWords).toLowerCase()
  const url = `https://${domain}/${path}`

  const metadata: UrlMetadata = {
    kind: 'url',
    title: randomElement(sampleTitles),
  }

  return {
    id: uuidv4(),
    capturedAt: createISO8601Timestamp(randomDate()),
    type: 'url',
    raw: url,
    metadata,
    title: domain,
  }
}

/**
 * Generate an image item
 */
export function generateImageItem(
  fileSizeInMB?: number
): RawItem & { type: 'image' } {
  const blob = fileSizeInMB
    ? generateSimulatedFile(fileSizeInMB)
    : generateSimulatedFile(randomInt(1, 5) / 10) // 0.1-0.5MB default

  const metadata: ImageMetadata = {
    kind: 'image',
    width: randomInt(800, 4000),
    height: randomInt(600, 3000),
    alt: randomElement(sampleTitles),
  }

  return {
    id: uuidv4(),
    capturedAt: createISO8601Timestamp(randomDate()),
    type: 'image',
    raw: blob,
    metadata,
    title: `Image_${randomInt(1000, 9999)}.jpg`,
  }
}

/**
 * Generate a file item
 */
export function generateFileItem(
  fileSizeInMB?: number
): RawItem & { type: 'file' } {
  const sizeInMB = fileSizeInMB ?? randomInt(1, 20)
  const blob = generateSimulatedFile(sizeInMB)
  const extension = randomElement(fileExtensions)

  const metadata: FileMetadata = {
    kind: randomElement(fileSubTypes),
    filename: `${randomElement(sampleWords)}_${randomInt(1000, 9999)}.${extension}`,
    filesize: blob.size,
    mimetype: mimeTypes[extension] || 'application/octet-stream',
  }

  return {
    id: uuidv4(),
    capturedAt: createISO8601Timestamp(randomDate()),
    type: 'file',
    raw: blob,
    metadata,
    title: metadata.filename,
  }
}

/**
 * Generate a random item of any type
 */
export function generateRandomItem(options?: {
  textSizeInKB?: number
  fileSizeInMB?: number
}): RawItem {
  const type = randomElement(['text', 'url', 'image', 'file'] as const)

  switch (type) {
    case 'text':
      return generateTextItem(options?.textSizeInKB)
    case 'url':
      return generateUrlItem()
    case 'image':
      return generateImageItem(options?.fileSizeInMB)
    case 'file':
      return generateFileItem(options?.fileSizeInMB)
    default:
      return generateTextItem()
  }
}

/**
 * Generate multiple items
 */
export function generateItems(
  count: number,
  options?: {
    type?: 'text' | 'url' | 'image' | 'file'
    textSizeInKB?: number
    fileSizeInMB?: number
  }
): RawItem[] {
  const items: RawItem[] = []

  for (let i = 0; i < count; i++) {
    if (options?.type) {
      switch (options.type) {
        case 'text':
          items.push(generateTextItem(options.textSizeInKB))
          break
        case 'url':
          items.push(generateUrlItem())
          break
        case 'image':
          items.push(generateImageItem(options.fileSizeInMB))
          break
        case 'file':
          items.push(generateFileItem(options.fileSizeInMB))
          break
      }
    } else {
      items.push(generateRandomItem(options))
    }
  }

  return items
}

/**
 * Generate items with mixed file sizes
 */
export function generateMixedDataset(options: {
  itemCount: number
  fileSizeInMB: number
  textSizeInKB: number
  largeItemRatio?: number // 0-1, percentage of large items
}): RawItem[] {
  const {
    itemCount,
    fileSizeInMB,
    textSizeInKB,
    largeItemRatio = 0.2,
  } = options
  const items: RawItem[] = []

  for (let i = 0; i < itemCount; i++) {
    const isLarge = Math.random() < largeItemRatio

    if (isLarge) {
      // Large item (file or text with large content)
      if (Math.random() < 0.5) {
        items.push(generateFileItem(fileSizeInMB))
      } else {
        items.push(generateTextItem(textSizeInKB))
      }
    } else {
      // Regular random item
      items.push(generateRandomItem())
    }
  }

  return items
}

/**
 * Generate multiple files for bulk testing
 */
export function generateFiles(
  count: number,
  sizeInMB: number
): Array<{ blob: Blob; filename: string; mimetype: string }> {
  return Array.from({ length: count }, (_, i) => {
    const extension = randomElement(fileExtensions)
    return {
      blob: generateSimulatedFile(sizeInMB),
      filename: `test_file_${i + 1}.${extension}`,
      mimetype: mimeTypes[extension] || 'application/octet-stream',
    }
  })
}
