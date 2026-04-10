import { create } from 'zustand'

/**
 * Toast type for different severity levels
 */
export type ToastType = 'error' | 'warning' | 'info' | 'success'

/**
 * Toast action interface for interactive toasts (e.g., Undo)
 */
export interface ToastAction {
  label: string
  onClick: () => void
}

/**
 * Toast item interface
 */
export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number // Duration in ms, undefined = no auto-dismiss
  action?: ToastAction // Optional action button (e.g., Undo)
}

/**
 * Toast state interface
 */
interface ToastState {
  toasts: Toast[]
}

/**
 * Toast actions interface
 */
interface ToastActions {
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

/**
 * Combined toast store interface
 */
type ToastStore = ToastState & ToastActions

/**
 * Generate unique ID for toast
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Zustand store for toast notifications
 *
 * Features:
 * - Centralized toast state management
 * - Auto-dismiss support via duration
 * - Multiple toast stacking
 * - Type-based styling (error, warning, info, success)
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  /**
   * Add a new toast notification
   * Returns the generated toast ID
   */
  addToast: (toast) => {
    const id = generateId()
    const newToast: Toast = {
      ...toast,
      id,
      // Default 5 seconds for auto-dismiss if not specified
      duration: toast.duration ?? 5000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Set up auto-dismiss if duration is provided
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }

    return id
  },

  /**
   * Remove a toast by ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  /**
   * Clear all toasts
   */
  clearAll: () => {
    set({ toasts: [] })
  },
}))

/**
 * Helper function to show an error toast
 * Convenience wrapper around addToast
 */
export function showError(message: string, duration?: number): string {
  return useToastStore.getState().addToast({
    message,
    type: 'error',
    duration,
  })
}

/**
 * Helper function to show a warning toast
 */
export function showWarning(message: string, duration?: number): string {
  return useToastStore.getState().addToast({
    message,
    type: 'warning',
    duration,
  })
}

/**
 * Helper function to show an info toast
 */
export function showInfo(message: string, duration?: number): string {
  return useToastStore.getState().addToast({
    message,
    type: 'info',
    duration,
  })
}

/**
 * Helper function to show a success toast
 */
export function showSuccess(message: string, duration?: number): string {
  return useToastStore.getState().addToast({
    message,
    type: 'success',
    duration,
  })
}

/**
 * Helper function to show a toast with an undo action
 * Used for reversible actions like delete
 *
 * @param message - The toast message (e.g., "Block deleted")
 * @param onUndo - Callback when undo is clicked
 * @param duration - How long to show the toast (default: 5000ms)
 * @returns The toast ID
 */
export function showUndoable(
  message: string,
  onUndo: () => void,
  duration?: number
): string {
  return useToastStore.getState().addToast({
    message,
    type: 'warning',
    duration,
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  })
}
