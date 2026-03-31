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

export const isFileItem = (item: { type: string }): item is { type: 'file' } =>
  item.type === 'file'

export const isTextItem = (item: { type: string }): item is { type: 'text' } =>
  item.type === 'text'

export const isUrlItem = (item: { type: string }): item is { type: 'url' } =>
  item.type === 'url'

export const isImageItem = (item: {
  type: string
}): item is { type: 'image' } => item.type === 'image'
