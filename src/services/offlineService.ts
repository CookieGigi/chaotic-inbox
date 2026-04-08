/**
 * Callback type for status change listeners
 */
export type StatusCallback = (isOnline: boolean) => void

/**
 * Check if the browser is currently online
 * Uses navigator.onLine API
 * @returns true if online, false if offline
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Subscribe to online/offline status changes
 * @param callback - Function to call when status changes, receives boolean (true=online)
 * @returns Unsubscribe function to remove the listener
 */
export function onStatusChange(callback: StatusCallback): () => void {
  const handleOnline = (): void => {
    callback(true)
  }

  const handleOffline = (): void => {
    callback(false)
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return unsubscribe function
  return (): void => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
