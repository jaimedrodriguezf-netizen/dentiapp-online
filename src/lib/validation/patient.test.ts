import { describe, it, expect } from 'vitest'
import { validatePatientInput, validateAppointmentInput } from './patient'

describe('Zero-Trust Patient Input Validation', () => {
  it('validates and trims valid patient data', () => {
    const raw = {
      first_name: '  Carlos  ',
      last_name: '  Mendoza  ',
      email: 'carlos@example.com',
      phone: '0987654321',
      cedula: '1720394857',
      status: 'active',
    }

    const res = validatePatientInput(raw)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.first_name).toBe('Carlos')
      expect(res.data.last_name).toBe('Mendoza')
    }
  })

  it('rejects missing first or last name', () => {
    const res = validatePatientInput({ first_name: '', last_name: 'Mendoza' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toMatch(/nombre/i)
    }
  })

  it('rejects invalid email format', () => {
    const res = validatePatientInput({
      first_name: 'Ana',
      last_name: 'Gomez',
      email: 'correo-invalido',
    })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error).toMatch(/correo/i)
    }
  })

  it('rejects invalid patient status', () => {
    const res = validatePatientInput({
      first_name: 'Ana',
      last_name: 'Gomez',
      status: 'hacked_status',
    })
    expect(res.success).toBe(false)
  })
})

describe('Zero-Trust Appointment Input Validation', () => {
  it('validates correct appointment data', () => {
    const res = validateAppointmentInput({
      patient_id: 'p-123',
      date: '2026-05-15',
      time: '14:30',
      reason: 'Limpieza dental',
    })
    expect(res.success).toBe(true)
  })

  it('rejects invalid date or time formats', () => {
    const res1 = validateAppointmentInput({
      patient_id: 'p-123',
      date: '15/05/2026',
      time: '14:30',
    })
    expect(res1.success).toBe(false)

    const res2 = validateAppointmentInput({
      patient_id: 'p-123',
      date: '2026-05-15',
      time: '2pm',
    })
    expect(res2.success).toBe(false)
  })
})
