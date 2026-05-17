import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VitalSignsSection from './VitalSignsSection'

describe('VitalSignsSection', () => {
  it('renders all vital sign inputs', () => {
    render(<VitalSignsSection />)

    expect(screen.getByLabelText(/TA/)).toBeInTheDocument()
    expect(screen.getByLabelText(/FC/)).toBeInTheDocument()
    expect(screen.getByLabelText(/FR/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Temp/)).toBeInTheDocument()
    expect(screen.getByLabelText(/SpO2/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Peso/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Talla/)).toBeInTheDocument()
  })

  it('shows IMC label', () => {
    render(<VitalSignsSection />)
    expect(screen.getByText(/IMC/)).toBeInTheDocument()
  })
})
