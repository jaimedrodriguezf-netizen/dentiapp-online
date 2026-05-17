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
    .select('id, first_name, last_name, cedula, phone')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return patients ?? []
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

export async function saveVitalSigns(slug: string, patientId: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const vitalSigns = {
    blood_pressure: formData.get('blood_pressure') as string,
    heart_rate: formData.get('heart_rate') as string,
    temperature: formData.get('temperature') as string,
    respiratory_rate: formData.get('respiratory_rate') as string,
    oxygen_saturation: formData.get('oxygen_saturation') as string,
    weight: formData.get('weight') as string,
    height: formData.get('height') as string,
    notes: formData.get('notes') as string,
    recorded_at: new Date().toISOString(),
  }

  // Store in dental_records if there's one for this patient, or create a new one
  const { data: existing } = await supabase
    .from('dental_records')
    .select('id, vital_signs')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const existingSigns = (existing.vital_signs as any[]) || []
    await supabase
      .from('dental_records')
      .update({
        vital_signs: [...existingSigns, vitalSigns],
      })
      .eq('id', existing.id)
  }

  redirect(`/${slug}/nursing/vital-signs`)
}

export async function getVitalSigns(slug: string, patientId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: records } = await supabase
    .from('dental_records')
    .select('vital_signs, created_at')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!records) return []

  const allSigns: any[] = []
  for (const r of records) {
    const signs = r.vital_signs as any[]
    if (signs) {
      for (const s of signs) {
        allSigns.push({ ...s, record_date: r.created_at })
      }
    }
  }

  return allSigns
}

export async function saveStomatognathicExam(slug: string, patientId: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const exam = {
    tmj: formData.get('tmj') as string,
    lymph_nodes: formData.get('lymph_nodes') as string,
    oral_mucosa: formData.get('oral_mucosa') as string,
    tongue: formData.get('tongue') as string,
    palate: formData.get('palate') as string,
    floor_of_mouth: formData.get('floor_of_mouth') as string,
    lips: formData.get('lips') as string,
    salivary_glands: formData.get('salivary_glands') as string,
    observations: formData.get('observations') as string,
    recorded_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    await supabase
      .from('dental_records')
      .update({ stomatognathic_exam: exam as any })
      .eq('id', existing.id)
  }

  redirect(`/${slug}/nursing/vital-signs`)
}

export async function getStomatognathicExam(slug: string, patientId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: record } = await supabase
    .from('dental_records')
    .select('stomatognathic_exam')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return record?.stomatognathic_exam || null
}

export async function saveNursingNote(slug: string, patientId: string, formData: FormData) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('nursing_notes').insert({
    tenant_id: tenantId,
    patient_id: patientId,
    content: formData.get('content') as string,
    created_by: user?.id,
  })

  if (error) return { error: error.message }

  redirect(`/${slug}/nursing/notes/${patientId}`)
}

export async function getNursingNotes(slug: string, patientId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: notes } = await supabase
    .from('nursing_notes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  return notes ?? []
}
