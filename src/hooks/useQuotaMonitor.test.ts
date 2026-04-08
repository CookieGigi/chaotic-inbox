import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useQuotaMonitor } from './useQuotaMonitor'
import * as quotaService from '@/services/quotaService'
import * as toastStore from '@/store/toastStore'

// Mock the quotaService
vi.mock('@/services/quotaService', () => ({
  getQuotaInfo: vi.fn(),
  formatBytes: vi.fn((bytes) => `${Math.round(bytes / 1000000)}MB`),
  checkThresholds: vi.fn(),
}))

// Mock the toast store
vi.mock('@/store/toastStore', () => ({
  showWarning: vi.fn(),
  showError: vi.fn(),
}))

describe('useQuotaMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should check quota on mount', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 50000000,
      quota: 250000000,
      percent: 20,
      itemCount: 5,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([])

    renderHook(() => useQuotaMonitor())

    // Wait for initial check
    await waitFor(() => {
      expect(quotaService.getQuotaInfo).toHaveBeenCalledTimes(1)
    })
  })

  it('should return quota info', async () => {
    const mockQuotaInfo = {
      used: 120000000,
      quota: 250000000,
      percent: 48,
      itemCount: 10,
    }
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue(mockQuotaInfo)
    vi.mocked(quotaService.checkThresholds).mockReturnValue([])

    const { result } = renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(result.current.quotaInfo).toEqual(mockQuotaInfo)
    })
    expect(result.current.percent).toBe(48)
  })

  it('should show warning toast at 80% threshold', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 200000000,
      quota: 250000000,
      percent: 80,
      itemCount: 50,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([80])

    renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(toastStore.showWarning).toHaveBeenCalledWith('Storage 80% full')
    })
  })

  it('should show warning toast at 90% threshold', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 225000000,
      quota: 250000000,
      percent: 90,
      itemCount: 60,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([80, 90])

    renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(toastStore.showWarning).toHaveBeenCalledWith(
        'Storage 90% full - consider cleaning up'
      )
    })
  })

  it('should show error toast at 95% threshold', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 237500000,
      quota: 250000000,
      percent: 95,
      itemCount: 70,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([80, 90, 95])

    renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(toastStore.showError).toHaveBeenCalledWith(
        'Storage 95% full - clean up now'
      )
    })
  })

  it('should show error toast at 99% threshold', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 247500000,
      quota: 250000000,
      percent: 99,
      itemCount: 80,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([80, 90, 95, 99])

    renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(toastStore.showError).toHaveBeenCalledWith(
        'Storage almost full - clean up immediately'
      )
    })
  })

  it('should not show toast when below all thresholds', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 50000000,
      quota: 250000000,
      percent: 20,
      itemCount: 10,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([])

    renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(quotaService.getQuotaInfo).toHaveBeenCalled()
    })

    expect(toastStore.showWarning).not.toHaveBeenCalled()
    expect(toastStore.showError).not.toHaveBeenCalled()
  })

  it('should provide checkNow function for manual checks', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 50000000,
      quota: 250000000,
      percent: 20,
      itemCount: 5,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([])

    const { result } = renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(quotaService.getQuotaInfo).toHaveBeenCalledTimes(1)
    })

    // Call checkNow manually
    await act(async () => {
      await result.current.checkNow()
    })

    expect(quotaService.getQuotaInfo).toHaveBeenCalledTimes(2)
  })

  it('should handle when quota API returns null', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue(null)

    const { result } = renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(result.current.quotaInfo).toBeNull()
      expect(result.current.percent).toBeNull()
    })

    expect(toastStore.showWarning).not.toHaveBeenCalled()
    expect(toastStore.showError).not.toHaveBeenCalled()
  })

  it('should clean up interval on unmount', async () => {
    vi.mocked(quotaService.getQuotaInfo).mockResolvedValue({
      used: 50000000,
      quota: 250000000,
      percent: 20,
      itemCount: 5,
    })
    vi.mocked(quotaService.checkThresholds).mockReturnValue([])

    const { unmount } = renderHook(() => useQuotaMonitor())

    await waitFor(() => {
      expect(quotaService.getQuotaInfo).toHaveBeenCalledTimes(1)
    })

    // Unmount should not throw
    expect(() => unmount()).not.toThrow()
  })
})
