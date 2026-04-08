import { useState, useEffect, useRef } from 'react'
import { isOnline, onStatusChange } from '@/services/offlineService'
import { showWarning, showSuccess } from '@/store/toastStore'

/**
 * Hook return type
 */
interface UseOnlineStatusReturn {
  /** Current online status */
  isOnline: boolean
}

/**
 * React hook that monitors online/offline status and shows toast notifications
 *
 * Features:
 * - Subscribes to browser online/offline events
 * - Shows warning toast when going offline
 * - Shows success toast when coming back online
 * - Does NOT show toast on initial mount (avoids spam)
 *
 * @returns Object with isOnline boolean
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline } = useOnlineStatus()
 *   return <span>{isOnline ? 'Online' : 'Offline'}</span>
 * }
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  // Initialize with current status
  const [online, setOnline] = useState<boolean>(isOnline())

  // Track if this is the first status change to avoid showing toast on mount
  const hasChanged = useRef(false)

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = onStatusChange((newStatus) => {
      setOnline(newStatus)

      // Show toast only on status changes (not initial mount)
      if (hasChanged.current) {
        if (newStatus) {
          // Came back online
          showSuccess('Back online')
        } else {
          // Went offline
          showWarning("You're offline")
        }
      }

      // Mark that we've seen at least one change
      hasChanged.current = true
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  return {
    isOnline: online,
  }
}
