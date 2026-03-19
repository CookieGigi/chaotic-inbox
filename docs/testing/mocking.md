# Mocking Strategy Guide

This document outlines the mocking strategies and patterns used in this project for testing with Vitest.

## Table of Contents

1. [Module Mocking](#module-mocking)
2. [API Mocking](#api-mocking)
3. [Asset Mocking](#asset-mocking)
4. [Browser API Mocks](#browser-api-mocks)

---

## Module Mocking

### Basic Module Mock with `vi.mock()`

Use `vi.mock()` to replace an entire module with mocks. This is hoisted to the top of the file.

```typescript
import { vi } from 'vitest'
import { myFunction } from './myModule'

// Mock the entire module
vi.mock('./myModule', () => ({
  myFunction: vi.fn(),
}))

test('uses mocked function', () => {
  myFunction.mockReturnValue('mocked')
  expect(myFunction()).toBe('mocked')
})
```

### Partial Mocks with `vi.importActual()`

When you only want to mock some exports from a module:

```typescript
vi.mock('./myModule', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // Override only specific exports
    myFunction: vi.fn(),
  }
})
```

### Mocking React Components

```typescript
vi.mock('@components/Button', () => ({
  Button: vi.fn(({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  )),
}))
```

### Spy on Module Functions

```typescript
import * as myModule from './myModule'

const spy = vi.spyOn(myModule, 'myFunction')
spy.mockReturnValue('mocked value')
```

---

## API Mocking

### Using MSW (Mock Service Worker)

MSW is the recommended approach for mocking HTTP requests. It intercepts requests at the network level.

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ])
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 3, ...body }, { status: 201 })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('fetches users', async () => {
  const users = await fetchUsers()
  expect(users).toHaveLength(2)
})
```

### Installing MSW

```bash
npm install -D msw
```

---

## Asset Mocking

### CSS Imports

CSS imports are automatically handled by Vite during testing. No additional mocking needed.

### Image/File Imports

Create a mock for static assets:

```typescript
// src/test/__mocks__/fileMock.ts
export default 'test-file-stub'
```

Configure in `vite.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
        './src/test/__mocks__/fileMock.ts',
    },
  },
})
```

---

## Browser API Mocks

Common browser APIs are already mocked in `src/test/setup.ts`. Here's how to use them:

### matchMedia

```typescript
test('responsive component', () => {
  // Mock specific media query
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(min-width: 768px)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  render(<MyComponent />)
  // Test responsive behavior
})
```

### IntersectionObserver

```typescript
test('lazy loaded image', () => {
  const observe = vi.fn()
  const unobserve = vi.fn()

  // Override the mock for a specific test
  window.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe,
    unobserve,
    disconnect: vi.fn(),
  }))

  render(<LazyImage />)
  expect(observe).toHaveBeenCalled()
})
```

### localStorage / sessionStorage

```typescript
test('saves to localStorage', () => {
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

  render(<SettingsForm />)
  fireEvent.click(screen.getByText('Save'))

  expect(setItemSpy).toHaveBeenCalledWith('settings', expect.any(String))
})
```

### scrollTo

```typescript
test('scrolls to top', () => {
  render(<ScrollToTopButton />)
  fireEvent.click(screen.getByText('Scroll to Top'))

  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
})
```

---

## Best Practices

1. **Mock at the right level**: Mock modules, not implementation details
2. **Reset mocks between tests**: Use `afterEach(() => vi.clearAllMocks())`
3. **Prefer explicit mocks**: Be clear about what you're mocking and why
4. **Don't mock what you own**: Test actual implementations of your own code
5. **Use factories for complex mocks**: Create reusable mock factory functions

```typescript
// Mock factory example
export function createMockUser(overrides = {}) {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  }
}
```

---

## Testing Custom Hooks

For testing hooks in isolation, use `@testing-library/react`:

```typescript
import { renderHook } from '@testing-library/react'
import { useCounter } from './useCounter'

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter())

  expect(result.current.count).toBe(0)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)
})
```

---

## Resources

- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
