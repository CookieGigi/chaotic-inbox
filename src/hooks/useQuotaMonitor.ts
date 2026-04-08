import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getQuotaInfo,
  checkThresholds,
  type QuotaInfo,
} from '@/services/quotaService'
import { showWarning, showError } from '@/store/toastStore'

/**
 * Thresholds for quota alerts
 */
const QUOTA_THRESHOLDS = [80, 90, 95, 99]

/**
 * Check interval in milliseconds (60 seconds)
 */
const CHECK_INTERVAL = 60000

/**
 * Hook return type
 */
interface UseQuotaMonitorReturn {
  /** Current quota information */
  quotaInfo: QuotaInfo | null
  /** Current usage percentage (0-100) or null */
  percent: number | null
  /** Trigger a manual quota check */
  checkNow: () => Promise<void>
}

/**
 * React hook that monitors IndexedDB quota usage and shows toast alerts
 *
 * Features:
 * - Checks quota on mount and every 60 seconds
 * - Shows warning toast at 80% and 90%
 * - Shows error toast at 95% and 99%
 * - Only alerts when CROSSING a threshold (not every check)
 * - Provides manual check function
 *
 * @returns Object with quotaInfo, percent, and checkNow function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { quotaInfo, percent, checkNow } = useQuotaMonitor()
 *   return (
 *     <div>
 *       {percent !== null && <span>Storage: {percent}%</span>}
 *       <button onClick={checkNow}>Check Now</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useQuotaMonitor(): UseQuotaMonitorReturn {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null)
  const [percent, setPercent] = useState<number | null>(null)

  // Track the highest threshold that has been alerted to avoid spam
  const lastAlertedThreshold = useRef<number>(0)

  /**
   * Show appropriate toast for crossed thresholds
   */
  const showThresholdAlerts = useCallback((crossedThresholds: number[]) => {
    // Find the highest crossed threshold
    const highestCrossed = crossedThresholds[crossedThresholds.length - 1]

    // Only alert if we've crossed a new (higher) threshold
    if (highestCrossed > lastAlertedThreshold.current) {
      // Show alert for the highest crossed threshold
      switch (highestCrossed) {
        case 80:
          showWarning('Storage 80% full')
          break
        case 90:
          showWarning('Storage 90% full - consider cleaning up')
          break
        case 95:
          showError('Storage 95% full - clean up now')
          break
        case 99:
          showError('Storage almost full - clean up immediately')
          break
      }

      // Update last alerted threshold
      lastAlertedThreshold.current = highestCrossed
    }
  }, [])

  /**
   * Check quota and show alerts if needed
   */
  const checkQuota = useCallback(async () => {
    const info = await getQuotaInfo()

    if (info) {
      setQuotaInfo(info)
      setPercent(info.percent)

      // Check thresholds and show alerts
      const crossedThresholds = checkThresholds(info.percent, QUOTA_THRESHOLDS)

      if (crossedThresholds.length > 0) {
        showThresholdAlerts(crossedThresholds)
      } else {
        // Reset last alerted threshold if below all thresholds
        // This allows re-alerting if user goes above threshold again
        lastAlertedThreshold.current = 0
      }
    } else {
      setQuotaInfo(null)
      setPercent(null)
    }
  }, [showThresholdAlerts])

  // Check on mount
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState call
    const timeoutId = setTimeout(() => {
      checkQuota()
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [checkQuota])

  // Set up periodic checks
  useEffect(() => {
    const intervalId = setInterval(checkQuota, CHECK_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [checkQuota])

  // Listen for manual trigger events from large file uploads
  useEffect(() => {
    const handleTrigger = (): void => {
      checkQuota()
    }

    window.addEventListener('quotacheck:trigger', handleTrigger)

    return () => {
      window.removeEventListener('quotacheck:trigger', handleTrigger)
    }
  }, [checkQuota])

  return {
    quotaInfo,
    percent,
    checkNow: checkQuota,
  }
}
