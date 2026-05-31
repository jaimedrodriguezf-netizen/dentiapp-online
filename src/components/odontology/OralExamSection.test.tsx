import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OralHygieneFields, FluorosisField, MalocclusionFields, StomatognathicFields, IndiceField } from './OralExamSection'

describe('OralHygieneFields', () => {
  it('renders hygiene select and plaque index', () => {
    render(<OralHygieneFields />)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Índice de O'Leary:/)).toBeInTheDocument()
  })

  it('calculates O\'Leary index automatically in real-time', () => {
    render(<OralHygieneFields />)
    
    const piezasInput = screen.getByLabelText('Piezas presentes')
    const superficiesInput = screen.getByLabelText('Total superficies')
    const placaInput = screen.getByLabelText('Superficies con placa')

    // Cambiar piezas presentes a 28
    fireEvent.change(piezasInput, { target: { value: '28' } })
    // Debería sugerir automáticamente 28 * 4 = 112 superficies
    expect((superficiesInput as HTMLInputElement).value).toBe('112')

    // Cambiar superficies con placa a 14
    fireEvent.change(placaInput, { target: { value: '14' } })

    // Fórmula: (14 * 100) / 112 = 12.5%
    expect(screen.getByText("Índice de O'Leary: 12.5%")).toBeInTheDocument()

    // Editar manualmente el total de superficies a 100
    fireEvent.change(superficiesInput, { target: { value: '100' } })
    // Fórmula: (14 * 100) / 100 = 14.0%
    expect(screen.getByText("Índice de O'Leary: 14.0%")).toBeInTheDocument()
  })

  it('interacts with O\'Leary visual diagram, updates inputs and index', () => {
    render(<OralHygieneFields />)

    const piezasInput = screen.getByLabelText('Piezas presentes') as HTMLInputElement
    const superficiesInput = screen.getByLabelText('Total superficies') as HTMLInputElement
    const placaInput = screen.getByLabelText('Superficies con placa') as HTMLInputElement

    // Por defecto, renderiza 32 piezas y 128 superficies (32 * 4) con 0 con placa
    expect(piezasInput.value).toBe('32')
    expect(superficiesInput.value).toBe('128')
    expect(placaInput.value).toBe('0')
    expect(screen.getByText("Índice de O'Leary: 0.0%")).toBeInTheDocument()

    // 1. Simular clic en la cara Vestibular (V) del diente 11
    const tooth11_V = screen.getByTestId('tooth-11-surface-V')
    fireEvent.click(tooth11_V)

    // Superficies con placa debería subir a 1
    expect(placaInput.value).toBe('1')
    // (1 * 100) / 128 = 0.78125% -> redondeado a 0.8%
    expect(screen.getByText("Índice de O'Leary: 0.8%")).toBeInTheDocument()

    // 2. Simular clic en la cara Mesial (M) del diente 11
    const tooth11_M = screen.getByTestId('tooth-11-surface-M')
    fireEvent.click(tooth11_M)
    expect(placaInput.value).toBe('2')
    // (2 * 100) / 128 = 1.5625% -> redondeado a 1.6%
    expect(screen.getByText("Índice de O'Leary: 1.6%")).toBeInTheDocument()

    // 3. Marcar el diente 18 como ausente
    const toggle18 = screen.getByTestId('tooth-18-toggle-absent')
    fireEvent.click(toggle18)

    // Piezas presentes debería bajar a 31
    expect(piezasInput.value).toBe('31')
    // Total superficies evaluadas debería bajar a 31 * 4 = 124
    expect(superficiesInput.value).toBe('124')
    // (2 * 100) / 124 = 1.6129% -> redondeado a 1.6%
    expect(screen.getByText("Índice de O'Leary: 1.6%")).toBeInTheDocument()

    // 4. Limpiar el diagrama con el botón reset
    const cleanButton = screen.getByText('Limpiar')
    fireEvent.click(cleanButton)
    expect(piezasInput.value).toBe('32')
    expect(superficiesInput.value).toBe('128')
    expect(placaInput.value).toBe('0')
  })
})

describe('FluorosisField', () => {
  it('renders Dean index select', () => {
    render(<FluorosisField />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Muy leve')).toBeInTheDocument()
    expect(screen.getByText('Severa')).toBeInTheDocument()
  })
})

describe('MalocclusionFields', () => {
  it('renders class select and overjet/overbite inputs', () => {
    render(<MalocclusionFields />)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})

describe('StomatognathicFields', () => {
  it('renders all 13 region labels', () => {
    render(<StomatognathicFields />)
    expect(screen.getByText('1. LABIOS')).toBeInTheDocument()
    expect(screen.getByText('11. A.T.M.')).toBeInTheDocument()
    expect(screen.getByText('5. LENGUA')).toBeInTheDocument()
    expect(screen.getByText('13. OTROS')).toBeInTheDocument()
  })

  it('renders text inputs for each region', () => {
    render(<StomatognathicFields />)
    const inputs = screen.getAllByPlaceholderText("Describir patología o 'S.P.A.'")
    expect(inputs).toHaveLength(13)
  })

  it('populates from defaultValue.regions', () => {
    render(
      <StomatognathicFields
        defaultValue={{
          regions: [{ id: 'labios', finding: 'Lesión visible' }],
        }}
      />,
    )
    const labiosInput = screen.getAllByPlaceholderText("Describir patología o 'S.P.A.'")[0]
    expect((labiosInput as HTMLInputElement).value).toBe('Lesión visible')
  })
})

describe('IndiceField', () => {
  it('renders CPO-D inputs', () => {
    render(<IndiceField prefix="cpod" />)
    expect(screen.getByText('Cariados (C)')).toBeInTheDocument()
    expect(screen.getByText('Perdidos (P)')).toBeInTheDocument()
    expect(screen.getByText('Obturados (O)')).toBeInTheDocument()
  })

  it('renders CEO-D inputs with Extraction label', () => {
    render(<IndiceField prefix="ceod" />)
    expect(screen.getByText('Extracción (E)')).toBeInTheDocument()
  })

  it('sums C + P + O automatically in real-time', () => {
    render(<IndiceField prefix="cpod" />)
    
    const cariesInput = screen.getByLabelText('Cariados (C)')
    const missingInput = screen.getByLabelText('Perdidos (P)')
    const filledInput = screen.getByLabelText('Obturados (O)')

    // Inicialmente, el total es 0
    expect(screen.getByText('Total CPOD:')).toBeInTheDocument()

    // Cambiar valores
    fireEvent.change(cariesInput, { target: { value: '3' } })
    fireEvent.change(missingInput, { target: { value: '2' } })
    fireEvent.change(filledInput, { target: { value: '4' } })

    // Total = 3 + 2 + 4 = 9
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
