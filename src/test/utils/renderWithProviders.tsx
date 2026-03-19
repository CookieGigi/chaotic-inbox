import { StrictMode, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ErrorBoundary } from '@components/ErrorBoundary'

interface ProviderConfig {
  errorBoundary?: boolean
  strictMode?: boolean
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  providers?: ProviderConfig
}

/**
 * Renders a React component wrapped with application providers
 * Mirrors the provider setup in main.tsx for consistent testing
 *
 * @example
 * const { getByText } = renderWithProviders(<MyComponent />)
 * const { getByText } = renderWithProviders(<MyComponent />, { providers: { errorBoundary: false } })
 */
export function renderWithProviders(
  ui: ReactNode,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const { providers = {}, ...renderOptions } = options
  const { errorBoundary = true, strictMode = true } = providers

  const Wrapper = ({ children }: { children: ReactNode }) => {
    let wrapped = children

    if (errorBoundary) {
      wrapped = <ErrorBoundary>{wrapped}</ErrorBoundary>
    }

    if (strictMode) {
      wrapped = <StrictMode>{wrapped}</StrictMode>
    }

    return <>{wrapped}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Creates a custom render function with default providers pre-configured
 * Useful for component libraries or when you need multiple tests with same setup
 *
 * @example
 * const customRender = createRenderWithProviders({ providers: { errorBoundary: false } })
 * customRender(<MyComponent />)
 */
export function createRenderWithProviders(
  defaultOptions: RenderWithProvidersOptions = {}
) {
  return (ui: ReactNode, options: RenderWithProvidersOptions = {}) => {
    return renderWithProviders(ui, {
      ...defaultOptions,
      ...options,
      providers: {
        ...defaultOptions.providers,
        ...options.providers,
      },
    })
  }
}

export type { ProviderConfig, RenderWithProvidersOptions }
