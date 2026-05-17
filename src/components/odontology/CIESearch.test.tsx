import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CIESearch from './CIESearch'

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        or: () => ({
          limit: () => ({
            order: () => Promise.resolve({
              data: [
                { code: 'K02.0', description: 'Caries limitada al esmalte' },
                { code: 'K02.1', description: 'Caries de la dentina' },
                { code: 'K02.9', description: 'Caries dental, no especificada' },
              ],
            }),
          }),
        }),
      }),
    }),
  }),
}))

describe('CIESearch', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders search input', () => {
    render(<CIESearch onSelect={mockOnSelect} />)

    expect(screen.getByPlaceholderText(/buscá un diagnóstico/i)).toBeInTheDocument()
  })

  it('shows default code as chip when provided', () => {
    render(
      <CIESearch defaultCode="K02.9" defaultDescription="Caries dental" onSelect={mockOnSelect} />
    )

    expect(screen.getByText('K02.9')).toBeInTheDocument()
    expect(screen.getByText('Caries dental')).toBeInTheDocument()
  })

  it('renders hidden inputs when selected', () => {
    render(
      <CIESearch defaultCode="K02.9" defaultDescription="Caries dental" onSelect={mockOnSelect} />
    )

    const codeInput = document.querySelector('input[name="diagnosis_code"]') as HTMLInputElement
    const descInput = document.querySelector('input[name="diagnosis_description"]') as HTMLInputElement

    expect(codeInput?.value).toBe('K02.9')
    expect(descInput?.value).toBe('Caries dental')
  })
})
