import type { PatientStatus, AppointmentStatus } from '@/types/patient'

export interface ValidatedPatientInput {
  first_name: string
  last_name: string
  cedula: string | null
  birth_date: string | null
  gender: string | null
  phone: string | null
  email: string | null
  address: string | null
  status: PatientStatus
  observations: string | null
}

export interface ValidatedAppointmentInput {
  patient_id: string
  date: string
  time: string
  reason: string | null
  status: AppointmentStatus
}

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const VALID_PATIENT_STATUSES: PatientStatus[] = ['active', 'in_treatment', 'inactive', 'discharged']

export function validatePatientInput(raw: Record<string, unknown>): ValidationResult<ValidatedPatientInput> {
  const firstName = String(raw.first_name || '').trim()
  const lastName = String(raw.last_name || '').trim()

  if (!firstName) {
    return { success: false, error: 'El nombre es requerido' }
  }
  if (firstName.length > 100) {
    return { success: false, error: 'El nombre no puede superar los 100 caracteres' }
  }

  if (!lastName) {
    return { success: false, error: 'El apellido es requerido' }
  }
  if (lastName.length > 100) {
    return { success: false, error: 'El apellido no puede superar los 100 caracteres' }
  }

  const emailRaw = raw.email ? String(raw.email).trim() : null
  if (emailRaw && (emailRaw.length > 100 || !emailRaw.includes('@'))) {
    return { success: false, error: 'El formato del correo electrónico es inválido' }
  }

  const statusRaw = String(raw.status || 'active').trim() as PatientStatus
  if (!VALID_PATIENT_STATUSES.includes(statusRaw)) {
    return { success: false, error: 'Estado de paciente inválido' }
  }

  const cedulaRaw = raw.cedula ? String(raw.cedula).trim().slice(0, 20) : null
  const birthDateRaw = raw.birth_date ? String(raw.birth_date).trim() : null
  const genderRaw = raw.gender ? String(raw.gender).trim().slice(0, 20) : null
  const phoneRaw = raw.phone ? String(raw.phone).trim().slice(0, 30) : null
  const addressRaw = raw.address ? String(raw.address).trim().slice(0, 255) : null
  const observationsRaw = raw.observations ? String(raw.observations).trim().slice(0, 2000) : null

  return {
    success: true,
    data: {
      first_name: firstName,
      last_name: lastName,
      cedula: cedulaRaw || null,
      birth_date: birthDateRaw || null,
      gender: genderRaw || null,
      phone: phoneRaw || null,
      email: emailRaw || null,
      address: addressRaw || null,
      status: statusRaw,
      observations: observationsRaw || null,
    },
  }
}

export function validateAppointmentInput(raw: Record<string, unknown>): ValidationResult<ValidatedAppointmentInput> {
  const patientId = String(raw.patient_id || '').trim()
  const date = String(raw.date || '').trim()
  const time = String(raw.time || '').trim()

  if (!patientId) {
    return { success: false, error: 'El paciente es requerido' }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: false, error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' }
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { success: false, error: 'Formato de hora inválido (debe ser HH:MM)' }
  }

  const reasonRaw = raw.reason ? String(raw.reason).trim().slice(0, 500) : null
  const statusRaw = (raw.status ? String(raw.status).trim() : 'scheduled') as AppointmentStatus

  return {
    success: true,
    data: {
      patient_id: patientId,
      date,
      time,
      reason: reasonRaw || null,
      status: statusRaw,
    },
  }
}
