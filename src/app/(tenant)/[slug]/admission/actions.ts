'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getTenantId(slug: string) {
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()
  return tenant?.id
}

export async function getPatients(slug: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return patients ?? []
}

export async function createPatient(slug: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('patients').insert({
    tenant_id: tenantId,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    cedula: formData.get('cedula') as string,
    birth_date: formData.get('birth_date') as string || null,
    gender: formData.get('gender') as string || null,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    address: formData.get('address') as string,
  })

  if (error) return { error: error.message }

  redirect(`/${slug}/admission/patients`)
}

export async function getPatient(slug: string, patientId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('tenant_id', tenantId)
    .single()

  return patient
}

export async function updatePatient(slug: string, patientId: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('patients')
    .update({
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      cedula: formData.get('cedula') as string,
      birth_date: formData.get('birth_date') as string || null,
      gender: formData.get('gender') as string || null,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    })
    .eq('id', patientId)
    .eq('tenant_id', tenantId)

  if (error) return { error: error.message }

  redirect(`/${slug}/admission/patients/${patientId}`)
}

export async function getAppointments(slug: string, date?: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  let query = supabase
    .from('appointments')
    .select('*, patients(first_name, last_name, phone)')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) {
    query = query.eq('date', date)
  }

  const { data: appointments } = await query
  return appointments ?? []
}

export async function createAppointment(slug: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('appointments').insert({
    tenant_id: tenantId,
    patient_id: formData.get('patient_id') as string,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    reason: formData.get('reason') as string,
    status: 'scheduled',
  })

  if (error) return { error: error.message }

  redirect(`/${slug}/admission/appointments`)
}

export async function updateAppointmentStatus(slug: string, appointmentId: string, status: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('tenant_id', tenantId)

  if (error) return { error: error.message }

  return { success: true }
}
