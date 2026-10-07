'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCachedTenantId } from '@/lib/tenant/getTenantId'
import { actionSuccess, actionError } from '@/lib/actions/result'
import { validatePatientInput, validateAppointmentInput } from '@/lib/validation/patient'
import type { ActionResult } from '@/types/action'

async function getTenantId(slug: string) {
  return getCachedTenantId(slug)
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
  const rawInput = Object.fromEntries(formData.entries())
  const validation = validatePatientInput(rawInput)
  if (!validation.success) {
    return { error: validation.error }
  }

  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('patients').insert({
    tenant_id: tenantId,
    ...validation.data,
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
  const rawInput = Object.fromEntries(formData.entries())
  const validation = validatePatientInput(rawInput)
  if (!validation.success) {
    return { error: validation.error }
  }

  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('patients')
    .update(validation.data)
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
  const rawInput = Object.fromEntries(formData.entries())
  const validation = validateAppointmentInput(rawInput)
  if (!validation.success) {
    return { error: validation.error }
  }

  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('appointments').insert({
    tenant_id: tenantId,
    ...validation.data,
  })

  if (error) return { error: error.message }

  redirect(`/${slug}/admission/appointments`)
}

export async function updateAppointmentStatus(slug: string, appointmentId: string, status: string): Promise<ActionResult> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return actionError('No tienes una clínica activa', 'TENANT_NOT_FOUND')

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('tenant_id', tenantId)

  if (error) return actionError(error.message, 'DB_ERROR')

  return actionSuccess(undefined, 'Estado de turno actualizado')
}
