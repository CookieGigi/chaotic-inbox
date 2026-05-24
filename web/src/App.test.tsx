import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without error', () => {
    render(<App />)
    expect(screen.getByText('Inbox')).toBeInTheDocument()
    expect(screen.getByText('Your personal inbox is ready.')).toBeInTheDocument()
  })
})
