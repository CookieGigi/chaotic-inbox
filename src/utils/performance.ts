/**
 * Performance markers for key application operations
 *
 * These markers use the Performance API to track timing of critical operations.
 * They are only active in development builds.
 */

declare const __DEV__: boolean

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true

/**
 * Mark the start of an operation
 */
export function markStart(operation: string): void {
  if (isDev && typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${operation}-start`)
  }
}

/**
 * Mark the end of an operation and measure duration
 */
export function markEnd(operation: string): void {
  if (isDev && typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${operation}-end`)

    try {
      performance.measure(operation, `${operation}-start`, `${operation}-end`)
      const entries = performance.getEntriesByName(operation)
      const duration = entries[entries.length - 1]?.duration

      if (duration !== undefined) {
        console.log(`[Performance] ${operation}: ${duration.toFixed(2)}ms`)
      }
    } catch {
      // Silently fail if marks don't exist
    }
  }
}

/**
 * Clear all performance marks and measures for a specific operation
 */
export function clearMarks(operation: string): void {
  if (typeof performance !== 'undefined') {
    performance.clearMarks(`${operation}-start`)
    performance.clearMarks(`${operation}-end`)
    performance.clearMeasures(operation)
  }
}

/**
 * Wrap an async function with performance markers
 */
export async function withPerformanceMark<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  markStart(operation)
  try {
    return await fn()
  } finally {
    markEnd(operation)
  }
}

/**
 * Wrap a sync function with performance markers
 */
export function withPerformanceMarkSync<T>(operation: string, fn: () => T): T {
  markStart(operation)
  try {
    return fn()
  } finally {
    markEnd(operation)
  }
}

// Predefined operation names for consistency
export const PerformanceMarkers = {
  // Paste operations
  PASTE_TEXT: 'paste-text',
  PASTE_IMAGE: 'paste-image',
  PASTE_MULTIPLE: 'paste-multiple',

  // Drop operations
  DROP_FILES: 'drop-files',
  DROP_TEXT: 'drop-text',

  // Store operations
  STORE_ADD_ITEMS: 'store-add-items',
  STORE_LOAD_ITEMS: 'store-load-items',
  STORE_DELETE_ITEM: 'store-delete-item',
  STORE_UPDATE_ITEM: 'store-update-item',

  // Database operations
  DB_ADD: 'db-add',
  DB_GET_ALL: 'db-get-all',
  DB_DELETE: 'db-delete',
  DB_UPDATE: 'db-update',
  DB_EXPORT: 'db-export',
  DB_IMPORT: 'db-import',

  // Render operations
  RENDER_FEED: 'render-feed',
  RENDER_ITEM_LIST: 'render-item-list',
  RENDER_ITEM: 'render-item',

  // Filter/Search operations
  FILTER_ITEMS: 'filter-items',
  SORT_ITEMS: 'sort-items',
  SEARCH_ITEMS: 'search-items',

  // Draft operations
  DRAFT_CREATE: 'draft-create',
  DRAFT_APPEND: 'draft-append',
  DRAFT_SUBMIT: 'draft-submit',

  // Import/Export
  EXPORT_DATABASE: 'export-database',
  IMPORT_DATABASE: 'import-database',
} as const

export type PerformanceMarker =
  (typeof PerformanceMarkers)[keyof typeof PerformanceMarkers]
