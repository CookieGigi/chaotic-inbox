// Testing Library re-exports for convenience
export {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  act,
  cleanup,
} from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'

// Custom test utilities
export {
  renderWithProviders,
  createRenderWithProviders,
  type ProviderConfig,
  type RenderWithProvidersOptions,
} from './renderWithProviders'

// Vitest utilities re-export for convenience
export {
  describe,
  it,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest'
