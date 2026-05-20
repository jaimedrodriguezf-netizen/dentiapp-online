import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComplementaryExams from './ComplementaryExams'

describe('ComplementaryExams', () => {
  it('renderiza el título "Exámenes complementarios"', () => {
    render(<ComplementaryExams />)
    expect(screen.getByText('Exámenes complementarios')).toBeInTheDocument()
  })

  it('renderiza los 4 textareas con sus labels', () => {
    render(<ComplementaryExams />)
    expect(screen.getByText('Biometría hemática')).toBeInTheDocument()
    expect(screen.getByText('Química sanguínea')).toBeInTheDocument()
    expect(screen.getByText('Rayos X')).toBeInTheDocument()
    expect(screen.getByText('Otros exámenes')).toBeInTheDocument()
    const textareas = screen.getAllByRole('textbox')
    expect(textareas).toHaveLength(4)
  })

  it('tiene un input oculto con name "complementary_exams"', () => {
    render(<ComplementaryExams />)
    const hidden = document.querySelector('input[name="complementary_exams"]')
    expect(hidden).toBeInTheDocument()
  })

  it('popula los textareas con los valores de defaults', () => {
    render(
      <ComplementaryExams
        defaults={{
          hematology: 'Hb: 14.2 g/dL',
          blood_chemistry: 'Glucosa: 90 mg/dL',
          xray: 'Sin hallazgos',
          other: 'Ninguno',
        }}
      />,
    )
    const textareas = screen.getAllByRole('textbox')
    expect((textareas[0] as HTMLTextAreaElement).value).toBe('Hb: 14.2 g/dL')
    expect((textareas[1] as HTMLTextAreaElement).value).toBe('Glucosa: 90 mg/dL')
    expect((textareas[2] as HTMLTextAreaElement).value).toBe('Sin hallazgos')
    expect((textareas[3] as HTMLTextAreaElement).value).toBe('Ninguno')
  })
})
