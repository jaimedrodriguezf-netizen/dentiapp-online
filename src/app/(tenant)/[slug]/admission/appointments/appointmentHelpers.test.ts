import { describe, it, expect } from 'vitest'

describe('Reschedule Appointment — Time Slots', () => {
  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ]

  it('has 16 time slots', () => {
    expect(TIME_SLOTS).toHaveLength(16)
  })

  it('morning slots are 8:00 to 11:30', () => {
    const morning = TIME_SLOTS.filter(t => t < '12:00')
    expect(morning).toHaveLength(8)
    expect(morning[0]).toBe('08:00')
    expect(morning[7]).toBe('11:30')
  })

  it('afternoon slots are 14:00 to 17:30', () => {
    const afternoon = TIME_SLOTS.filter(t => t >= '14:00')
    expect(afternoon).toHaveLength(8)
    expect(afternoon[0]).toBe('14:00')
    expect(afternoon[7]).toBe('17:30')
  })

  it('all slots are valid time format HH:MM', () => {
    const timeRegex = /^\d{2}:\d{2}$/
    TIME_SLOTS.forEach(slot => {
      expect(slot).toMatch(timeRegex)
    })
  })
})

describe('Reschedule Appointment — Past Time Detection', () => {
  function isPastSlot(time: string, selectedDate: string): boolean {
    const today = new Date().toISOString().split('T')[0]
    if (selectedDate > today) return false
    const now = new Date()
    const [h, m] = time.split(':').map(Number)
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
  }

  it('returns false for future dates', () => {
    const futureDate = '2099-12-31'
    expect(isPastSlot('08:00', futureDate)).toBe(false)
    expect(isPastSlot('23:59', futureDate)).toBe(false)
  })

  it('returns false for future times today', () => {
    const today = new Date().toISOString().split('T')[0]
    const futureTime = `${new Date().getHours() + 2}`.padStart(2, '0') + ':00'
    expect(isPastSlot(futureTime, today)).toBe(false)
  })

  it('returns true for past times today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(isPastSlot('00:00', today)).toBe(true)
  })
})

describe('Weekly Calendar — Day Names', () => {
  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  it('has 7 days starting with Sunday', () => {
    expect(DAY_NAMES).toHaveLength(7)
    expect(DAY_NAMES[0]).toBe('Dom')
    expect(DAY_NAMES[6]).toBe('Sáb')
  })

  it('getWeekStart returns Sunday of the current week', () => {
    function getWeekStart(dateStr: string): Date {
      const d = new Date(dateStr + 'T00:00:00')
      const day = d.getDay()
      const diff = d.getDate() - day
      d.setDate(diff)
      return d
    }

    // Monday 2026-05-18
    const monday = getWeekStart('2026-05-18')
    expect(monday.getDay()).toBe(0) // Sunday
    expect(monday.getDate()).toBe(17)

    // Friday 2026-05-22
    const friday = getWeekStart('2026-05-22')
    expect(friday.getDay()).toBe(0) // Sunday
    expect(friday.getDate()).toBe(17)
  })

  it('generates 7 days from week start', () => {
    function getWeekStart(dateStr: string): Date {
      const d = new Date(dateStr + 'T00:00:00')
      const day = d.getDay()
      d.setDate(d.getDate() - day)
      return d
    }

    const start = getWeekStart('2026-05-18')
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })

    expect(days).toEqual([
      '2026-05-17', // Sun
      '2026-05-18', // Mon
      '2026-05-19', // Tue
      '2026-05-20', // Wed
      '2026-05-21', // Thu
      '2026-05-22', // Fri
      '2026-05-23', // Sat
    ])
  })
})

describe('Weekly Calendar — Navigation', () => {
  function getWeekStart(dateStr: string): Date {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() - d.getDay())
    return d
  }

  it('previous week subtracts 7 days', () => {
    const current = getWeekStart('2026-05-18')
    const prev = new Date(current)
    prev.setDate(prev.getDate() - 7)
    expect(prev.toISOString().split('T')[0]).toBe('2026-05-10')
  })

  it('next week adds 7 days', () => {
    const current = getWeekStart('2026-05-18')
    const next = new Date(current)
    next.setDate(next.getDate() + 7)
    expect(next.toISOString().split('T')[0]).toBe('2026-05-24')
  })
})

describe('WhatsApp Number — Cleaning', () => {
  function cleanWhatsAppNumber(number: string): string {
    return number.replace(/[\s\-\+\(\)]/g, '')
  }

  it('removes spaces, dashes, parentheses, and + sign', () => {
    expect(cleanWhatsAppNumber('+593 99 123 4567')).toBe('593991234567')
    expect(cleanWhatsAppNumber('+593-99-123-4567')).toBe('593991234567')
    expect(cleanWhatsAppNumber('(593) 991234567')).toBe('593991234567')
    expect(cleanWhatsAppNumber('0991234567')).toBe('0991234567')
  })

  it('generates correct WhatsApp URL', () => {
    const clean = '593991234567'
    const message = 'Hola, quiero agendar un turno'
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
    expect(url).toBe('https://wa.me/593991234567?text=Hola%2C%20quiero%20agendar%20un%20turno')
  })
})
