import { exportDB } from 'dexie-export-import'
import { db } from '@/storage/local_db'
import { showError, showSuccess } from '@/store/toastStore'

/**
 * Exports the entire Dexie database to a downloadable JSON file.
 * Uses the dexie-export-import addon for reliable export.
 */
export async function exportDatabase(): Promise<void> {
  try {
    // Export the database using dexie-export-import
    const blob = await exportDB(db, {
      prettyJson: true,
    })

    // Generate filename with timestamp (YYYY-MM-DD-HHMMSS format)
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`
    const filename = `chaotic-inbox-backup-${timestamp}.json`

    // Create download link
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename

    // Trigger download
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    // Clean up
    URL.revokeObjectURL(url)

    // Show success notification
    showSuccess('settings.backup.success')
  } catch (error) {
    console.error('Failed to export database:', error)
    showError('settings.backup.error')
  }
}
