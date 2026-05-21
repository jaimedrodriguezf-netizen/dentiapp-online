import { describe, it, expect } from 'vitest'
import {
  formatVitalSigns,
  formatClinicalExam,
  formatIndex,
  esc,
  generatePrescriptionHTML,
} from './printHelpers'

/* ─── Tests ─── */

describe('formatVitalSigns', () => {
  it('returns empty array for null input', () => {
    expect(formatVitalSigns(null)).toEqual([])
  })

  it('formats all vital signs', () => {
    const vs = { blood_pressure: '120/80', heart_rate: 72, temperature: 36.5, bmi: 24.2 }
    const result = formatVitalSigns(vs)
    expect(result).toContain('TA: 120/80 mmHg')
    expect(result).toContain('FC: 72 lpm')
    expect(result).toContain('Temp: 36.5 °C')
    expect(result).toContain('IMC: 24.2')
  })
})

describe('formatClinicalExam', () => {
  it('formats stomatognathic exam', () => {
    const result = formatClinicalExam('labios,atm,lengua', null, null, null)
    expect(result).toContain('Estomatognático: Labios, ATM, Lengua')
  })

  it('formats oral hygiene with plaque index', () => {
    const result = formatClinicalExam(null, { rating: 'buena', plaque_index: 15 }, null, null)
    expect(result[0]).toContain('Higiene oral: Buena')
    expect(result[0]).toContain('Índice de placa: 15%')
  })

  it('formats malocclusion from JSON', () => {
    const result = formatClinicalExam(null, null, null, JSON.stringify({ class: 'clase_ii', overjet: 4, overbite: 3 }))
    expect(result[0]).toContain('Maloclusión: Clase II')
    expect(result[0]).toContain('Overjet: 4mm')
    expect(result[0]).toContain('Overbite: 3mm')
  })

  it('formats fluorosis', () => {
    const result = formatClinicalExam(null, null, 'moderada', null)
    expect(result).toContain('Fluorosis: Moderada')
  })
})

describe('formatIndex', () => {
  it('formats CPO-D', () => {
    const result = formatIndex('CPO-D', { caries: 3, missing: 1, filled: 4, total: 8 })
    expect(result).toBe('CPO-D: C:3 | P:1 | O:4 | Total:8')
  })

  it('formats CEO-D', () => {
    const result = formatIndex('CEO-D', { caries: 2, extraction: 1, filled: 1, total: 4 })
    expect(result).toBe('CEO-D: C:2 | E:1 | O:1 | Total:4')
  })

  it('returns null for null data', () => {
    expect(formatIndex('CPO-D', null)).toBeNull()
  })
})

describe('esc', () => {
  it('escapes special HTML characters', () => {
    expect(esc('John & Doe <developer>')).toBe('John &amp; Doe &lt;developer&gt;')
    expect(esc(null)).toBe('')
    expect(esc(123)).toBe('123')
  })
})

describe('generatePrescriptionHTML', () => {
  it('generates HTML containing patient and prescription data', () => {
    const record = {
      opening_date: '2026-05-21T10:00:00Z',
      patients: {
        first_name: 'Jaime',
        last_name: 'Rodriguez',
        cedula: '1723456789',
      },
    }
    const prescriptions = [
      {
        medication_name: 'Paracetamol 500mg',
        quantity: 10,
        dosage: '1 tableta',
        frequency: 'cada 8 horas',
        duration: '3 dias',
        instructions: 'Tomar despues de las comidas',
      },
    ]

    const html = generatePrescriptionHTML(record, prescriptions)
    
    expect(html).toContain('Jaime')
    expect(html).toContain('Rodriguez')
    expect(html).toContain('1723456789')
    expect(html).toContain('Paracetamol 500mg')
    expect(html).toContain('(Cant: 10)')
    expect(html).toContain('1 tableta — cada 8 horas — 3 dias')
    expect(html).toContain('Tomar despues de las comidas')
    expect(html).toContain('Firma del profesional')
  })

  it('displays fallback message when no prescriptions exist', () => {
    const record = {
      opening_date: '2026-05-21T10:00:00Z',
      patients: {
        first_name: 'Maria',
        last_name: 'Perez',
        cedula: null,
      },
    }
    const html = generatePrescriptionHTML(record, [])
    expect(html).toContain('No hay medicamentos recetados')
    expect(html).toContain('Maria')
    expect(html).toContain('—') // Cedula fallback
  })
})
