import { describe, it, expect } from 'vitest'

/* ─── Helper functions (same logic as will go in actions.ts) ─── */

function buildVitalSigns(bp: string, hr: string, rr: string, temp: string, spo2: string, weight: string, height: string) {
  const hasAny = bp || hr || rr || temp || spo2 || weight || height
  if (!hasAny) return null

  const bmi = (weight && height)
    ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)
    : undefined

  return {
    ...(bp && { blood_pressure: bp }),
    ...(hr && { heart_rate: parseInt(hr) }),
    ...(rr && { respiratory_rate: parseInt(rr) }),
    ...(temp && { temperature: parseFloat(temp) }),
    ...(spo2 && { spo2: parseInt(spo2) }),
    ...(weight && { weight: parseFloat(weight) }),
    ...(height && { height: parseFloat(height) }),
    ...(bmi && { bmi: parseFloat(bmi) }),
  }
}

function buildCPOD(caries: string, missing: string, filled: string) {
  const c = parseInt(caries) || 0
  const m = parseInt(missing) || 0
  const f = parseInt(filled) || 0
  if (!c && !m && !f) return null
  return { caries: c, missing: m, filled: f, total: c + m + f }
}

function buildCEOD(caries: string, extraction: string, filled: string) {
  const c = parseInt(caries) || 0
  const e = parseInt(extraction) || 0
  const f = parseInt(filled) || 0
  if (!c && !e && !f) return null
  return { caries: c, extraction: e, filled: f, total: c + e + f }
}

/* ─── Tests ─── */

describe('buildVitalSigns', () => {
  it('returns null when all fields empty', () => {
    expect(buildVitalSigns('', '', '', '', '', '', '')).toBeNull()
  })

  it('builds structured vital signs object', () => {
    const result = buildVitalSigns('120/80', '72', '16', '36.5', '98', '70', '170')
    expect(result).toEqual({
      blood_pressure: '120/80',
      heart_rate: 72,
      respiratory_rate: 16,
      temperature: 36.5,
      spo2: 98,
      weight: 70,
      height: 170,
      bmi: 24.2,
    })
  })

  it('calculates BMI correctly', () => {
    const r1 = buildVitalSigns('', '', '', '', '', '80', '180')
    expect(r1?.bmi).toBeCloseTo(24.7, 1)

    const r2 = buildVitalSigns('', '', '', '', '', '50', '160')
    expect(r2?.bmi).toBeCloseTo(19.5, 1)
  })

  it('handles partial fields', () => {
    const result = buildVitalSigns('130/90', '', '', '37.0', '', '', '')
    expect(result).toEqual({
      blood_pressure: '130/90',
      temperature: 37.0,
    })
  })
})

describe('buildCPOD', () => {
  it('returns null when all zero', () => {
    expect(buildCPOD('', '', '')).toBeNull()
  })

  it('builds index with total', () => {
    const result = buildCPOD('3', '1', '4')
    expect(result).toEqual({ caries: 3, missing: 1, filled: 4, total: 8 })
  })

  it('handles empty strings as zero', () => {
    const result = buildCPOD('', '2', '')
    expect(result).toEqual({ caries: 0, missing: 2, filled: 0, total: 2 })
  })
})

describe('buildCEOD', () => {
  it('builds deciduous index', () => {
    const result = buildCEOD('2', '0', '1')
    expect(result).toEqual({ caries: 2, extraction: 0, filled: 1, total: 3 })
  })
})
