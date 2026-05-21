import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PrescriptionManager from './PrescriptionManager'

// Mock VademecumSearch since it might rely on external components
vi.mock('./VademecumSearch', () => {
  return {
    default: ({ defaultValue, onSelect }: { defaultValue: string; onSelect: (id: string, name: string) => void }) => (
      <div>
        <input
          data-testid="vademecum-input"
          defaultValue={defaultValue}
          onChange={(e) => onSelect('med-id-123', e.target.value)}
        />
      </div>
    ),
  }
})

describe('PrescriptionManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('no muestra el botón de imprimir si no hay medicamentos con nombre', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as unknown as Response)
    global.fetch = mockFetch

    render(<PrescriptionManager slug="dentiapp" recordId="rec-123" />)

    // Esperar a que se cargue
    await waitFor(() => {
      expect(screen.queryByText('Cargando receta...')).not.toBeInTheDocument()
    })

    // No debería existir el botón de imprimir receta
    const printButton = screen.queryByRole('link', { name: /Imprimir Receta/i })
    expect(printButton).not.toBeInTheDocument()
  })

  it('muestra el botón de imprimir si hay al menos un medicamento con nombre', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          medication_id: 'med-1',
          medication_name: 'Ibuprofeno',
          dosage: '600mg',
          frequency: 'c/8h',
          duration: '3 días',
          instructions: 'Tomar después de las comidas',
          quantity: 10,
        }
      ]),
    } as unknown as Response)
    global.fetch = mockFetch

    render(<PrescriptionManager slug="dentiapp" recordId="rec-123" />)

    // Esperar a que se cargue
    await waitFor(() => {
      expect(screen.queryByText('Cargando receta...')).not.toBeInTheDocument()
    })

    // Debería existir el botón de imprimir receta apuntando al enlace correcto
    const printButton = screen.getByRole('link', { name: /Imprimir Receta/i })
    expect(printButton).toBeInTheDocument()
    expect(printButton).toHaveAttribute('href', '/dentiapp/odontology/form-033/rec-123/print?type=prescription')
    expect(printButton).toHaveAttribute('target', '_blank')
  })
})
