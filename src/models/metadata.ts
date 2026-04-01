export type FileSubType = 'pdf' | 'docx' | 'txt' | 'md' | 'zip' | 'other'

export interface FileMetadata {
  kind: FileSubType
  filename: string
  filesize: number
  mimetype: string
}

export interface TextMetadata {
  kind: 'plain' | 'markdown' | 'code'
  wordCount?: number
}

export interface UrlMetadata {
  kind: 'url'
  title?: string
  favicon?: string
}

export interface ImageMetadata {
  kind: 'image'
  width?: number
  height?: number
  alt?: string
}

export type Metadata = FileMetadata | TextMetadata | UrlMetadata | ImageMetadata

export type ItemType = 'text' | 'url' | 'image' | 'file'

const VALID_ITEM_TYPES: ItemType[] = ['text', 'url', 'image', 'file']

export function getItemType(item: { type: string }): ItemType | null {
  return VALID_ITEM_TYPES.includes(item.type as ItemType)
    ? (item.type as ItemType)
    : null
}

export const isTextItem = (item: { type: string }): item is { type: 'text' } =>
  getItemType(item) === 'text'

export const isUrlItem = (item: { type: string }): item is { type: 'url' } =>
  getItemType(item) === 'url'

export const isImageItem = (item: {
  type: string
}): item is { type: 'image' } => getItemType(item) === 'image'

export const isFileItem = (item: { type: string }): item is { type: 'file' } =>
  getItemType(item) === 'file'
