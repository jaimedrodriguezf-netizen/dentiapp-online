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

export async function getDentalRecords(slug: string, patientId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: records } = await supabase
    .from('dental_records')
    .select('*')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('opening_date', { ascending: false })

  return records ?? []
}

export async function getDentalRecord(slug: string, recordId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: record } = await supabase
    .from('dental_records')
    .select('*, patients(first_name, last_name, cedula, birth_date, gender, phone, address)')
    .eq('id', recordId)
    .eq('tenant_id', tenantId)
    .single()

  return record
}

export async function createDentalRecord(slug: string, patientId: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { data: record, error } = await supabase
    .from('dental_records')
    .insert({
      tenant_id: tenantId,
      patient_id: patientId,
      consultation_reason: formData.get('consultation_reason') as string,
      current_problem: formData.get('current_problem') ? { text: formData.get('current_problem') } : null,
      personal_family_history: formData.get('personal_family_history') as string,
      diagnostic_plan: formData.get('diagnostic_plan') as string,
      therapeutic_plan: formData.get('therapeutic_plan') as string,
      educational_plan: formData.get('educational_plan') as string,
      diagnosis: buildDiagnosis(formData),
      treatment: formData.get('treatment') ? { text: formData.get('treatment') } : null,
      opening_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/${slug}/odontology/form-033/${record.id}`)
}

export async function updateDentalRecord(slug: string, recordId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('dental_records')
    .update({
      consultation_reason: formData.get('consultation_reason') as string,
      current_problem: formData.get('current_problem') ? { text: formData.get('current_problem') } : null,
      personal_family_history: formData.get('personal_family_history') as string,
      diagnostic_plan: formData.get('diagnostic_plan') as string,
      therapeutic_plan: formData.get('therapeutic_plan') as string,
      educational_plan: formData.get('educational_plan') as string,
      diagnosis: buildDiagnosis(formData),
      treatment: formData.get('treatment') ? { text: formData.get('treatment') } : null,
    })
    .eq('id', recordId)

  if (error) return { error: error.message }

  redirect(`/${slug}/odontology/form-033/${recordId}`)
}

/** Build structured diagnosis JSONB from CIE-10 fields + clinical notes */
function buildDiagnosis(formData: FormData) {
  const code = formData.get('diagnosis_code') as string
  const description = formData.get('diagnosis_description') as string
  const notes = formData.get('diagnosis_notes') as string

  if (!code && !notes) return null

  return {
    ...(code && { code }),
    ...(description && { description }),
    ...(notes && { text: notes }),
  }
}

export async function getOdontogramTeeth(slug: string, recordId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: teeth } = await supabase
    .from('odontogram_teeth')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)

  return teeth ?? []
}

export async function saveOdontogramTeeth(
  slug: string,
  recordId: string,
  teeth: { tooth_number: number; status: string }[]
) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  // Upsert each tooth
  for (const tooth of teeth) {
    const { error } = await supabase.from('odontogram_teeth').upsert(
      {
        dental_record_id: recordId,
        tenant_id: tenantId,
        tooth_number: tooth.tooth_number,
        status: tooth.status,
      },
      { onConflict: 'dental_record_id,tooth_number' }
    )

    if (error) return { error: error.message }
  }

  return { success: true }
}
