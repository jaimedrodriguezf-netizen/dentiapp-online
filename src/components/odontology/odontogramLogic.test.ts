import { describe, it, expect } from 'vitest'

const DEFAULT_SURFACES: Record<string, string> = { V: 'healthy', D: 'healthy', M: 'healthy', L: 'healthy', O: 'healthy' }

function isDeciduous(tooth: number): boolean {
  return (tooth >= 51 && tooth <= 55) ||
         (tooth >= 61 && tooth <= 65) ||
         (tooth >= 71 && tooth <= 75) ||
         (tooth >= 81 && tooth <= 85)
}

function getDentition(tooth: number): 'permanent' | 'deciduous' {
  return isDeciduous(tooth) ? 'deciduous' : 'permanent'
}

function getQuadrant(tooth: number): number {
  return Math.floor(tooth / 10)
}

function initSurfaces(): Record<string, string> {
  return { ...DEFAULT_SURFACES }
}

function updateSurface(surfaces: Record<string, string>, surface: string, status: string): Record<string, string> {
  return { ...surfaces, [surface]: status }
}

function getOverallStatus(surfaces: Record<string, string>): string {
  const statuses = Object.values(surfaces)
  const nonHealthy = statuses.filter(s => s !== 'healthy')
  if (nonHealthy.length === 0) return 'healthy'
  if (nonHealthy.length === 1) return nonHealthy[0]
  return 'multiple'
}

/* ─── Tests ─── */

describe('isDeciduous', () => {
  it('returns true for deciduous teeth 51-55', () => {
    for (let t = 51; t <= 55; t++) expect(isDeciduous(t)).toBe(true)
  })

  it('returns true for deciduous teeth 61-65', () => {
    for (let t = 61; t <= 65; t++) expect(isDeciduous(t)).toBe(true)
  })

  it('returns true for deciduous teeth 71-75', () => {
    for (let t = 71; t <= 75; t++) expect(isDeciduous(t)).toBe(true)
  })

  it('returns true for deciduous teeth 81-85', () => {
    for (let t = 81; t <= 85; t++) expect(isDeciduous(t)).toBe(true)
  })

  it('returns false for permanent teeth', () => {
    for (let t = 11; t <= 28; t++) expect(isDeciduous(t)).toBe(false)
    for (let t = 31; t <= 48; t++) expect(isDeciduous(t)).toBe(false)
  })
})

describe('getDentition', () => {
  it('classifies permanent teeth', () => {
    expect(getDentition(18)).toBe('permanent')
    expect(getDentition(36)).toBe('permanent')
  })

  it('classifies deciduous teeth', () => {
    expect(getDentition(55)).toBe('deciduous')
    expect(getDentition(71)).toBe('deciduous')
  })
})

describe('getQuadrant', () => {
  it('returns quadrant 1 for upper right permanent', () => {
    expect(getQuadrant(14)).toBe(1)
  })

  it('returns quadrant 5 for upper right deciduous', () => {
    expect(getQuadrant(53)).toBe(5)
  })
})

describe('Surface management', () => {
  it('initializes all surfaces as healthy', () => {
    const s = initSurfaces()
    expect(Object.values(s).every(v => v === 'healthy')).toBe(true)
    expect(Object.keys(s).length).toBe(5)
  })

  it('updates a single surface', () => {
    const s = updateSurface(initSurfaces(), 'V', 'caries')
    expect(s.V).toBe('caries')
    expect(s.D).toBe('healthy')
  })

  it('calculates overall status as healthy when all healthy', () => {
    expect(getOverallStatus(initSurfaces())).toBe('healthy')
  })

  it('returns the non-healthy status when only one surface affected', () => {
    const s = updateSurface(initSurfaces(), 'O', 'filling')
    expect(getOverallStatus(s)).toBe('filling')
  })

  it('returns multiple when more than one surface affected', () => {
    const s = updateSurface(updateSurface(initSurfaces(), 'V', 'caries'), 'O', 'filling')
    expect(getOverallStatus(s)).toBe('multiple')
  })
})
