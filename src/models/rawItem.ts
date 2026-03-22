import type { ISO8601Timestamp } from '@/types/branded'
import type { UUIDTypes } from 'uuid'
import type {
  FileMetadata,
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
} from './metadata'

interface RawItemBase {
  id: UUIDTypes
  capturedAt: ISO8601Timestamp
  raw: string | Blob
}

export type RawItem =
  | (RawItemBase & { type: 'file'; metadata: FileMetadata })
  | (RawItemBase & { type: 'text'; metadata: TextMetadata })
  | (RawItemBase & { type: 'url'; metadata: UrlMetadata })
  | (RawItemBase & { type: 'image'; metadata: ImageMetadata })
