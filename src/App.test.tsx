import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@test/utils'
import App from './App'

describe('App', () => {
  it('renders hello world', () => {
    renderWithProviders(<App />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    const { container } = renderWithProviders(<App />)
    const heading = container.querySelector('h1')

    expect(heading).toHaveClass('text-3xl', 'font-bold', 'underline')
  })

  it('renders without error boundary errors', () => {
    // This test verifies ErrorBoundary integration works
    expect(() => renderWithProviders(<App />)).not.toThrow()
  })
})
