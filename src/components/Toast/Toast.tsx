import {
  useToastStore,
  type ToastType,
  type ToastAction,
} from '@/store/toastStore'
import {
  WarningIcon,
  XIcon,
  InfoIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  action?: ToastAction
}

/**
 * Get icon component based on toast type
 */
function getToastIcon(type: ToastType) {
  switch (type) {
    case 'error':
      return <WarningIcon size={20} weight="fill" className="text-error" />
    case 'warning':
      return <WarningIcon size={20} weight="fill" className="text-warning" />
    case 'success':
      return (
        <CheckCircleIcon size={20} weight="fill" className="text-success" />
      )
    case 'info':
    default:
      return <InfoIcon size={20} weight="fill" className="text-accent" />
  }
}

/**
 * Get border color class based on toast type
 */
function getBorderColorClass(type: ToastType): string {
  switch (type) {
    case 'error':
      return 'border-error'
    case 'warning':
      return 'border-warning'
    case 'success':
      return 'border-success'
    case 'info':
    default:
      return 'border-accent'
  }
}

/**
 * Individual Toast notification component
 *
 * Features:
 * - Type-based styling (error, warning, info, success)
 * - Dismiss button
 * - Accessible with proper ARIA attributes
 * - Uses design system tokens
 */
export function Toast({ id, message, type, action }: ToastProps) {
  const removeToast = useToastStore((state) => state.removeToast)

  const handleDismiss = () => {
    removeToast(id)
  }

  const handleAction = () => {
    action?.onClick()
    removeToast(id)
  }

  const borderColorClass = getBorderColorClass(type)

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="toast"
      data-toast-type={type}
      data-toast-id={id}
      className={`
        flex items-start gap-3 p-4 min-w-[300px] max-w-[400px]
        bg-surface border-l-4 ${borderColorClass}
        rounded shadow-lg
        animate-in slide-in-from-right fade-in duration-200
      `}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {getToastIcon(type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text leading-relaxed">{message}</p>
      </div>

      {action && (
        <button
          type="button"
          onClick={handleAction}
          className="
            flex-shrink-0
            text-sm font-medium text-accent hover:text-accent-hover
            transition-colors
            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
          "
        >
          {action.label}
        </button>
      )}

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        data-testid="toast-dismiss"
        className="
          flex-shrink-0 p-1 rounded
          text-text-muted hover:text-text
          hover:bg-overlay transition-colors
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
        "
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}
