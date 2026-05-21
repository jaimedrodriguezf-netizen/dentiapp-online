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

  // Parse JSONB fields
  const personalHistoryRaw = formData.get('personal_history') as string
  const familyHistoryRaw = formData.get('family_history') as string
  const complementaryExamsRaw = formData.get('complementary_exams') as string
  const stomatognathicRaw = formData.get('stomatognathic_exam') as string

  let personalHistory = null
  let familyHistory = null
  let complementaryExams = null
  let stomatognathicExam = null

  try { if (personalHistoryRaw) personalHistory = JSON.parse(personalHistoryRaw) } catch {}
  try { if (familyHistoryRaw) familyHistory = JSON.parse(familyHistoryRaw) } catch {}
  try { if (complementaryExamsRaw) complementaryExams = JSON.parse(complementaryExamsRaw) } catch {}
  try { if (stomatognathicRaw) stomatognathicExam = JSON.parse(stomatognathicRaw) } catch {}

  const { data: record, error } = await supabase
    .from('dental_records')
    .insert({
      tenant_id: tenantId,
      patient_id: patientId,
      consultation_reason: formData.get('consultation_reason') as string,
      current_problem: formData.get('current_problem') ? { text: formData.get('current_problem') } : null,
      personal_family_history: formData.get('personal_family_history') as string || null,
      diagnostic_plan: formData.get('diagnostic_plan') as string || null,
      therapeutic_plan: formData.get('therapeutic_plan') as string || null,
      educational_plan: formData.get('educational_plan') as string || null,
      diagnosis: buildDiagnosis(formData),
      treatment: formData.get('treatment') ? { text: formData.get('treatment') } : null,
      vital_signs: buildVitalSigns(formData),
      oral_hygiene: buildOralHygiene(formData),
      stomatognathic_exam: stomatognathicExam,
      fluorosis: (formData.get('fluorosis') as string) || null,
      malocclusion: buildMalocclusion(formData),
      cpod_index: buildIndex(formData, 'cpod'),
      ceod_index: buildIndex(formData, 'ceod'),
      pregnant: parsePregnant(formData),
      personal_history: personalHistory,
      family_history: familyHistory,
      periodontal_disease: (formData.get('periodontal_disease') as string) || null,
      complementary_exams: complementaryExams,
      opening_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Save odontogram teeth
  const odontogramTeethRaw = formData.get('odontogram_teeth') as string
  if (odontogramTeethRaw) {
    try {
      const teeth = JSON.parse(odontogramTeethRaw)
      if (Array.isArray(teeth) && teeth.length > 0) {
        await supabase.from('odontogram_teeth').upsert(
          teeth.map((tooth: { tooth_number: number; status: string; surfaces?: Record<string, string> }) => ({
            dental_record_id: record.id,
            tenant_id: tenantId,
            tooth_number: tooth.tooth_number,
            status: tooth.status,
            surfaces: tooth.surfaces || null,
          })),
          { onConflict: 'dental_record_id,tooth_number' }
        )
      }
    } catch {}
  }

  // Save treatment sessions
  const sessionsRaw = formData.get('treatment_sessions') as string
  if (sessionsRaw) {
    try {
      const sessions = JSON.parse(sessionsRaw)
      if (Array.isArray(sessions) && sessions.length > 0) {
        await supabase.from('treatment_sessions').insert(
          sessions.map((s: Record<string, unknown>) => ({
            dental_record_id: record.id,
            session_number: s.session_number as number,
            session_date: (s.session_date || s.date || null) as string | null,
            diagnoses_complications: (s.diagnoses_complications || s.diagnosis || null) as string | null,
            procedures: (s.procedures || s.procedure || null) as string | null,
            prescriptions: (s.prescriptions || null) as string | null,
            signature: (s.signature || null) as string | null,
          }))
        )
      }
    } catch {}
  }

  redirect(`/${slug}/odontology/form-033/${record.id}`)
}

export async function updateDentalRecord(slug: string, recordId: string, formData: FormData) {
  const supabase = await createClient()

  // Parse JSONB fields
  const personalHistoryRaw = formData.get('personal_history') as string
  const familyHistoryRaw = formData.get('family_history') as string
  const complementaryExamsRaw = formData.get('complementary_exams') as string
  const stomatognathicRaw = formData.get('stomatognathic_exam') as string

  let personalHistory = null
  let familyHistory = null
  let complementaryExams = null
  let stomatognathicExam = null

  try { if (personalHistoryRaw) personalHistory = JSON.parse(personalHistoryRaw) } catch {}
  try { if (familyHistoryRaw) familyHistory = JSON.parse(familyHistoryRaw) } catch {}
  try { if (complementaryExamsRaw) complementaryExams = JSON.parse(complementaryExamsRaw) } catch {}
  try { if (stomatognathicRaw) stomatognathicExam = JSON.parse(stomatognathicRaw) } catch {}

  const { error } = await supabase
    .from('dental_records')
    .update({
      consultation_reason: formData.get('consultation_reason') as string,
      current_problem: formData.get('current_problem') ? { text: formData.get('current_problem') } : null,
      personal_family_history: formData.get('personal_family_history') as string || null,
      diagnostic_plan: formData.get('diagnostic_plan') as string || null,
      therapeutic_plan: formData.get('therapeutic_plan') as string || null,
      educational_plan: formData.get('educational_plan') as string || null,
      diagnosis: buildDiagnosis(formData),
      treatment: formData.get('treatment') ? { text: formData.get('treatment') } : null,
      vital_signs: buildVitalSigns(formData),
      oral_hygiene: buildOralHygiene(formData),
      stomatognathic_exam: stomatognathicExam,
      fluorosis: (formData.get('fluorosis') as string) || null,
      malocclusion: buildMalocclusion(formData),
      cpod_index: buildIndex(formData, 'cpod'),
      ceod_index: buildIndex(formData, 'ceod'),
      pregnant: parsePregnant(formData),
      personal_history: personalHistory,
      family_history: familyHistory,
      periodontal_disease: (formData.get('periodontal_disease') as string) || null,
      complementary_exams: complementaryExams,
    })
    .eq('id', recordId)

  if (error) return { error: error.message }

  redirect(`/${slug}/odontology/form-033/${recordId}`)
}

/** Parse pregnant field: 'true'/'false' → boolean/null */
function parsePregnant(formData: FormData): boolean | null {
  const val = formData.get('pregnant') as string
  if (val === 'true') return true
  if (val === 'false') return false
  return null
}

/** Build structured diagnosis JSONB from CIE-10 fields + clinical notes + type */
function buildDiagnosis(formData: FormData) {
  const code = formData.get('diagnosis_code') as string
  const description = formData.get('diagnosis_description') as string
  const notes = formData.get('diagnosis_notes') as string
  const type = formData.get('diagnosis_type') as string

  if (!code && !notes) return null

  return {
    ...(code && { code }),
    ...(description && { description }),
    ...(notes && { text: notes }),
    ...(type && { type }),
  }
}

/** Build vital_signs JSONB */
function buildVitalSigns(formData: FormData) {
  const bp = formData.get('vital_bp') as string
  const hr = formData.get('vital_hr') as string
  const rr = formData.get('vital_rr') as string
  const temp = formData.get('vital_temp') as string
  const spo2 = formData.get('vital_spo2') as string
  const weight = formData.get('vital_weight') as string
  const height = formData.get('vital_height') as string

  const hasAny = bp || hr || rr || temp || spo2 || weight || height
  if (!hasAny) return null

  const bmi = (weight && height)
    ? parseFloat((parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1))
    : undefined

  return {
    ...(bp && { blood_pressure: bp }),
    ...(hr && { heart_rate: parseInt(hr) }),
    ...(rr && { respiratory_rate: parseInt(rr) }),
    ...(temp && { temperature: parseFloat(temp) }),
    ...(spo2 && { spo2: parseInt(spo2) }),
    ...(weight && { weight: parseFloat(weight) }),
    ...(height && { height: parseFloat(height) }),
    ...(bmi && { bmi }),
  }
}

/** Build oral_hygiene JSONB */
function buildOralHygiene(formData: FormData) {
  const rating = formData.get('oral_hygiene_rating') as string
  const plaqueIndex = formData.get('oral_hygiene_plaque_index') as string

  if (!rating && !plaqueIndex) return null

  return {
    ...(rating && { rating }),
    ...(plaqueIndex && { plaque_index: parseInt(plaqueIndex) }),
  }
}

/** Build malocclusion text */
function buildMalocclusion(formData: FormData) {
  const malClass = formData.get('malocclusion_class') as string
  const overjet = formData.get('malocclusion_overjet') as string
  const overbite = formData.get('malocclusion_overbite') as string

  if (!malClass && !overjet && !overbite) return null

  return JSON.stringify({
    ...(malClass && { class: malClass }),
    ...(overjet && { overjet: parseFloat(overjet) }),
    ...(overbite && { overbite: parseFloat(overbite) }),
  })
}

/** Build CPO-D or CEO-D JSONB */
function buildIndex(formData: FormData, prefix: 'cpod' | 'ceod') {
  const caries = parseInt(formData.get(`${prefix}_caries`) as string) || 0
  const missing = parseInt(formData.get(`${prefix}_missing`) as string) || 0
  const filled = parseInt(formData.get(`${prefix}_filled`) as string) || 0

  if (!caries && !missing && !filled) return null

  const total = caries + missing + filled
  return prefix === 'cpod'
    ? { caries, missing, filled, total }
    : { caries, extraction: missing, filled, total }
}

/* ───────── Treatment Sessions ───────── */

export async function getTreatmentSessions(slug: string, recordId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data } = await supabase
    .from('treatment_sessions')
    .select('*')
    .eq('dental_record_id', recordId)
    .order('session_number', { ascending: true })

  return data ?? []
}

/* ───────── Prescriptions (recetas) ───────── */

export async function getPrescriptions(slug: string, recordId: string) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)
    .order('created_at')

  return data ?? []
}

export async function savePrescriptions(
  slug: string,
  recordId: string,
  items: {
    medication_id?: string | null
    medication_name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
    quantity: number | null
  }[]
) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  // Delete existing and re-insert (simplest for small sets)
  await supabase
    .from('prescriptions')
    .delete()
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)

  if (items.length === 0) return { success: true }

  const { error } = await supabase.from('prescriptions').insert(
    items.map((item) => ({
      dental_record_id: recordId,
      tenant_id: tenantId,
      medication_id: item.medication_id || null,
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
      quantity: item.quantity,
    }))
  )

  if (error) return { error: error.message }
  return { success: true }
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
  teeth: { tooth_number: number; status: string; surfaces?: Record<string, string> }[]
) {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('odontogram_teeth').upsert(
    teeth.map((tooth) => ({
      dental_record_id: recordId,
      tenant_id: tenantId,
      tooth_number: tooth.tooth_number,
      status: tooth.status,
      surfaces: tooth.surfaces,
    })),
    { onConflict: 'dental_record_id,tooth_number' }
  )

  if (error) return { error: error.message }
  return { success: true }
}
