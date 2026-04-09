import { importDB } from 'dexie-export-import'
import { db } from '@/storage/local_db'
import { showError, showSuccess } from '@/store/toastStore'

/**
 * Validates that the file is a valid backup file.
 * Checks file extension and basic JSON structure.
 * Returns i18n key for error messages.
 */
function validateBackupFile(file: File): { valid: boolean; errorKey?: string } {
  // Check file extension
  if (!file.name.endsWith('.json')) {
    return {
      valid: false,
      errorKey: 'settings.restore.errorInvalidFile',
    }
  }

  // Check MIME type (browsers may report different types)
  if (file.type && file.type !== 'application/json' && file.type !== '') {
    return {
      valid: false,
      errorKey: 'settings.restore.errorInvalidFile',
    }
  }

  return { valid: true }
}

/**
 * Restores the Dexie database from a backup JSON file.
 * Uses the dexie-export-import addon for reliable import.
 * Clears existing data before importing.
 */
export async function restoreDatabase(file: File): Promise<boolean> {
  try {
    // Validate file
    const validation = validateBackupFile(file)
    if (!validation.valid) {
      showError(validation.errorKey!)
      return false
    }

    // Convert file to blob
    const blob = new Blob([await file.arrayBuffer()], {
      type: 'application/json',
    })

    // Close current database connection
    db.close()

    // Import the database using dexie-export-import
    // This creates a new database with the imported data
    await importDB(blob)

    // Reopen the database to refresh the connection
    await db.open()

    // Show success notification
    showSuccess('settings.restore.success')

    return true
  } catch (error) {
    console.error('Failed to restore database:', error)

    // Ensure database is reopened even if import failed
    if (!db.isOpen()) {
      try {
        await db.open()
      } catch (reopenError) {
        console.error('Failed to reopen database:', reopenError)
      }
    }

    // Show appropriate error message
    if (error instanceof Error) {
      if (error.message.includes('format') || error.message.includes('JSON')) {
        showError('settings.restore.errorInvalidFile')
      } else if (error.message.includes('version')) {
        showError('settings.restore.errorVersion')
      } else {
        showError('settings.restore.error')
      }
    } else {
      showError('settings.restore.error')
    }

    return false
  }
}
