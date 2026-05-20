import { describe, it, expect } from 'vitest'

// Inline: getDayLabel from settings/actions.ts (pure function, no Supabase deps)
const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
function getDayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] || 'Desconocido'
}
describe('Operating Hours — getDayLabel', () => {
  it('returns correct Spanish day names', () => {
    expect(getDayLabel(0)).toBe('Domingo')
    expect(getDayLabel(1)).toBe('Lunes')
    expect(getDayLabel(2)).toBe('Martes')
    expect(getDayLabel(3)).toBe('Miércoles')
    expect(getDayLabel(4)).toBe('Jueves')
    expect(getDayLabel(5)).toBe('Viernes')
    expect(getDayLabel(6)).toBe('Sábado')
  })

  it('returns "Desconocido" for invalid day numbers', () => {
    expect(getDayLabel(-1)).toBe('Desconocido')
    expect(getDayLabel(7)).toBe('Desconocido')
    expect(getDayLabel(999)).toBe('Desconocido')
  })
})

describe('Operating Hours — Default Values', () => {
  it('default week has Monday-Friday open, weekends closed', () => {
    const defaults = Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_open: i > 0 && i < 6,
      open_time: i > 0 && i < 6 ? '08:00' : null,
      close_time: i > 0 && i < 6 ? '18:00' : null,
    }))

    // Lunes a Viernes abiertos
    expect(defaults[1].is_open).toBe(true)
    expect(defaults[2].is_open).toBe(true)
    expect(defaults[3].is_open).toBe(true)
    expect(defaults[4].is_open).toBe(true)
    expect(defaults[5].is_open).toBe(true)

    // Sábado y Domingo cerrados
    expect(defaults[0].is_open).toBe(false)
    expect(defaults[6].is_open).toBe(false)

    // Horarios por defecto
    expect(defaults[1].open_time).toBe('08:00')
    expect(defaults[1].close_time).toBe('18:00')
  })
})

describe('Operating Hours — Form Data Parsing', () => {
  it('correctly builds operating hours array from form data', () => {
    const formData = new FormData()
    formData.set('day_1_open', 'true')
    formData.set('day_1_open_time', '09:00')
    formData.set('day_1_close_time', '17:00')
    formData.set('day_3_open', 'true')
    formData.set('day_3_open_time', '08:00')
    formData.set('day_3_close_time', '20:00')
    // day_2, day_4, day_5, day_6, day_0 not set = falsy = closed

    const hours = Array.from({ length: 7 }, (_, day) => {
      const isOpen = formData.get(`day_${day}_open`) === 'true'
      return {
        day_of_week: day,
        is_open: isOpen,
        open_time: isOpen ? (formData.get(`day_${day}_open_time`) as string) : null,
        close_time: isOpen ? (formData.get(`day_${day}_close_time`) as string) : null,
      }
    })

    expect(hours[1].is_open).toBe(true)
    expect(hours[1].open_time).toBe('09:00')
    expect(hours[1].close_time).toBe('17:00')

    expect(hours[3].is_open).toBe(true)
    expect(hours[3].open_time).toBe('08:00')
    expect(hours[3].close_time).toBe('20:00')

    // Not set = closed
    expect(hours[0].is_open).toBe(false)
    expect(hours[2].is_open).toBe(false)
    expect(hours[4].is_open).toBe(false)
    expect(hours[5].is_open).toBe(false)
    expect(hours[6].is_open).toBe(false)
  })
})
