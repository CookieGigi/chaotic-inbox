import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isOnline, onStatusChange } from './offlineService'

describe('offlineService', () => {
  // Store original navigator.onLine
  let originalOnLine: boolean

  beforeEach(() => {
    // Save original value
    originalOnLine = navigator.onLine

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalOnLine,
    })
  })

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })

      expect(isOnline()).toBe(true)
    })

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })

      expect(isOnline()).toBe(false)
    })
  })

  describe('onStatusChange', () => {
    it('should call callback with true when online event fires', () => {
      const callback = vi.fn()

      onStatusChange(callback)

      // Simulate online event
      window.dispatchEvent(new Event('online'))

      expect(callback).toHaveBeenCalledWith(true)
    })

    it('should call callback with false when offline event fires', () => {
      const callback = vi.fn()

      onStatusChange(callback)

      // Simulate offline event
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalledWith(false)
    })

    it('should call callback for multiple events', () => {
      const callback = vi.fn()

      onStatusChange(callback)

      window.dispatchEvent(new Event('offline'))
      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalledTimes(3)
      expect(callback).toHaveBeenNthCalledWith(1, false)
      expect(callback).toHaveBeenNthCalledWith(2, true)
      expect(callback).toHaveBeenNthCalledWith(3, false)
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()

      const unsubscribe = onStatusChange(callback)

      expect(typeof unsubscribe).toBe('function')
    })

    it('should stop calling callback after unsubscribe', () => {
      const callback = vi.fn()

      const unsubscribe = onStatusChange(callback)

      // First event - should be called
      window.dispatchEvent(new Event('online'))
      expect(callback).toHaveBeenCalledTimes(1)

      // Unsubscribe
      unsubscribe()

      // Second event - should NOT be called
      window.dispatchEvent(new Event('offline'))
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should support multiple subscribers', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      onStatusChange(callback1)
      onStatusChange(callback2)

      window.dispatchEvent(new Event('online'))

      expect(callback1).toHaveBeenCalledWith(true)
      expect(callback2).toHaveBeenCalledWith(true)
    })

    it('should allow unsubscribing one callback without affecting others', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const unsubscribe1 = onStatusChange(callback1)
      onStatusChange(callback2)

      // Unsubscribe first
      unsubscribe1()

      window.dispatchEvent(new Event('online'))

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith(true)
    })
  })
})
