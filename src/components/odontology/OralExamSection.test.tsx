import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OralHygieneFields, FluorosisField, MalocclusionFields, StomatognathicFields, IndiceField } from './OralExamSection'

describe('OralHygieneFields', () => {
  it('renders hygiene select and plaque index', () => {
    render(<OralHygieneFields />)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByPlaceholderText(/0-100/)).toBeInTheDocument()
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
})
