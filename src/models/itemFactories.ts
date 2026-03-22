import { v4 as uuidv4 } from 'uuid'
import type { RawItem } from './rawItem'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
} from './metadata'

function createBaseItem(): Pick<RawItem, 'id' | 'capturedAt'> {
  return {
    id: uuidv4(),
    capturedAt: new Date().toISOString() as RawItem['capturedAt'],
  }
}

export function createFileItem(
  raw: Blob,
  metadata: FileMetadata
): RawItem & { type: 'file' } {
  return {
    ...createBaseItem(),
    type: 'file',
    raw,
    metadata,
  }
}

export function createTextItem(
  raw: string,
  metadata: TextMetadata
): RawItem & { type: 'text' } {
  return {
    ...createBaseItem(),
    type: 'text',
    raw,
    metadata,
  }
}

export function createUrlItem(
  raw: string,
  metadata: UrlMetadata
): RawItem & { type: 'url' } {
  return {
    ...createBaseItem(),
    type: 'url',
    raw,
    metadata,
  }
}

export function createImageItem(
  raw: Blob,
  metadata: ImageMetadata
): RawItem & { type: 'image' } {
  return {
    ...createBaseItem(),
    type: 'image',
    raw,
    metadata,
  }
}
