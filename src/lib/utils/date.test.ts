import { describe, it, expect } from 'vitest'
import { getLocalDateString } from './date'

describe('getLocalDateString', () => {
  it('formats local date as YYYY-MM-DD without UTC day shifts', () => {
    // 2026-04-15 at 23:30 local time (which in UTC-5 would be 2026-04-16 04:30 in toISOString)
    const date = new Date(2026, 3, 15, 23, 30, 0)
    expect(getLocalDateString(date)).toBe('2026-04-15')
  })

  it('pads single-digit month and day with leading zeroes', () => {
    const date = new Date(2026, 0, 5, 10, 0, 0) // Jan 5
    expect(getLocalDateString(date)).toBe('2026-01-05')
  })

  it('defaults to current date when no argument is given', () => {
    const result = getLocalDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
