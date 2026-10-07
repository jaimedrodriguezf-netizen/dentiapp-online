import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TenantError from './error'

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'clinica-test' }),
}))

describe('TenantError Error Boundary', () => {
  it('renders error message and retry button', () => {
    const mockReset = vi.fn()
    const error = new Error('Test failure')

    render(<TenantError error={error} reset={mockReset} />)

    expect(screen.getByText('Algo no salió como esperábamos')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /reintentar/i })
    expect(retryBtn).toBeInTheDocument()

    fireEvent.click(retryBtn)
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('renders link to return to dashboard', () => {
    const mockReset = vi.fn()
    const error = new Error('Test failure')

    render(<TenantError error={error} reset={mockReset} />)

    const homeLink = screen.getByRole('link', { name: /volver al inicio/i })
    expect(homeLink).toHaveAttribute('href', '/clinica-test/dashboard')
  })
})
