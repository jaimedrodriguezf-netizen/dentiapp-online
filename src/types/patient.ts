export type PatientStatus = 'active' | 'in_treatment' | 'inactive' | 'discharged'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Patient {
  id: string
  tenant_id: string
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
  created_at?: string
  updated_at?: string
}

export interface Appointment {
  id: string
  tenant_id: string
  patient_id: string
  date: string
  time: string
  reason: string | null
  status: AppointmentStatus
  patients?: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'phone'> | null
  created_at?: string
  updated_at?: string
}
