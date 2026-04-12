import { useMemo, useEffect, useState, useCallback } from 'react'
import type { RawItem } from '@/models/rawItem'
import type { ImageMetadata } from '@/models/metadata'
import {
  isTextItem,
  isUrlItem,
  isImageItem,
  isFileItem,
} from '@/models/metadata'
import { Timestamp } from '@/components/Timestamp'
import { TextBlock } from '@/components/TextBlock/TextBlock'
import { TextBlockEdit } from '@/components/TextBlock/TextBlockEdit'
import { UrlBlock } from '@/components/UrlBlock/UrlBlock'
import { UrlBlockEdit } from '@/components/UrlBlock/UrlBlockEdit'
import { ImageBlock } from '@/components/ImageBlock/ImageBlock'
import { FileBlock } from '@/components/FileBlock/FileBlock'
import { BlockActionMenu } from './BlockActionMenu/BlockActionMenu'
import { DeleteButton } from './BlockActionMenu/DeleteButton'
import { EditButton } from './BlockActionMenu/EditButton'
import { BlockIcon } from './BlockIcon'
import { BlockTitle } from './BlockTitle'

export interface BlockProps {
  item: RawItem
  /** Callback when block should be deleted */
  onDelete: (id: string) => void
  /** Callback when block should be updated */
  onUpdate?: (id: string, updates: Partial<RawItem>) => Promise<void>
}

// Component for rendering image blocks with proper blob URL cleanup
function ImageBlockContent({ item }: { item: RawItem }) {
  const blob = item.raw as Blob
  const objectUrl = useMemo(() => URL.createObjectURL(blob), [blob])
  const metadata = item.metadata as ImageMetadata

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return (
    <ImageBlock
      src={objectUrl}
      alt={metadata.alt}
      width={metadata.width}
      height={metadata.height}
    />
  )
}

// Render the appropriate content based on type
function renderBlockContent(item: RawItem) {
  if (isTextItem(item)) {
    return <TextBlock content={item.raw as string} />
  }
  if (isUrlItem(item)) {
    return <UrlBlock url={item.raw as string} />
  }
  if (isImageItem(item)) {
    return <ImageBlockContent item={item} />
  }
  if (isFileItem(item)) {
    return <FileBlock item={item} />
  }
  return null
}

// Check if a block type is editable
function isEditableBlock(item: RawItem): boolean {
  return isTextItem(item) || isUrlItem(item)
}

export function Block({ item, onDelete, onUpdate }: BlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')

  const handleDelete = () => {
    onDelete(item.id as string)
  }

  const handleEdit = useCallback(() => {
    setEditContent(item.raw as string)
    setIsEditing(true)
  }, [item.raw])

  const handleSave = useCallback(async () => {
    if (editContent !== item.raw && onUpdate) {
      await onUpdate(item.id as string, { raw: editContent })
    }
    setIsEditing(false)
  }, [editContent, item.id, item.raw, onUpdate])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditContent('')
  }, [])

  // Render edit mode or content based on state
  const renderContent = () => {
    if (isEditing && isTextItem(item)) {
      return (
        <>
          <TextBlockEdit
            initialContent={editContent}
            onChange={setEditContent}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
          <div className="text-hint text-text-faint mt-2">
            Ctrl+Enter to save, Escape to cancel
          </div>
        </>
      )
    }
    if (isEditing && isUrlItem(item)) {
      return (
        <>
          <UrlBlockEdit
            initialUrl={editContent}
            onChange={setEditContent}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
          <div className="text-hint text-text-faint mt-2">
            Ctrl+Enter to save, Escape to cancel
          </div>
        </>
      )
    }
    return renderBlockContent(item)
  }

  return (
    <article
      className="group bg-transparent py-3 px-4 border-b border-border hover:border-border-subtle flex"
      data-testid="block"
    >
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header
          className="flex items-baseline justify-between mb-2"
          data-testid="block-header"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <BlockIcon item={item} />
            <BlockTitle title={item.title} />
          </div>
          <Timestamp value={item.capturedAt} />
        </header>

        {/* Content */}
        <div data-testid="block-content">{renderContent()}</div>
      </div>

      {/* Action Menu */}
      <BlockActionMenu testId="block-action-menu">
        {isEditableBlock(item) && onUpdate && (
          <EditButton onEdit={handleEdit} testId="edit-button" />
        )}
        <DeleteButton onDelete={handleDelete} testId="delete-button" />
      </BlockActionMenu>
    </article>
  )
}
