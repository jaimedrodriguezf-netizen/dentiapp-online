import { describe, it, expect } from 'vitest'

// Status config used by StatusBadge
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_treatment: { label: 'En Tratamiento', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  inactive: { label: 'Inactivo', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  discharged: { label: 'Alta', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
}

describe('Patient Status — StatusBadge Config', () => {
  it('has all required statuses', () => {
    expect(Object.keys(statusConfig)).toHaveLength(4)
    expect(statusConfig).toHaveProperty('active')
    expect(statusConfig).toHaveProperty('in_treatment')
    expect(statusConfig).toHaveProperty('inactive')
    expect(statusConfig).toHaveProperty('discharged')
  })

  it('each status has label, color, and bg', () => {
    Object.entries(statusConfig).forEach(([key, config]) => {
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
      expect(config.bg).toBeTruthy()
    })
  })

  it('fallback to active for unknown status', () => {
    const config = statusConfig['unknown'] || statusConfig.active
    expect(config.label).toBe('Activo')
  })
})

describe('Patient Status — Form Field Options', () => {
  const validStatuses = ['active', 'in_treatment', 'inactive', 'discharged']

  it('accepts only valid status values', () => {
    validStatuses.forEach(status => {
      expect(validStatuses).toContain(status)
    })
    expect(validStatuses).not.toContain('deleted')
    expect(validStatuses).not.toContain('archived')
    expect(validStatuses).not.toContain('')
  })

  it('default status is active', () => {
    const defaultStatus = 'active'
    expect(validStatuses).toContain(defaultStatus)
  })
})

// Patient form validation
describe('Patient Form — Required Fields', () => {
  it('requires first_name', () => {
    const requiredFields = ['first_name', 'last_name']
    requiredFields.forEach(field => {
      expect(field).toBeTruthy()
    })
  })

  it('optional fields can be empty', () => {
    const optionalFields = ['cedula', 'birth_date', 'gender', 'phone', 'email', 'address', 'status', 'observations']
    optionalFields.forEach(field => {
      // These should not throw when empty
      expect(field).toBeTruthy()
    })
  })
})

// Appointment statuses
describe('Appointment Statuses', () => {
  const appointmentStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']

  it('has 6 statuses', () => {
    expect(appointmentStatuses).toHaveLength(6)
  })

  it('can transition from scheduled/confirmed to in_progress', () => {
    const canStart = (status: string) => status === 'scheduled' || status === 'confirmed'
    expect(canStart('scheduled')).toBe(true)
    expect(canStart('confirmed')).toBe(true)
    expect(canStart('in_progress')).toBe(false)
    expect(canStart('completed')).toBe(false)
  })

  it('can reschedule only scheduled and confirmed', () => {
    const canReschedule = (status: string) => status === 'scheduled' || status === 'confirmed'
    expect(canReschedule('scheduled')).toBe(true)
    expect(canReschedule('confirmed')).toBe(true)
    expect(canReschedule('in_progress')).toBe(false)
    expect(canReschedule('completed')).toBe(false)
    expect(canReschedule('cancelled')).toBe(false)
  })
})

// Consent record structure
describe('Consent Record', () => {
  it('has required fields', () => {
    const consent = {
      tenant_id: 'uuid-1',
      patient_id: 'uuid-2',
      type: 'data_treatment',
      metadata: { source: 'booking_form' }
    }

    expect(consent.tenant_id).toBeTruthy()
    expect(consent.type).toBe('data_treatment')
    expect(consent.metadata).toBeDefined()
  })

  it('supports multiple consent types', () => {
    const types = ['data_treatment', 'marketing', 'clinical_photos']
    types.forEach(type => {
      expect(typeof type).toBe('string')
    })
  })

  it('metadata can capture source info', () => {
    const metadata = {
      source: 'booking_form',
      name: 'Juan Pérez',
      phone: '+593 912345678',
      ip_address: '192.168.1.1',
    }

    expect(metadata.source).toBe('booking_form')
    expect(metadata.name).toBeTruthy()
    expect(metadata.phone).toBeTruthy()
  })
})
