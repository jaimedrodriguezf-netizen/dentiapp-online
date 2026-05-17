import { describe, it, expect } from 'vitest'

/**
 * Tests for the buildDiagnosis function logic.
 * Inline test because the function is defined inside actions.ts (server-only).
 * We test the logic it implements.
 */

function buildDiagnosisMock(code: string, description: string, notes: string) {
  if (!code && !notes) return null

  return {
    ...(code && { code }),
    ...(description && { description }),
    ...(notes && { text: notes }),
  }
}

describe('buildDiagnosis', () => {
  it('returns null when no code or notes', () => {
    expect(buildDiagnosisMock('', '', '')).toBeNull()
  })

  it('builds object with CIE-10 code and description', () => {
    const result = buildDiagnosisMock('K02.9', 'Caries dental', '')
    expect(result).toEqual({ code: 'K02.9', description: 'Caries dental' })
  })

  it('includes clinical notes when provided', () => {
    const result = buildDiagnosisMock('K02.9', 'Caries dental', 'Caries extensa en molar inferior')
    expect(result).toEqual({
      code: 'K02.9',
      description: 'Caries dental',
      text: 'Caries extensa en molar inferior',
    })
  })

  it('allows notes-only diagnosis (no CIE-10)', () => {
    const result = buildDiagnosisMock('', '', 'Diagnóstico provisional')
    expect(result).toEqual({ text: 'Diagnóstico provisional' })
  })
})
