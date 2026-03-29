import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Define __DEV__ global for React and other libraries
;(globalThis as unknown as { __DEV__: boolean }).__DEV__ = true

// Cleanup after each test to prevent state leakage
afterEach(() => {
  cleanup()
})

// Global mocks for browser APIs not available in jsdom
beforeAll(() => {
  // Mock matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver for scroll/lazy loading tests
  class MockIntersectionObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  })

  // Mock ResizeObserver for responsive component tests
  class MockResizeObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  })

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: { ...localStorageMock },
  })

  // Mock scrollTo
  window.scrollTo = vi.fn()

  // Mock scrollIntoView on Element prototype
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    writable: true,
    configurable: true,
    value: vi.fn(),
  })

  // Mock ClipboardEvent for paste tests
  class MockClipboardEvent extends Event {
    clipboardData: DataTransfer | null

    constructor(type: string, eventInitDict?: ClipboardEventInit) {
      super(type, eventInitDict)
      this.clipboardData = eventInitDict?.clipboardData ?? null
    }
  }

  Object.defineProperty(window, 'ClipboardEvent', {
    writable: true,
    configurable: true,
    value: MockClipboardEvent,
  })

  // Mock DataTransferItemList for paste tests
  class MockDataTransferItemList extends Array<DataTransferItem> {
    constructor(...items: DataTransferItem[]) {
      super(...items)
    }
  }

  Object.defineProperty(window, 'DataTransferItemList', {
    writable: true,
    configurable: true,
    value: MockDataTransferItemList,
  })

  // Mock console methods to reduce noise during tests
  // but still allow errors to show
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.error = (...args: unknown[]) => {
    // Filter out specific React/Testing Library warnings if needed
    const message = args[0]?.toString() || ''
    if (
      message.includes('act') ||
      message.includes('ReactDOM.render') ||
      message.includes('React.createElement')
    ) {
      return
    }
    originalConsoleError.apply(console, args)
  }

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || ''
    if (message.includes('act')) {
      return
    }
    originalConsoleWarn.apply(console, args)
  }
})
