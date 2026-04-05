import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGlobalTyping } from './useGlobalTyping'
import { db } from '@/storage/local_db'
import { useAppStore } from '@/store/appStore'

describe('useGlobalTyping', () => {
  // Store spies
  let createDraftSpy: ReturnType<typeof vi.spyOn>
  let appendToDraftSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    // Clear all mocks first
    vi.clearAllMocks()

    // Clear database and reset store
    await db.items.clear()
    useAppStore.getState().reset()

    // Setup spies on store actions (after reset)
    createDraftSpy = vi.spyOn(useAppStore.getState(), 'createDraft')
    appendToDraftSpy = vi.spyOn(useAppStore.getState(), 'appendToDraft')

    // Reset DOM
    document.body.className = ''
  })

  afterEach(() => {
    // Clean up any event listeners
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('draft creation via store', () => {
    it('calls store.createDraft when typing alphanumeric character', async () => {
      renderHook(() => useGlobalTyping())

      // Simulate typing 'a'
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).toHaveBeenCalledWith('a')
    })

    it('calls store.createDraft when typing numbers', async () => {
      renderHook(() => useGlobalTyping())

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: '5' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).toHaveBeenCalledWith('5')
    })

    it('does not create draft when typing symbols', async () => {
      renderHook(() => useGlobalTyping())

      const symbols = ['-', '=', '@', '#', '$', '%', '^', '&', '*', '(', ')']

      await act(async () => {
        symbols.forEach((symbol) => {
          const event = new KeyboardEvent('keydown', { key: symbol })
          window.dispatchEvent(event)
        })
      })

      expect(createDraftSpy).not.toHaveBeenCalled()
    })

    it('does not create draft when modifier keys are pressed', async () => {
      renderHook(() => useGlobalTyping())

      // Test with Ctrl key (e.g., Ctrl+V)
      await act(async () => {
        const ctrlEvent = new KeyboardEvent('keydown', {
          key: 'v',
          ctrlKey: true,
        })
        window.dispatchEvent(ctrlEvent)
      })

      // Test with Alt key
      await act(async () => {
        const altEvent = new KeyboardEvent('keydown', {
          key: 'a',
          altKey: true,
        })
        window.dispatchEvent(altEvent)
      })

      // Test with Meta key (Cmd on Mac)
      await act(async () => {
        const metaEvent = new KeyboardEvent('keydown', {
          key: 'c',
          metaKey: true,
        })
        window.dispatchEvent(metaEvent)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()
      expect(appendToDraftSpy).not.toHaveBeenCalled()
    })

    it('does not create draft when input is focused', async () => {
      // Create and focus an input element BEFORE rendering hook
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      // Verify element is actually focused
      expect(document.activeElement).toBe(input)

      renderHook(() => useGlobalTyping())

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('does not create draft when textarea is focused', async () => {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      expect(document.activeElement).toBe(textarea)

      renderHook(() => useGlobalTyping())

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it('does not create draft when contenteditable is focused', async () => {
      const div = document.createElement('div')
      div.setAttribute('contenteditable', 'true')
      div.tabIndex = 0
      document.body.appendChild(div)
      div.focus()

      expect(document.activeElement).toBe(div)

      renderHook(() => useGlobalTyping())

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('does not create draft when drag overlay is active', async () => {
      document.body.classList.add('drag-overlay-active')

      renderHook(() => useGlobalTyping())

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()
    })

    it('does not create draft when disabled', async () => {
      renderHook(() => useGlobalTyping({ disabled: true }))

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(createDraftSpy).not.toHaveBeenCalled()
    })
  })

  describe('draft appending via store', () => {
    it('calls store.appendToDraft when typing continues with existing draft', async () => {
      // Create a draft first - this will trigger the spy
      useAppStore.getState().createDraft('H')

      // Clear the spy after creating the draft so we only capture new calls
      createDraftSpy.mockClear()

      renderHook(() => useGlobalTyping())

      // Type 'b' while draft exists
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'b' })
        window.dispatchEvent(event)
      })

      expect(appendToDraftSpy).toHaveBeenCalledWith('b')
      expect(createDraftSpy).not.toHaveBeenCalled()
    })
  })

  describe('draft state from store', () => {
    it('returns draftItem from store', () => {
      const draftItem = {
        id: 'draft' as const,
        type: 'text' as const,
        content: 'Test draft',
        capturedAt: new Date().toISOString(),
      }

      // Set the draft in the store
      useAppStore.setState({ draftItem, draftContent: 'Test draft' })

      const { result } = renderHook(() => useGlobalTyping())

      expect(result.current.draftItem).toEqual(draftItem)
    })

    it('returns hasDraft based on store draftItem', () => {
      // Test when no draft
      const { result: result1 } = renderHook(() => useGlobalTyping())
      expect(result1.current.hasDraft).toBe(false)

      // Test when draft exists - set the store state
      useAppStore.setState({
        draftItem: {
          id: 'draft',
          type: 'text',
          content: 'Test',
          capturedAt: new Date().toISOString(),
        },
        draftContent: 'Test',
      })

      const { result: result2 } = renderHook(() => useGlobalTyping())
      expect(result2.current.hasDraft).toBe(true)
    })
  })

  describe('event prevention', () => {
    it('prevents default on captured keystrokes', async () => {
      renderHook(() => useGlobalTyping())

      const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      await act(async () => {
        window.dispatchEvent(event)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useGlobalTyping())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })
  })
})
