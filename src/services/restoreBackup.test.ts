import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { restoreDatabase } from './restoreBackup'
import { showError, showSuccess } from '@/store/toastStore'
import * as exportImport from 'dexie-export-import'
import { db } from '@/storage/local_db'

// Mock the toast store
vi.mock('@/store/toastStore', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

// Mock dexie-export-import
vi.mock('dexie-export-import', () => ({
  importDB: vi.fn(),
}))

// Mock the database
vi.mock('@/storage/local_db', () => ({
  db: {
    close: vi.fn(),
    open: vi.fn(),
    isOpen: vi.fn(),
  } as unknown as import('dexie').Dexie,
}))

describe('restoreDatabase', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockImportDB = vi.mocked(exportImport.importDB as any)
  const mockShowError = vi.mocked(showError)
  const mockShowSuccess = vi.mocked(showSuccess)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDbClose = vi.mocked(db.close as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDbOpen = vi.mocked(db.open as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDbIsOpen = vi.mocked(db.isOpen as any)

  beforeEach(() => {
    vi.clearAllMocks()
    mockDbIsOpen.mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('File validation', () => {
    it('rejects non-JSON files', async () => {
      const txtFile = new File(['test'], 'backup.txt', { type: 'text/plain' })

      const result = await restoreDatabase(txtFile)

      expect(result).toBe(false)
      expect(mockShowError).toHaveBeenCalledWith(
        'settings.restore.errorInvalidFile'
      )
      expect(mockImportDB).not.toHaveBeenCalled()
    })

    it('accepts JSON files with .json extension', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      const result = await restoreDatabase(jsonFile)

      expect(result).toBe(true)
      expect(mockImportDB).toHaveBeenCalledTimes(1)
    })

    it('accepts JSON files with empty MIME type', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: '',
      })

      const result = await restoreDatabase(jsonFile)

      expect(result).toBe(true)
      expect(mockImportDB).toHaveBeenCalledTimes(1)
    })
  })

  describe('Successful restore', () => {
    it('closes database before import', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockDbClose).toHaveBeenCalledTimes(1)
    })

    it('calls importDB with file blob', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockImportDB).toHaveBeenCalledTimes(1)
      expect(mockImportDB).toHaveBeenCalledWith(expect.any(Blob))
    })

    it('reopens database after successful import', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockDbOpen).toHaveBeenCalledTimes(1)
    })

    it('shows success notification', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockShowSuccess).toHaveBeenCalledWith('settings.restore.success')
    })

    it('returns true on successful restore', async () => {
      mockImportDB.mockResolvedValue(undefined)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      const result = await restoreDatabase(jsonFile)

      expect(result).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('reopens database on import failure', async () => {
      mockImportDB.mockRejectedValue(new Error('Import failed'))
      mockDbIsOpen.mockReturnValue(false)
      mockDbOpen.mockResolvedValue(undefined)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockDbOpen).toHaveBeenCalledTimes(1)
    })

    it('shows generic error on import failure', async () => {
      mockImportDB.mockRejectedValue(new Error('Import failed'))
      mockDbIsOpen.mockReturnValue(true)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockShowError).toHaveBeenCalledWith('settings.restore.error')
    })

    it('shows format error on JSON parse error', async () => {
      mockImportDB.mockRejectedValue(new Error('Invalid JSON format'))
      mockDbIsOpen.mockReturnValue(true)

      const jsonFile = new File(['invalid json'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockShowError).toHaveBeenCalledWith(
        'settings.restore.errorInvalidFile'
      )
    })

    it('shows version error on version mismatch', async () => {
      mockImportDB.mockRejectedValue(new Error('Database version mismatch'))
      mockDbIsOpen.mockReturnValue(true)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      await restoreDatabase(jsonFile)

      expect(mockShowError).toHaveBeenCalledWith(
        'settings.restore.errorVersion'
      )
    })

    it('returns false on failed restore', async () => {
      mockImportDB.mockRejectedValue(new Error('Import failed'))
      mockDbIsOpen.mockReturnValue(true)

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      const result = await restoreDatabase(jsonFile)

      expect(result).toBe(false)
    })

    it('handles reopen failure gracefully', async () => {
      mockImportDB.mockRejectedValue(new Error('Import failed'))
      mockDbIsOpen.mockReturnValue(false)
      mockDbOpen.mockRejectedValue(new Error('Reopen failed'))

      const jsonFile = new File(['{"test": "data"}'], 'backup.json', {
        type: 'application/json',
      })

      // Should not throw
      const result = await restoreDatabase(jsonFile)

      expect(result).toBe(false)
    })
  })
})
