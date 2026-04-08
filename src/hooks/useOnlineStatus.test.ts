import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOnlineStatus } from './useOnlineStatus'
import * as offlineService from '@/services/offlineService'
import * as toastStore from '@/store/toastStore'

// Mock the offlineService
vi.mock('@/services/offlineService', () => ({
  isOnline: vi.fn(),
  onStatusChange: vi.fn(),
}))

// Mock the toast store
vi.mock('@/store/toastStore', () => ({
  showWarning: vi.fn(),
  showSuccess: vi.fn(),
}))

describe('useOnlineStatus', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>
  let statusCallback: ((isOnline: boolean) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnsubscribe = vi.fn()
    statusCallback = null

    // Setup mock for onStatusChange to capture the callback
    vi.mocked(offlineService.onStatusChange).mockImplementation((callback) => {
      statusCallback = callback
      return mockUnsubscribe as () => void
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial online status from isOnline()', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(true)
  })

  it('should return false when initially offline', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(false)

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(false)
  })

  it('should subscribe to status changes on mount', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    renderHook(() => useOnlineStatus())

    expect(offlineService.onStatusChange).toHaveBeenCalledTimes(1)
    expect(typeof statusCallback).toBe('function')
  })

  it('should unsubscribe on unmount', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    const { unmount } = renderHook(() => useOnlineStatus())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should NOT show toast on initial mount when online', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    renderHook(() => useOnlineStatus())

    expect(toastStore.showWarning).not.toHaveBeenCalled()
    expect(toastStore.showSuccess).not.toHaveBeenCalled()
  })

  it('should NOT show toast on initial mount when offline', () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(false)

    renderHook(() => useOnlineStatus())

    expect(toastStore.showWarning).not.toHaveBeenCalled()
    expect(toastStore.showSuccess).not.toHaveBeenCalled()
  })

  it('should NOT show toast on first status change (priming)', async () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    renderHook(() => useOnlineStatus())

    // First status change - just primes the hook
    statusCallback?.(false)

    await waitFor(() => {
      expect(toastStore.showWarning).not.toHaveBeenCalled()
      expect(toastStore.showSuccess).not.toHaveBeenCalled()
    })
  })

  it('should show warning toast when going offline (after priming)', async () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    renderHook(() => useOnlineStatus())

    // First change - prime the hook (no toast)
    statusCallback?.(true)
    await waitFor(() => {
      expect(toastStore.showWarning).not.toHaveBeenCalled()
    })

    // Second change - going offline (should show toast)
    statusCallback?.(false)

    await waitFor(() => {
      expect(toastStore.showWarning).toHaveBeenCalledWith("You're offline")
    })
    expect(toastStore.showSuccess).not.toHaveBeenCalled()
  })

  it('should show success toast when coming back online (after priming)', async () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(false)

    renderHook(() => useOnlineStatus())

    // First change - prime the hook (no toast)
    statusCallback?.(false)
    await waitFor(() => {
      expect(toastStore.showSuccess).not.toHaveBeenCalled()
    })

    // Second change - coming online (should show toast)
    statusCallback?.(true)

    await waitFor(() => {
      expect(toastStore.showSuccess).toHaveBeenCalledWith('Back online')
    })
    expect(toastStore.showWarning).not.toHaveBeenCalled()
  })

  it('should update isOnline when status changes', async () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(true)

    // Go offline
    statusCallback?.(false)
    await waitFor(() => {
      expect(result.current.isOnline).toBe(false)
    })

    // Come back online
    statusCallback?.(true)
    await waitFor(() => {
      expect(result.current.isOnline).toBe(true)
    })
  })

  it('should handle multiple status changes with toasts', async () => {
    vi.mocked(offlineService.isOnline).mockReturnValue(true)

    renderHook(() => useOnlineStatus())

    // First change - prime (no toast)
    statusCallback?.(true)
    await waitFor(() => expect(toastStore.showWarning).not.toHaveBeenCalled())

    // Second change - offline (toast)
    statusCallback?.(false)
    await waitFor(() => expect(toastStore.showWarning).toHaveBeenCalledTimes(1))

    // Third change - online (toast)
    statusCallback?.(true)
    await waitFor(() => expect(toastStore.showSuccess).toHaveBeenCalledTimes(1))

    // Fourth change - offline (toast)
    statusCallback?.(false)
    await waitFor(() => expect(toastStore.showWarning).toHaveBeenCalledTimes(2))

    // Fifth change - online (toast)
    statusCallback?.(true)
    await waitFor(() => expect(toastStore.showSuccess).toHaveBeenCalledTimes(2))
  })
})
