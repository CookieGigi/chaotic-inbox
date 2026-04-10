import { useToastStore } from '@/store/toastStore'
import { Toast } from './Toast'

/**
 * ToastContainer component
 *
 * Features:
 * - Fixed position at top-right of viewport
 * - Stacks multiple toasts vertically with gap
 * - Z-index above overlay (60)
 * - Accessible live region for screen readers
 */
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Notifications"
      data-testid="toast-container"
      className="
        fixed top-4 right-4 z-[60]
        flex flex-col gap-3
        max-w-[400px]
        pointer-events-none
      "
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            action={toast.action}
          />
        </div>
      ))}
    </section>
  )
}
