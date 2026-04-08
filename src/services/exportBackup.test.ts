import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportDatabase } from './exportBackup'
import { showError, showSuccess } from '@/store/toastStore'
import * as exportImport from 'dexie-export-import'

// Mock the toast store
vi.mock('@/store/toastStore', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

// Mock dexie-export-import
vi.mock('dexie-export-import', () => ({
  exportDB: vi.fn(),
}))

describe('exportDatabase', () => {
  const mockExportDB = vi.mocked(exportImport.exportDB)
  const mockCreateObjectURL = vi.fn()
  const mockRevokeObjectURL = vi.fn()
  const mockClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL methods
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    })

    // Mock document.createElement for anchor tag
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    }
    vi.spyOn(document, 'createElement').mockReturnValue(
      mockAnchor as unknown as HTMLAnchorElement
    )
    vi.spyOn(document.body, 'appendChild').mockImplementation(
      () => mockAnchor as unknown as Node
    )
    vi.spyOn(document.body, 'removeChild').mockImplementation(
      () => mockAnchor as unknown as Node
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Successful export', () => {
    it('calls exportDB to get database data', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      await exportDatabase()

      expect(mockExportDB).toHaveBeenCalledTimes(1)
    })

    it('creates download URL from blob', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      await exportDatabase()

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
    })

    it('generates filename with timestamp in correct format', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      // Mock date to get predictable filename
      const mockDate = new Date('2026-04-07T15:30:45')
      vi.setSystemTime(mockDate)

      await exportDatabase()

      const mockAnchor = document.createElement('a') as unknown as {
        download: string
      }
      expect(mockAnchor.download).toMatch(
        /chaotic-inbox-backup-\d{4}-\d{2}-\d{2}-\d{6}\.json/
      )
    })

    it('triggers download by clicking anchor', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      await exportDatabase()

      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('cleans up by revoking object URL', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      await exportDatabase()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('shows success toast notification', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      await exportDatabase()

      expect(showSuccess).toHaveBeenCalledWith('settings.backup.success')
    })
  })

  describe('Error handling', () => {
    it('shows error toast when export fails', async () => {
      mockExportDB.mockRejectedValue(new Error('Export failed'))

      await exportDatabase()

      expect(showError).toHaveBeenCalledWith('settings.backup.error')
    })

    it('does not attempt download when backup fails', async () => {
      mockExportDB.mockRejectedValue(new Error('Backup failed'))

      await exportDatabase()

      expect(mockCreateObjectURL).not.toHaveBeenCalled()
      expect(mockClick).not.toHaveBeenCalled()
    })

    it('handles missing exportDB function gracefully', async () => {
      mockExportDB.mockImplementation(() => {
        throw new TypeError('exportDB is not a function')
      })

      await exportDatabase()

      expect(showError).toHaveBeenCalledWith('settings.backup.error')
    })
  })

  describe('Filename format', () => {
    it('formats timestamp as YYYY-MM-DD-HHMMSS', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' })
      mockExportDB.mockResolvedValue(mockBlob)
      mockCreateObjectURL.mockReturnValue('blob:test-url')

      // Mock a specific date: April 7, 2026 at 15:30:45
      const mockDate = new Date('2026-04-07T15:30:45')
      vi.setSystemTime(mockDate)

      await exportDatabase()

      const mockAnchor = document.createElement('a') as unknown as {
        download: string
      }
      expect(mockAnchor.download).toBe(
        'chaotic-inbox-backup-2026-04-07-153045.json'
      )
    })
  })
})
