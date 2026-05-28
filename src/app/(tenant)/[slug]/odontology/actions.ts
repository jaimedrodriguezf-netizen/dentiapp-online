'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface PatientRow {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
  birth_date?: string | null
  gender?: string | null
  phone?: string | null
  address?: string | null
  tenant_id: string
}

export interface VitalSignsData {
  blood_pressure?: string | null
  heart_rate?: number | string | null
  respiratory_rate?: number | string | null
  temperature?: number | string | null
  spo2?: number | string | null
  weight?: number | string | null
  height?: number | string | null
  bmi?: number | string | null
}

export interface OralHygieneData {
  rating?: string | null
  plaque_index?: number | null
  piezas_presentes?: number | null
  superficies_evaluadas?: number | null
  superficies_con_placa?: number | null
  oleary_data?: Record<number, { absent: boolean; surfaces: Record<string, boolean> }> | null
}

export interface DiagnosisData {
  code?: string
  description?: string
  text?: string
  type?: string
  pieza_dental?: number | number[] | null
  caras_afectadas?: string[]
}

export interface StomatognathicData {
  regions?: Array<{ id: string; finding: string }>
  free_text?: string
}

export interface DentalRecordRow {
  id: string
  patient_id: string
  opening_date: string | null
  control_date?: string | null
  consultation_reason: string | null
  current_problem?: { text?: string } | string | null
  diagnosis?: DiagnosisData | DiagnosisData[] | null
  vital_signs?: VitalSignsData | null
  stomatognathic_exam?: StomatognathicData | null
  personal_history?: unknown
  family_history?: unknown
  complementary_exams?: unknown
  patients?: PatientRow | null
  pregnant?: boolean | null
  personal_family_history?: string | null
  oral_hygiene?: OralHygieneData | null
  periodontal_disease?: string | null
  fluorosis?: string | null
  malocclusion?: { class?: string; overjet?: number; overbite?: number } | null
  cpod_index?: { caries?: number; missing?: number; filled?: number; total?: number } | null
  ceod_index?: { caries?: number; extraction?: number; filled?: number; total?: number } | null
  diagnostic_plan?: string | null
  educational_plan?: string | null
  therapeutic_plan?: string | null
  treatment?: { text?: string } | string | null
  tenant_id: string
}

export interface PrescriptionData {
  id: string
  medication_name: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  quantity: number | null
  instructions: string | null
  tenant_id: string
  dental_record_id: string
}

export interface ToothData {
  id: string
  tooth_number: number
  status: string
  surfaces?: Record<string, string> | null
  tenant_id: string
  dental_record_id: string
}

export interface TreatmentSessionData {
  id: string
  session_number: number
  session_date: string | null
  diagnoses_complications: string | null
  procedures: string | null
  prescriptions: string | null
  signature: string | null
  dental_record_id: string
}

export async function getTenantId(slug: string) {
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()
  return tenant?.id
}

export async function getPatient(slug: string, patientId: string): Promise<PatientRow | null> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('tenant_id', tenantId)
    .single()

  return patient as PatientRow | null
}

export async function getDentalRecords(slug: string, patientId: string): Promise<DentalRecordRow[]> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: records } = await supabase
    .from('dental_records')
    .select('*')
    .eq('patient_id', patientId)
    .eq('tenant_id', tenantId)
    .order('opening_date', { ascending: false })

  return (records as DentalRecordRow[]) ?? []
}

export async function getDentalRecord(slug: string, recordId: string): Promise<DentalRecordRow | null> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: record } = await supabase
    .from('dental_records')
    .select('*, patients(first_name, last_name, cedula, birth_date, gender, phone, address)')
    .eq('id', recordId)
    .eq('tenant_id', tenantId)
    .single()

  return record as DentalRecordRow | null
}

export async function createDentalRecord(slug: string, patientId: string, formData: FormData): Promise<{ error: string } | void> {
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

  try { 
    if (personalHistoryRaw) personalHistory = JSON.parse(personalHistoryRaw) 
  } catch (err) {
    console.error('Failed to parse personal history JSON', err)
  }
  try { 
    if (familyHistoryRaw) familyHistory = JSON.parse(familyHistoryRaw) 
  } catch (err) {
    console.error('Failed to parse family history JSON', err)
  }
  try { 
    if (complementaryExamsRaw) complementaryExams = JSON.parse(complementaryExamsRaw) 
  } catch (err) {
    console.error('Failed to parse complementary exams JSON', err)
  }
  try { 
    if (stomatognathicRaw) stomatognathicExam = JSON.parse(stomatognathicRaw) 
  } catch (err) {
    console.error('Failed to parse stomatognathic exam JSON', err)
  }

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
        const validatedTeeth = teeth
          .filter((t): t is { tooth_number: number; status: string; surfaces?: Record<string, string> } => 
            t && typeof t === 'object' && 'tooth_number' in t && 'status' in t
          )
          .map((tooth) => ({
            dental_record_id: record.id,
            tenant_id: tenantId,
            tooth_number: Number(tooth.tooth_number),
            status: String(tooth.status),
            surfaces: (tooth.surfaces && typeof tooth.surfaces === 'object') ? tooth.surfaces : null,
          }))
        if (validatedTeeth.length > 0) {
          await supabase.from('odontogram_teeth').upsert(validatedTeeth, { onConflict: 'dental_record_id,tooth_number' })
        }
      }
    } catch (err) {
      console.error('Failed to parse and save odontogram teeth', err)
    }
  }

  // Save treatment sessions
  const sessionsRaw = formData.get('treatment_sessions') as string
  if (sessionsRaw) {
    try {
      const sessions = JSON.parse(sessionsRaw)
      if (Array.isArray(sessions) && sessions.length > 0) {
        const validatedSessions = sessions
          .filter((s): s is Record<string, unknown> => s && typeof s === 'object')
          .map((s, index) => ({
            dental_record_id: record.id,
            session_number: typeof s.session_number === 'number' ? s.session_number : index + 1,
            session_date: (s.session_date || s.date || null) ? String(s.session_date || s.date) : null,
            diagnoses_complications: (s.diagnoses_complications || s.diagnosis || null) ? String(s.diagnoses_complications || s.diagnosis) : null,
            procedures: (s.procedures || s.procedure || null) ? String(s.procedures || s.procedure) : null,
            prescriptions: s.prescriptions ? String(s.prescriptions) : null,
            signature: s.signature ? String(s.signature) : null,
          }))
        if (validatedSessions.length > 0) {
          await supabase.from('treatment_sessions').insert(validatedSessions)
        }
      }
    } catch (err) {
      console.error('Failed to parse and save treatment sessions', err)
    }
  }

  // Save prescriptions
  const prescriptionsRaw = formData.get('prescriptions') as string
  if (prescriptionsRaw) {
    try {
      const prescriptions = JSON.parse(prescriptionsRaw)
      if (Array.isArray(prescriptions) && prescriptions.length > 0) {
        const validatedPrescriptions = prescriptions
          .filter((p): p is { medication_id?: string | null; medication_name: string; dosage: string; frequency: string; duration: string; instructions: string; quantity: number | null } => 
            p && typeof p === 'object' && 'medication_name' in p
          )
          .map((p) => ({
            medication_id: p.medication_id || null,
            medication_name: String(p.medication_name),
            dosage: p.dosage ? String(p.dosage) : '',
            frequency: p.frequency ? String(p.frequency) : '',
            duration: p.duration ? String(p.duration) : '',
            instructions: p.instructions ? String(p.instructions) : '',
            quantity: p.quantity ? Number(p.quantity) : null,
          }))
        if (validatedPrescriptions.length > 0) {
          await savePrescriptions(slug, record.id, validatedPrescriptions)
        }
      }
    } catch (err) {
      console.error('Failed to parse and save prescriptions', err)
    }
  }

  redirect(`/${slug}/odontology/form-033/${record.id}`)
}

export async function updateDentalRecord(slug: string, recordId: string, formData: FormData): Promise<{ error: string } | void> {
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

  try { 
    if (personalHistoryRaw) personalHistory = JSON.parse(personalHistoryRaw) 
  } catch (err) {
    console.error('Failed to parse personal history JSON in update', err)
  }
  try { 
    if (familyHistoryRaw) familyHistory = JSON.parse(familyHistoryRaw) 
  } catch (err) {
    console.error('Failed to parse family history JSON in update', err)
  }
  try { 
    if (complementaryExamsRaw) complementaryExams = JSON.parse(complementaryExamsRaw) 
  } catch (err) {
    console.error('Failed to parse complementary exams JSON in update', err)
  }
  try { 
    if (stomatognathicRaw) stomatognathicExam = JSON.parse(stomatognathicRaw) 
  } catch (err) {
    console.error('Failed to parse stomatognathic exam JSON in update', err)
  }

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
    .eq('tenant_id', tenantId)

  if (error) return { error: error.message }

  // Save odontogram teeth (delete existing first to clean, then re-insert)
  await supabase
    .from('odontogram_teeth')
    .delete()
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)

  const odontogramTeethRaw = formData.get('odontogram_teeth') as string
  if (odontogramTeethRaw) {
    try {
      const teeth = JSON.parse(odontogramTeethRaw)
      if (Array.isArray(teeth) && teeth.length > 0) {
        const validatedTeeth = teeth
          .filter((t): t is { tooth_number: number; status: string; surfaces?: Record<string, string> } => 
            t && typeof t === 'object' && 'tooth_number' in t && 'status' in t
          )
          .map((tooth) => ({
            dental_record_id: recordId,
            tenant_id: tenantId,
            tooth_number: Number(tooth.tooth_number),
            status: String(tooth.status),
            surfaces: (tooth.surfaces && typeof tooth.surfaces === 'object') ? tooth.surfaces : null,
          }))
        if (validatedTeeth.length > 0) {
          await supabase.from('odontogram_teeth').insert(validatedTeeth)
        }
      }
    } catch (err) {
      console.error('Failed to parse and save odontogram teeth in update', err)
    }
  }

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
  const diagnosesJson = formData.get('diagnoses_json') as string
  if (diagnosesJson) {
    try {
      const list = JSON.parse(diagnosesJson)
      if (Array.isArray(list) && list.length > 0) {
        return list
      }
    } catch (err) {
      console.error('Failed to parse diagnoses_json', err)
    }
  }

  const code = formData.get('diagnosis_code') as string
  const description = formData.get('diagnosis_description') as string
  const notes = formData.get('diagnosis_notes') as string
  const type = formData.get('diagnosis_type') as string
  const tooth = formData.get('diagnosis_tooth') as string
  const teethRaw = formData.getAll('diagnosis_teeth') as string[]
  const surfaces = formData.getAll('diagnosis_surfaces') as string[]

  if (!code && !notes) return null

  let piezas: number | number[] | null = null
  if (teethRaw && teethRaw.length > 0) {
    const parsedTeeth = teethRaw.map(t => parseInt(t, 10)).filter(n => !isNaN(n))
    if (parsedTeeth.length === 1) {
      piezas = parsedTeeth[0]
    } else if (parsedTeeth.length > 1) {
      piezas = parsedTeeth
    }
  } else if (tooth) {
    const parsed = parseInt(tooth, 10)
    piezas = isNaN(parsed) ? null : parsed
  }

  return {
    ...(code && { code }),
    ...(description && { description }),
    ...(notes && { text: notes }),
    ...(type && { type }),
    pieza_dental: piezas,
    caras_afectadas: surfaces || [],
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
  const piezasPresentes = formData.get('oral_hygiene_piezas_presentes') as string
  const superficiesEvaluadas = formData.get('oral_hygiene_superficies_evaluadas') as string
  const superficiesConPlaca = formData.get('oral_hygiene_superficies_con_placa') as string
  const olearyDataRaw = formData.get('oral_hygiene_oleary_data') as string

  let olearyData = null
  if (olearyDataRaw) {
    try {
      olearyData = JSON.parse(olearyDataRaw)
    } catch (e) {
      console.error('Failed to parse oleary data JSON', e)
    }
  }

  if (!rating && !plaqueIndex && !piezasPresentes && !superficiesEvaluadas && !superficiesConPlaca && !olearyData) return null

  return {
    ...(rating && { rating }),
    ...(plaqueIndex && { plaque_index: parseFloat(plaqueIndex) }),
    ...(piezasPresentes && { piezas_presentes: parseInt(piezasPresentes) }),
    ...(superficiesEvaluadas && { superficies_evaluadas: parseInt(superficiesEvaluadas) }),
    ...(superficiesConPlaca && { superficies_con_placa: parseInt(superficiesConPlaca) }),
    ...(olearyData && { oleary_data: olearyData }),
  }
}

/** Build malocclusion text */
function buildMalocclusion(formData: FormData) {
  const malClass = formData.get('malocclusion_class') as string
  const overjet = formData.get('malocclusion_overjet') as string
  const overbite = formData.get('malocclusion_overbite') as string

  if (!malClass && !overjet && !overbite) return null

  return {
    ...(malClass && { class: malClass }),
    ...(overjet && { overjet: parseFloat(overjet) }),
    ...(overbite && { overbite: parseFloat(overbite) }),
  }
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

export async function getTreatmentSessions(slug: string, recordId: string): Promise<TreatmentSessionData[]> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data } = await supabase
    .from('treatment_sessions')
    .select('*')
    .eq('dental_record_id', recordId)
    .order('session_number', { ascending: true })

  return (data as TreatmentSessionData[]) ?? []
}

export async function addTreatmentSession(
  slug: string,
  recordId: string,
  sessionData: {
    session_number: number
    session_date: string
    diagnoses_complications: string
    procedures: string
    prescriptions?: string
    signature?: string
  }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('treatment_sessions').insert({
    dental_record_id: recordId,
    session_number: sessionData.session_number,
    session_date: sessionData.session_date,
    diagnoses_complications: sessionData.diagnoses_complications || null,
    procedures: sessionData.procedures || null,
    prescriptions: sessionData.prescriptions || null,
    signature: sessionData.signature || null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

/* ───────── Prescriptions (recetas) ───────── */

export async function getPrescriptions(slug: string, recordId: string): Promise<PrescriptionData[]> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)
    .order('created_at')

  return (data as PrescriptionData[]) ?? []
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
): Promise<{ error?: string; success?: boolean }> {
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

export async function getOdontogramTeeth(slug: string, recordId: string): Promise<ToothData[]> {
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: teeth } = await supabase
    .from('odontogram_teeth')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)

  return (teeth as ToothData[]) ?? []
}

export async function saveOdontogramTeeth(
  slug: string,
  recordId: string,
  teeth: { tooth_number: number; status: string; surfaces?: Record<string, string> }[]
): Promise<{ error?: string; success?: boolean }> {
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
