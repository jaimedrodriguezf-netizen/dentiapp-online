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
  it('renders all structure buttons', () => {
    render(<StomatognathicFields />)
    expect(screen.getByText('Labios')).toBeInTheDocument()
    expect(screen.getByText('ATM')).toBeInTheDocument()
    expect(screen.getByText('Lengua')).toBeInTheDocument()
    expect(screen.getByText('Periodontal')).toBeInTheDocument()
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
