import { getDentalRecord, getPrescriptions, getOdontogramTeeth, getTreatmentSessions, DiagnosisData, VitalSignsData, OralHygieneData, StomatognathicData, DentalRecordRow } from '../../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Printer, Activity, FileText, Pill, Calendar, CreditCard, User, Baby, Stethoscope } from 'lucide-react'
import OdontogramSVG from '@/components/odontology/OdontogramSVG'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

interface PatientData {
  id?: string
  first_name: string
  last_name: string
  cedula: string | null
  birth_date?: string
  gender?: string
  phone?: string
  address?: string
}

interface PrescriptionData {
  id: string
  medication_name: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  quantity: number | null
  instructions: string | null
}

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}



interface TreatmentSessionData {
  id: string
  session_number: number
  session_date: string | null
  diagnoses_complications: string | null
  procedures: string | null
  prescriptions: string | null
  signature: string | null
}



const regionLabels: Record<string, string> = {
  labios: 'LABIOS',
  mejillas: 'MEJILLAS',
  maxilar_superior: 'MAXILAR SUPERIOR',
  maxilar_inferior: 'MAXILAR INFERIOR',
  lengua: 'LENGUA',
  paladar: 'PALADAR',
  piso_boca: 'PISO DE LA BOCA',
  carrillos: 'CARRILLOS',
  glandulas_salivales: 'GLÁNDULAS SALIVALES',
  oro_faringe: 'ORO FARINGE',
  atm: 'A.T.M.',
  ganglios: 'GANGLIOS',
  otros: 'OTROS',
}

const personalHistoryLabels: Record<string, string> = {
  allergy_antibiotic: 'Alergia a antibiótico',
  allergy_anesthesia: 'Alergia a anestesia',
  hemorrhages: 'Hemorragias',
  hiv: 'VIH / SIDA',
  tuberculosis: 'Tuberculosis',
  asthma: 'Asma',
  diabetes: 'Diabetes',
  hypertension: 'Hipertensión arterial',
  heart_disease: 'Enfermedad cardíaca',
  other: 'Otro',
}

const familyHistoryLabels: Record<string, string> = {
  cardiopathy: 'Cardiopatía',
  hypertension: 'Hipertensión arterial',
  vascular_disease: 'Enf. cardiovascular',
  endocrine: 'Endócrino metabólico',
  cancer: 'Cáncer',
  tuberculosis: 'Tuberculosis',
  mental_illness: 'Enf. mental',
  infectious_disease: 'Enf. infecciosa',
  malformation: 'Mal formación',
  other: 'Otro',
}

export const dynamic = 'force-dynamic'

interface DentalRecordData {
  id: string
  patient_id: string
  consultation_reason: string
  current_problem: { text: string } | string | null
  diagnosis: DiagnosisData | null
  vital_signs: VitalSignsData | null
  stomatognathic_exam: StomatognathicData | null
  personal_history: Record<string, boolean | string> | null
  family_history: Record<string, boolean | string> | null
  complementary_exams: { hematology?: string; blood_chemistry?: string; xray?: string; other?: string } | null
  patients: PatientData
  opening_date: string | null
  pregnant: boolean | null
  personal_family_history: string | null
  oral_hygiene: OralHygieneData | null
  periodontal_disease: string | null
  fluorosis: string | null
  malocclusion: string | null
  cpod_index: Record<string, number> | null
  ceod_index: Record<string, number> | null
  diagnostic_plan: string | null
  educational_plan: string | null
  therapeutic_plan: string | null
  treatment: string | null
}

function mapToDentalRecord(data: DentalRecordRow | null): DentalRecordData | null {
  if (!data) return null
  return {
    id: data.id,
    patient_id: data.patient_id,
    consultation_reason: data.consultation_reason || '',
    current_problem: data.current_problem
      ? (typeof data.current_problem === 'string'
          ? data.current_problem
          : { text: data.current_problem.text || '' })
      : null,
    diagnosis: data.diagnosis || null,
    vital_signs: data.vital_signs || null,
    stomatognathic_exam: data.stomatognathic_exam || null,
    personal_history: data.personal_history as Record<string, boolean | string> | null,
    family_history: data.family_history as Record<string, boolean | string> | null,
    complementary_exams: data.complementary_exams as { hematology?: string; blood_chemistry?: string; xray?: string; other?: string } | null,
    patients: data.patients as PatientData,
    opening_date: data.opening_date,
    pregnant: data.pregnant ?? null,
    personal_family_history: data.personal_family_history || null,
    oral_hygiene: data.oral_hygiene || null,
    periodontal_disease: data.periodontal_disease || null,
    fluorosis: data.fluorosis || null,
    malocclusion: data.malocclusion
      ? (typeof data.malocclusion === 'string'
          ? data.malocclusion
          : JSON.stringify(data.malocclusion))
      : null,
    cpod_index: data.cpod_index as Record<string, number> | null,
    ceod_index: data.ceod_index as Record<string, number> | null,
    diagnostic_plan: data.diagnostic_plan || null,
    educational_plan: data.educational_plan || null,
    therapeutic_plan: data.therapeutic_plan || null,
    treatment: data.treatment ? (typeof data.treatment === 'string' ? data.treatment : data.treatment.text || '') : null,
  }
}

export default async function Form033DetailPage({ params }: Props) {
  const { slug, id } = await params

  const recordRaw = await getDentalRecord(slug, id)
  const record = mapToDentalRecord(recordRaw)
  
  if (!record) {
    notFound()
  }

  const patient = record.patients

  const vitalSigns = record.vital_signs
  const stomatognathic = record.stomatognathic_exam
  const personalHistory = record.personal_history
  const familyHistory = record.family_history
  const complementaryExams = record.complementary_exams
  const diagnosis = record.diagnosis

  const [prescriptionsData, teethData, sessionsData] = await Promise.all([
    getPrescriptions(slug, id),
    getOdontogramTeeth(slug, id),
    getTreatmentSessions(slug, id),
  ])

  const prescriptions = (prescriptionsData as PrescriptionData[]) || []
  const teeth = (teethData as ToothData[]) || []
  const sessions = (sessionsData as TreatmentSessionData[]) || []

  return (
    <div className="w-full space-y-6 pb-24 md:pb-12">
      {/* Header adaptable */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/admission/patients/${record.patient_id}`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate max-w-[200px] md:max-w-none">Ficha Dental</h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">Formulario 033 — MSP</p>
          </div>
        </div>

        <div className="hidden md:flex gap-3">
          {prescriptions.length > 0 && (
            <Link
              href={`/${slug}/odontology/form-033/${id}/print?type=prescription`}
              target="_blank"
              className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
            >
              <Printer className="w-4 h-4" />
              Imprimir Receta
            </Link>
          )}
          <Link
            href={`/${slug}/odontology/form-033/${id}/print`}
            target="_blank"
            className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
          >
            <Printer className="w-4 h-4" />
            Imprimir Ficha
          </Link>
          <Link
            href={`/${slug}/odontology/form-033/${id}/edit`}
            className="btn btn-primary btn-sm rounded-xl font-black shadow-lg shadow-primary/20"
          >
            <Edit className="w-4 h-4" />
            Editar Ficha
          </Link>
        </div>
      </div>

      {/* Tarjeta de Paciente Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-4 md:mx-0">
        <PatientMiniCard icon={User} label="Paciente" value={`${patient?.first_name ?? ''} ${patient?.last_name ?? ''}`.trim() || '—'} />
        <PatientMiniCard icon={CreditCard} label="Cédula" value={patient?.cedula || '—'} />
        <PatientMiniCard icon={Calendar} label="Apertura" value={record.opening_date ? new Date(record.opening_date).toLocaleDateString('es-EC') : '—'} />
      </div>

      {/* Contenido Principal */}
      <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-3xl">
        <div className="card-body p-5 md:p-8 space-y-8">
          {/* A + B + C: Motivo de consulta + Problema actual + Embarazada */}
          <div className="space-y-6">
            <Section title="1. Motivo de consulta" content={record.consultation_reason} />
            <Section title="2. Problema actual" content={record.current_problem} />
            
            {/* Embarazada */}
            {record.pregnant !== null && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">3. Embarazada</h3>
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                  <Baby className={`w-5 h-5 ${record.pregnant ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-black ${record.pregnant ? 'text-pink-600' : 'text-gray-500'}`}>
                    {record.pregnant ? 'Sí — Paciente embarazada' : 'No'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* D + E: Antecedentes Personales y Familiares */}
          {(personalHistory || familyHistory) && (
            <div className="pt-4 border-t border-gray-50 space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">4. Antecedentes Patológicos</h3>
              
              {personalHistory && (
                <CheckboxDisplay
                  title="Antecedentes Personales"
                  data={personalHistory}
                  labels={personalHistoryLabels}
                />
              )}
              
              {familyHistory && (
                <CheckboxDisplay
                  title="Antecedentes Familiares"
                  data={familyHistory}
                  labels={familyHistoryLabels}
                />
              )}
            </div>
          )}

          {/* Antecedentes personales y familiares (texto libre legacy) */}
          {record.personal_family_history && !personalHistory && !familyHistory && (
            <Section title="3. Antecedentes personales y familiares" content={record.personal_family_history} />
          )}

          {/* F: Signos Vitales */}
          <VitalSignsView content={vitalSigns} />

          {/* G: Examen Estomatognático */}
          {stomatognathic && stomatognathic.regions && (
            <div className="pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">6. Examen Estomatognático</h3>
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-2">
                {stomatognathic.regions.map((r) => {
                  const findingText = !r.finding || r.finding === 'S.P.A.' ? 'Sin Patología Aparente' : r.finding
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider min-w-[140px]">
                        {regionLabels[r.id] || r.id}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{findingText}</span>
                    </div>
                  )
                })}
                {stomatognathic.free_text && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Observaciones</span>
                    <p className="text-sm text-gray-700 mt-1">{stomatognathic.free_text}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* I + J: Salud Bucal e Índices */}
          {(record.oral_hygiene || record.periodontal_disease || record.fluorosis || record.malocclusion || record.cpod_index || record.ceod_index) && (
            <OralHealthView
              oralHygiene={record.oral_hygiene as { rating?: string; plaque_index?: number } | null}
              periodontalDisease={record.periodontal_disease as string | null}
              fluorosis={record.fluorosis as string | null}
              malocclusion={record.malocclusion as string | null}
              cpod={record.cpod_index as Record<string, number> | null}
              ceod={record.ceod_index as Record<string, number> | null}
            />
          )}

          {/* L: Exámenes Complementarios */}
          {complementaryExams && (
            <ComplementaryExamsDisplay data={complementaryExams} />
          )}

          {/* N: Diagnóstico */}
          <DiagnosisSection content={diagnosis} />

          {/* Plan diagnóstico */}
          <Section title="Plan diagnóstico" content={record.diagnostic_plan} />

          {/* Plan educativo */}
          <Section title="Plan educativo" content={record.educational_plan} />

          {/* P: Plan terapéutico + Tratamiento realizado */}
          <Section title="Plan terapéutico" content={record.therapeutic_plan} />
          <Section title="Tratamiento realizado" content={record.treatment} />
        </div>
      </div>

      {/* Sesiones de Tratamiento */}
      {sessions.length > 0 && (
        <TreatmentSessionsDisplay sessions={sessions} />
      )}

      {/* Recetas */}
      {prescriptions.length > 0 && (
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
          <div className="card-body p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Receta Médica
              </h3>
              <Link
                href={`/${slug}/odontology/form-033/${id}/print?type=prescription`}
                target="_blank"
                className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
              >
                <Printer className="w-4 h-4" />
                Imprimir Receta
              </Link>
            </div>
            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 group hover:border-blue-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-gray-900 leading-tight">{rx.medication_name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {rx.dosage && (
                          <div className="flex items-center gap-1"><span className="text-gray-300">Dosis:</span> {rx.dosage}</div>
                        )}
                        {rx.frequency && (
                          <div className="flex items-center gap-1"><span className="text-gray-300">Freq:</span> {rx.frequency}</div>
                        )}
                        {rx.duration && (
                          <div className="flex items-center gap-1"><span className="text-gray-300">Dura:</span> {rx.duration}</div>
                        )}
                      </div>
                      {rx.instructions && (
                        <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded-lg italic border border-gray-100">
                          {rx.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Odontograma Preview */}
      <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
        <div className="card-body p-5 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="w-6 h-6 text-red-500" />
              Odontograma
            </h3>
            <Link
              href={`/${slug}/odontology/odontogram/${id}`}
              className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              EDITAR
            </Link>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {teeth.length > 0 ? (
              <div className="min-w-[700px] md:min-w-0">
                <OdontogramSVG teeth={teeth} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Sin hallazgos registrados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar para Móvil (Sticky) */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 flex gap-3">
        {prescriptions.length > 0 ? (
          <>
            <Link
              href={`/${slug}/odontology/form-033/${id}/print?type=prescription`}
              className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
            >
              <Printer className="w-5 h-5 text-blue-600" />
              RECETA
            </Link>
            <Link
              href={`/${slug}/odontology/form-033/${id}/print`}
              className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
            >
              <Printer className="w-5 h-5" />
              FICHA
            </Link>
          </>
        ) : (
          <Link
            href={`/${slug}/odontology/form-033/${id}/print`}
            className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
          >
            <Printer className="w-5 h-5" />
            IMPRIMIR
          </Link>
        )}
        <Link
          href={`/${slug}/odontology/form-033/${id}/edit`}
          className="flex-1 btn btn-primary rounded-2xl h-14 font-black shadow-xl shadow-primary/30"
        >
          <Edit className="w-5 h-5" />
          EDITAR
        </Link>
      </div>
    </div>
  )
}

/* ─── Helper Components ─── */

function PatientMiniCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center gap-4">
      <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: string | { text: string } | null }) {
  const text = typeof content === 'object' && content !== null ? content.text : content
  if (!text) return null

  return (
    <div className="group">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{title}</h3>
      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 group-hover:border-blue-100 transition-colors">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

function DiagnosisSection({ content }: { content: DiagnosisData | null }) {
  if (!content) return null

  const code = content.code
  const description = content.description
  const notes = content.text
  const type = content.type

  return (
    <div className="pt-4 border-t border-gray-50">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Diagnóstico (CIE-10)</h3>
      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        {code && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-blue-200">
              {code}
            </span>
            {type && (
              <span className="inline-flex items-center rounded-lg bg-gray-200 px-2.5 py-0.5 text-[10px] font-black text-gray-600 uppercase tracking-wider">
                {type}
              </span>
            )}
            {description && <span className="text-sm font-bold text-gray-700">{description}</span>}
          </div>
        )}
        {notes && <p className="text-sm text-gray-600 whitespace-pre-wrap italic">{notes}</p>}
      </div>
    </div>
  )
}

function VitalSignsView({ content }: { content: VitalSignsData | null }) {
  if (!content) return null

  const items = [
    { label: 'TA', val: content.blood_pressure, unit: '' },
    { label: 'FC', val: content.heart_rate, unit: 'lpm' },
    { label: 'FR', val: content.respiratory_rate, unit: 'rpm' },
    { label: 'Temp', val: content.temperature, unit: '°C' },
    { label: 'SpO2', val: content.spo2, unit: '%' },
    { label: 'Peso', val: content.weight, unit: 'kg' },
    { label: 'Talla', val: content.height, unit: 'cm' },
    { label: 'IMC', val: content.bmi, unit: '' },
  ].filter(i => i.val)

  if (items.length === 0) return null

  return (
    <div className="pt-4 border-t border-gray-50">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">5. Signos vitales</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(i => (
          <div key={i.label} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{i.label}</span>
            <span className="text-sm font-bold text-gray-900">{i.val} {i.unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckboxDisplay({
  title,
  data,
  labels,
}: {
  title: string
  data: Record<string, boolean | string>
  labels: Record<string, string>
}) {
  const checkedItems = Object.entries(data)
    .filter(([key, val]) => key !== 'other_text' && val === true)
    .map(([key]) => ({ key, label: labels[key] || key }))

  if (checkedItems.length === 0) return null

  return (
    <div>
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {checkedItems.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-100"
          >
            {item.label}
          </span>
        ))}
        {data.other_text && typeof data.other_text === 'string' && data.other_text && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 border border-purple-100">
            Otro: {data.other_text}
          </span>
        )}
      </div>
    </div>
  )
}

function OralHealthView({
  oralHygiene,
  periodontalDisease,
  fluorosis,
  malocclusion,
  cpod,
  ceod,
}: {
  oralHygiene: { rating?: string; plaque_index?: number } | null
  periodontalDisease: string | null
  fluorosis: string | null
  malocclusion: string | null
  cpod: Record<string, number> | null
  ceod: Record<string, number> | null
}) {
  const periodontalLabels: Record<string, string> = {
    leve: 'Leve',
    moderada: 'Moderada',
    severa: 'Severa',
  }
  const hygieneLabels: Record<string, string> = {
    buena: 'Buena',
    regular: 'Regular',
    mala: 'Mala',
  }
  const fluorosisLabels: Record<string, string> = {
    dudosa: 'Dudosa',
    muy_leve: 'Muy leve',
    leve: 'Leve',
    moderada: 'Moderada',
    severa: 'Severa',
  }

  let malocclusionParsed: Record<string, string | number> | null = null
  if (malocclusion) {
    try { malocclusionParsed = JSON.parse(malocclusion) } catch {}
  }

  return (
    <div className="pt-4 border-t border-gray-50 space-y-4">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Salud Bucal e Índices</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {oralHygiene?.rating && (
          <InfoCard label="Higiene oral" value={hygieneLabels[oralHygiene.rating] || oralHygiene.rating} />
        )}
        {oralHygiene?.plaque_index !== undefined && oralHygiene?.plaque_index !== null && (
          <InfoCard label="Índice de placa" value={`${oralHygiene.plaque_index}%`} />
        )}
        {periodontalDisease && (
          <InfoCard label="Enf. periodontal" value={periodontalLabels[periodontalDisease] || periodontalDisease} />
        )}
        {fluorosis && (
          <InfoCard label="Fluorosis" value={fluorosisLabels[fluorosis] || fluorosis} />
        )}
      </div>
      {malocclusionParsed && (
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Maloclusión</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            {malocclusionParsed.class && (
              <span className="font-bold text-gray-700">
                Clase: <span className="font-black text-gray-900">{String(malocclusionParsed.class).replace('clase_', '')}</span>
              </span>
            )}
            {malocclusionParsed.overjet && (
              <span className="font-bold text-gray-700">
                Overjet: <span className="font-black text-gray-900">{malocclusionParsed.overjet} mm</span>
              </span>
            )}
            {malocclusionParsed.overbite && (
              <span className="font-bold text-gray-700">
                Overbite: <span className="font-black text-gray-900">{malocclusionParsed.overbite} mm</span>
              </span>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cpod && (
          <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CPO-D</span>
            <div className="flex gap-3 mt-1 text-sm font-bold">
              <span>C: <span className="font-black text-gray-900">{cpod.caries ?? 0}</span></span>
              <span>P: <span className="font-black text-gray-900">{cpod.missing ?? 0}</span></span>
              <span>O: <span className="font-black text-gray-900">{cpod.filled ?? 0}</span></span>
              <span>Total: <span className="font-black text-blue-600">{cpod.total ?? 0}</span></span>
            </div>
          </div>
        )}
        {ceod && (
          <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CEO-D</span>
            <div className="flex gap-3 mt-1 text-sm font-bold">
              <span>C: <span className="font-black text-gray-900">{ceod.caries ?? 0}</span></span>
              <span>E: <span className="font-black text-gray-900">{ceod.extraction ?? 0}</span></span>
              <span>O: <span className="font-black text-gray-900">{ceod.filled ?? 0}</span></span>
              <span>Total: <span className="font-black text-blue-600">{ceod.total ?? 0}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}

function ComplementaryExamsDisplay({ data }: { data: { hematology?: string; blood_chemistry?: string; xray?: string; other?: string } }) {
  const hasAny = data.hematology || data.blood_chemistry || data.xray || data.other
  if (!hasAny) return null

  return (
    <div className="pt-4 border-t border-gray-50">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Exámenes Complementarios</h3>
      <div className="grid grid-cols-1 gap-3">
        {data.hematology && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Biometría hemática</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.hematology}</p>
          </div>
        )}
        {data.blood_chemistry && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Química sanguínea</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.blood_chemistry}</p>
          </div>
        )}
        {data.xray && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rayos X</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.xray}</p>
          </div>
        )}
        {data.other && (
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Otros exámenes</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.other}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TreatmentSessionsDisplay({ sessions }: { sessions: TreatmentSessionData[] }) {
  return (
    <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
      <div className="card-body p-5 md:p-8">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          Sesiones de Tratamiento
        </h3>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 group hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-black text-blue-600">
                    {session.session_number}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Sesión {session.session_number}</p>
                    {session.session_date && (
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(session.session_date).toLocaleDateString('es-EC')}
                      </p>
                    )}
                  </div>
                </div>
                {session.signature && (
                  <span className="text-xs text-gray-400 italic">Firma: {session.signature}</span>
                )}
              </div>
              <div className="space-y-2">
                {session.diagnoses_complications && (
                  <SessionField label="Diagnósticos y complicaciones" text={session.diagnoses_complications} />
                )}
                {session.procedures && (
                  <SessionField label="Procedimientos" text={session.procedures} />
                )}
                {session.prescriptions && (
                  <SessionField label="Prescripciones" text={session.prescriptions} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SessionField({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  )
}
