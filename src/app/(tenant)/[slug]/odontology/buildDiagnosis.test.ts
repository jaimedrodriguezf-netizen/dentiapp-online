import { describe, it, expect } from 'vitest'

/**
 * Tests for the buildDiagnosis function logic.
 * Inline test because the function is defined inside actions.ts (server-only).
 * We test the logic it implements.
 */

function buildDiagnosisMock(
  code: string,
  description: string,
  notes: string,
  type: string,
  tooth: string,
  surfaces: string[]
) {
  if (!code && !notes) return null

  return {
    ...(code && { code }),
    ...(description && { description }),
    ...(notes && { text: notes }),
    ...(type && { type }),
    pieza_dental: tooth ? parseInt(tooth, 10) : null,
    caras_afectadas: surfaces || [],
  }
}

describe('buildDiagnosis', () => {
  it('returns null when no code or notes', () => {
    expect(buildDiagnosisMock('', '', '', '', '', [])).toBeNull()
  })

  it('builds object with CIE-10 code and description', () => {
    const result = buildDiagnosisMock('K02.9', 'Caries dental', '', '', '', [])
    expect(result).toEqual({
      code: 'K02.9',
      description: 'Caries dental',
      pieza_dental: null,
      caras_afectadas: [],
    })
  })

  it('includes clinical notes when provided', () => {
    const result = buildDiagnosisMock('K02.9', 'Caries dental', 'Caries extensa en molar inferior', '', '', [])
    expect(result).toEqual({
      code: 'K02.9',
      description: 'Caries dental',
      text: 'Caries extensa en molar inferior',
      pieza_dental: null,
      caras_afectadas: [],
    })
  })

  it('includes diagnosis type (presuntivo/definitivo)', () => {
    const result = buildDiagnosisMock('K02.9', 'Caries dental', '', 'definitivo', '', [])
    expect(result).toEqual({
      code: 'K02.9',
      description: 'Caries dental',
      type: 'definitivo',
      pieza_dental: null,
      caras_afectadas: [],
    })
  })

  it('allows notes-only diagnosis (no CIE-10)', () => {
    const result = buildDiagnosisMock('', '', 'Diagnóstico provisional', '', '', [])
    expect(result).toEqual({
      text: 'Diagnóstico provisional',
      pieza_dental: null,
      caras_afectadas: [],
    })
  })

  it('includes type with notes-only diagnosis', () => {
    const result = buildDiagnosisMock('', '', 'Diagnóstico provisional', 'presuntivo', '', [])
    expect(result).toEqual({
      text: 'Diagnóstico provisional',
      type: 'presuntivo',
      pieza_dental: null,
      caras_afectadas: [],
    })
  })

  it('includes FDI tooth number when provided', () => {
    const result = buildDiagnosisMock('K02.1', 'Caries de la dentina', 'Afecta pulpa', 'definitivo', '46', [])
    expect(result).toEqual({
      code: 'K02.1',
      description: 'Caries de la dentina',
      text: 'Afecta pulpa',
      type: 'definitivo',
      pieza_dental: 46,
      caras_afectadas: [],
    })
  })

  it('includes affected surfaces array when provided', () => {
    const result = buildDiagnosisMock('K02.1', 'Caries de la dentina', '', 'definitivo', '14', ['M', 'D', 'O/I'])
    expect(result).toEqual({
      code: 'K02.1',
      description: 'Caries de la dentina',
      type: 'definitivo',
      pieza_dental: 14,
      caras_afectadas: ['M', 'D', 'O/I'],
    })
  })
})
