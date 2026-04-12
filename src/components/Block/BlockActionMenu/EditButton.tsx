import { Pencil } from '@phosphor-icons/react'

export interface EditButtonProps {
  /**
   * Callback when edit is triggered
   */
  onEdit: () => void
  /**
   * Accessible label for the button
   * @default "Edit block"
   */
  ariaLabel?: string
  /**
   * Test id for testing
   */
  testId?: string
}

/**
 * EditButton component
 *
 * Features:
 * - Edit action styling (accent color on hover)
 * - 16px icon consistent with block header
 * - Accessible with proper ARIA attributes
 * - Focus ring for keyboard navigation
 *
 * Usage:
 * ```tsx
 * <EditButton onEdit={() => setIsEditing(true)} ariaLabel="Edit text block" />
 * ```
 */
export function EditButton({
  onEdit,
  ariaLabel = 'Edit block',
  testId,
}: EditButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onEdit()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      data-testid={testId}
      className="
        w-8 h-8 rounded-lg box-border
        flex items-center justify-center
        text-text-faint
        hover:text-accent hover:bg-surface-hover
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
      "
    >
      <Pencil size={16} />
    </button>
  )
}
