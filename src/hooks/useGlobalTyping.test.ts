import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGlobalTyping } from './useGlobalTyping'

describe('useGlobalTyping', () => {
  const mockOnDraftCreate = vi.fn()
  const mockOnDraftAppend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body classes
    document.body.className = ''
  })

  afterEach(() => {
    // Clean up any event listeners
    document.body.innerHTML = ''
  })

  describe('draft creation', () => {
    it('creates draft when typing alphanumeric character', async () => {
      const { result } = renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      // Simulate typing 'a'
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).toHaveBeenCalledWith('a')
      expect(result.current.hasDraft).toBe(true)
      expect(result.current.draftItem).toMatchObject({
        id: 'draft',
        type: 'text',
        content: 'a',
      })
    })

    it('creates draft when typing numbers', async () => {
      const { result } = renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: '5' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).toHaveBeenCalledWith('5')
      expect(result.current.hasDraft).toBe(true)
    })

    it('does not create draft when typing symbols', async () => {
      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      const symbols = ['-', '=', '@', '#', '$', '%', '^', '&', '*', '(', ')']

      await act(async () => {
        symbols.forEach((symbol) => {
          const event = new KeyboardEvent('keydown', { key: symbol })
          window.dispatchEvent(event)
        })
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()
    })

    it('does not create draft when input is focused', async () => {
      // Create and focus an input element BEFORE rendering hook
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      // Verify element is actually focused
      expect(document.activeElement).toBe(input)

      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('does not create draft when textarea is focused', async () => {
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      expect(document.activeElement).toBe(textarea)

      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })

    it.skip('does not create draft when contenteditable is focused', async () => {
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.tabIndex = 0
      document.body.appendChild(div)
      div.focus()

      expect(document.activeElement).toBe(div)

      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()

      document.body.removeChild(div)
    })

    it('does not create draft when drag overlay is active', async () => {
      document.body.classList.add('drag-overlay-active')

      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()
    })

    it('does not create draft when disabled', async () => {
      renderHook(() =>
        useGlobalTyping({
          disabled: true,
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
        })
      )

      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftCreate).not.toHaveBeenCalled()
    })
  })

  describe('draft appending', () => {
    it('appends to existing draft when typing continues', async () => {
      const { result } = renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
          onDraftAppend: mockOnDraftAppend,
          hasDraft: true,
        })
      )

      // Type 'b' while draft exists
      await act(async () => {
        const event = new KeyboardEvent('keydown', { key: 'b' })
        window.dispatchEvent(event)
      })

      expect(mockOnDraftAppend).toHaveBeenCalledWith('b')
      expect(mockOnDraftCreate).not.toHaveBeenCalled()
      expect(result.current.hasDraft).toBe(true)
    })
  })

  describe('draft management', () => {
    it('allows manual draft creation via createDraft', () => {
      const { result } = renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
        })
      )

      act(() => {
        result.current.createDraft('Hello')
      })

      expect(result.current.draftItem).toMatchObject({
        id: 'draft',
        content: 'Hello',
      })
      expect(result.current.hasDraft).toBe(true)
    })

    it('allows draft update via updateDraft', () => {
      const { result } = renderHook(() => useGlobalTyping({}))

      act(() => {
        result.current.createDraft('Hello')
      })

      act(() => {
        result.current.updateDraft('Hello World')
      })

      expect(result.current.draftItem?.content).toBe('Hello World')
    })

    it('clears draft on submitDraft', () => {
      const { result } = renderHook(() => useGlobalTyping({}))

      act(() => {
        result.current.createDraft('Test')
      })

      expect(result.current.hasDraft).toBe(true)

      act(() => {
        result.current.submitDraft()
      })

      expect(result.current.draftItem).toBeNull()
      expect(result.current.hasDraft).toBe(false)
    })

    it('clears draft on cancelDraft', () => {
      const { result } = renderHook(() => useGlobalTyping({}))

      act(() => {
        result.current.createDraft('Test')
      })

      expect(result.current.hasDraft).toBe(true)

      act(() => {
        result.current.cancelDraft()
      })

      expect(result.current.draftItem).toBeNull()
      expect(result.current.hasDraft).toBe(false)
    })
  })

  describe('event prevention', () => {
    it('prevents default on captured keystrokes', async () => {
      renderHook(() =>
        useGlobalTyping({
          onDraftCreate: mockOnDraftCreate,
        })
      )

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

      const { unmount } = renderHook(() => useGlobalTyping({}))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })
  })
})
