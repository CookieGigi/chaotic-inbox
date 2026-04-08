import { db } from '@/storage/local_db'

/**
 * Quota information interface
 */
export interface QuotaInfo {
  /** Used storage in bytes */
  used: number
  /** Total quota in bytes */
  quota: number
  /** Usage percentage (0-100) */
  percent: number
  /** Number of items in database */
  itemCount: number
}

/**
 * Get quota information from browser storage API
 * @returns QuotaInfo object or null if API not supported
 */
export async function getQuotaInfo(): Promise<QuotaInfo | null> {
  try {
    // Check if storage API is supported
    if (!navigator.storage?.estimate) {
      return null
    }

    const estimate = await navigator.storage.estimate()

    // Handle null values
    if (estimate.usage == null || estimate.quota == null) {
      return null
    }

    // Avoid division by zero
    if (estimate.quota === 0) {
      return null
    }

    const used = estimate.usage
    const quota = estimate.quota
    const percent = Math.round((used / quota) * 100)
    const itemCount = await db.items.count()

    return {
      used,
      quota,
      percent,
      itemCount,
    }
  } catch {
    // Return null on any error (e.g., permission denied)
    return null
  }
}

/**
 * Format bytes to human-readable string (MB or GB)
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "120MB" or "1.5GB")
 */
export function formatBytes(bytes: number): string {
  const mb = bytes / 1000000

  if (mb >= 1000) {
    // Convert to GB with 1 decimal
    const gb = mb / 1000
    // Show decimal only if not a whole number
    const formatted = gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)
    return `${formatted}GB`
  }

  // MB - round to whole number
  return `${Math.round(mb)}MB`
}

/**
 * Check which thresholds have been crossed
 * @param percent - Current usage percentage
 * @param thresholds - Array of threshold percentages to check
 * @returns Array of crossed thresholds (sorted)
 */
export function checkThresholds(
  percent: number,
  thresholds: number[]
): number[] {
  return thresholds
    .filter((threshold) => percent >= threshold)
    .sort((a, b) => a - b)
}
