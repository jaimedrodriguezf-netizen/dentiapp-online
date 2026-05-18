import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface VitalSignsData {
  heart_rate: string | null
  blood_pressure: string | null
  temperature: string | null
  oxygen_saturation: string | null
  respiratory_rate: string | null
  weight: string | null
  height: string | null
}

interface StomatognathicExamData {
  lips: string | null
  cheeks: string | null
  maxilla: string | null
  mandible: string | null
  tongue: string | null
  palate: string | null
  floor_of_mouth: string | null
  salivary_glands: string | null
  tmj: string | null
  lymph_nodes: string | null
}

export async function getPatients(tenantId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('last_name', { ascending: true })
  return data || []
}

export async function getPatient(slug: string, patientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single()
  return data
}

export async function getVitalSigns(slug: string, patientId: string) {
  const supabase = await createClient()
  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return []

  const { data } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('dental_record_id', record.id)
    .order('created_at', { ascending: false })
  return data || []
}

export async function saveVitalSigns(
  slug: string,
  patientId: string,
  data: VitalSignsData
) {
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return { error: 'No se encontró historia clínica' }

  const { error } = await supabase
    .from('vital_signs')
    .insert({
      dental_record_id: record.id,
      ...data
    })

  if (error) return { error: error.message }
  
  revalidatePath(`/${slug}/nursing/vital-signs/${patientId}`)
  return { success: true }
}

export async function getStomatognathicExam(slug: string, patientId: string) {
  const supabase = await createClient()
  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return null

  const { data } = await supabase
    .from('stomatognathic_exam')
    .select('*')
    .eq('dental_record_id', record.id)
    .maybeSingle()
  return data
}

export async function saveStomatognathicExam(
  slug: string,
  patientId: string,
  data: StomatognathicExamData
) {
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return { error: 'No se encontró historia clínica' }

  const { error } = await supabase
    .from('stomatognathic_exam')
    .upsert({
      dental_record_id: record.id,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'dental_record_id'
    })

  if (error) return { error: error.message }
  
  revalidatePath(`/${slug}/nursing/stomatognathic-exam/${patientId}`)
  return { success: true }
}

export async function getNursingNotes(slug: string, patientId: string) {
  const supabase = await createClient()
  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return []

  const { data } = await supabase
    .from('nursing_notes')
    .select('*')
    .eq('dental_record_id', record.id)
    .order('created_at', { ascending: false })
  return data || []
}

export async function saveNursingNote(
  slug: string,
  patientId: string,
  note: string
) {
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('dental_records')
    .select('id')
    .eq('patient_id', patientId)
    .single()

  if (!record) return { error: 'No se encontró historia clínica' }

  const { error } = await supabase
    .from('nursing_notes')
    .insert({
      dental_record_id: record.id,
      note
    })

  if (error) return { error: error.message }
  
  revalidatePath(`/${slug}/nursing/notes/${patientId}`)
  return { success: true }
}
