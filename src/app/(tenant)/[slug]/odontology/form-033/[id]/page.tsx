import { getDentalRecord, getPrescriptions, getOdontogramTeeth, getTreatmentSessions, DiagnosisData, VitalSignsData, OralHygieneData, StomatognathicData, DentalRecordRow } from '../../actions'
import { parseSessionFeedbacks } from '../../sessionFeedbacksHelpers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Printer, Activity, FileText, Pill, Calendar, CreditCard, User, Baby, Stethoscope, ClipboardList } from 'lucide-react'
import OdontogramSVG from '@/components/odontology/OdontogramSVG'
import PrescriptionModalButton from '@/components/odontology/PrescriptionModalButton'
import TreatmentSessionModalButton from '@/components/odontology/TreatmentSessionModalButton'
import SessionFeedbacksSection from '@/components/odontology/SessionFeedbacksSection'

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
  diagnosis: DiagnosisData | DiagnosisData[] | null
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
          <PrescriptionModalButton slug={slug} recordId={id} hasPrescriptions={prescriptions.length > 0} variant="default" />
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
              oralHygiene={record.oral_hygiene as OralHygieneData | null}
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
      <TreatmentSessionsDisplay slug={slug} recordId={id} sessions={sessions} />

      {/* Recetas */}
      {prescriptions.length > 0 ? (
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
          <div className="card-body p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Receta Médica
              </h3>
              <div className="flex gap-2">
                <Link
                  href={`/${slug}/odontology/form-033/${id}/print?type=prescription`}
                  target="_blank"
                  className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Receta
                </Link>
                <PrescriptionModalButton slug={slug} recordId={id} hasPrescriptions={true} variant="icon-only" />
              </div>
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
      ) : (
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
          <div className="card-body p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Receta Médica</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                No se han registrado recetas para esta ficha. Creá un recetario con medicamentos, dosis e indicaciones.
              </p>
            </div>
            <div className="pt-2">
              <PrescriptionModalButton slug={slug} recordId={id} hasPrescriptions={false} variant="cta" />
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
                <OdontogramSVG teeth={teeth} variant="msp" />
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
          <>
            <PrescriptionModalButton slug={slug} recordId={id} hasPrescriptions={false} variant="mobile" />
            <Link
              href={`/${slug}/odontology/form-033/${id}/print`}
              className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
            >
              <Printer className="w-5 h-5" />
              IMPRIMIR
            </Link>
          </>
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

function DiagnosisSection({ content }: { content: DiagnosisData | DiagnosisData[] | null }) {
  if (!content) return null

  const items = Array.isArray(content) ? content : [content]
  if (items.length === 0) return null

  return (
    <div className="pt-4 border-t border-gray-50 space-y-4">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Diagnósticos (Sección 10)</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const code = item.code
          const description = item.description
          const notes = item.text
          const type = item.type

          return (
            <div key={index} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 space-y-2">
              {(code || type || description || item.pieza_dental || (item.caras_afectadas && item.caras_afectadas.length > 0)) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {code && (
                    <span className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-blue-200">
                      {code}
                    </span>
                  )}
                  {type && (
                    <span className="inline-flex items-center rounded-lg bg-gray-200 px-2.5 py-0.5 text-[10px] font-black text-gray-600 uppercase tracking-wider">
                      {type}
                    </span>
                  )}
                  {description && <span className="text-sm font-bold text-gray-700">{description}</span>}
                  {item.pieza_dental && (
                    <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wider border border-blue-100">
                      {Array.isArray(item.pieza_dental)
                        ? `Piezas: ${item.pieza_dental.join(', ')}`
                        : `Pieza ${item.pieza_dental}`}
                    </span>
                  )}
                  {item.caras_afectadas && item.caras_afectadas.length > 0 && (
                    <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-0.5 text-[10px] font-black text-purple-700 uppercase tracking-wider border border-purple-100">
                      Caras: {item.caras_afectadas.join(', ')}
                    </span>
                  )}
                </div>
              )}
              {notes && <p className="text-sm text-gray-600 whitespace-pre-wrap italic">{notes}</p>}
            </div>
          )
        })}
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
  oralHygiene: OralHygieneData | null
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

  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
  
  const hasOlearyData = oralHygiene?.oleary_data && Object.keys(oralHygiene.oleary_data).length > 0

  const renderOlearyTooth = (toothNumber: number) => {
    const toothState = oralHygiene?.oleary_data?.[toothNumber] || {
      absent: false,
      surfaces: { V: false, L: false, M: false, D: false }
    }
    const isAbsent = toothState.absent
    const surfaces = toothState.surfaces || { V: false, L: false, M: false, D: false }

    return (
      <div key={toothNumber} className="flex flex-col items-center gap-1.5 p-1.5 bg-gray-50/50 rounded-xl border border-gray-100 min-w-[44px] select-none">
        <span className="text-[9px] font-black text-gray-500">{toothNumber}</span>
        <div className={`relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 transition-all ${isAbsent ? 'opacity-30 bg-gray-100 pointer-events-none' : 'bg-white'}`}>
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <defs>
              <clipPath id={`clip-view-${toothNumber}`}>
                <circle cx="20" cy="20" r="20" />
              </clipPath>
            </defs>
            <g clipPath={`url(#clip-view-${toothNumber})`}>
              {/* Vestibular (V) - Superior */}
              <path
                d="M 20 20 L 0 0 L 40 0 Z"
                fill={surfaces.V ? '#ef4444' : '#ffffff'}
                stroke="#e5e7eb"
                strokeWidth="0.75"
              />
              {/* Distal (D) - Derecho */}
              <path
                d="M 20 20 L 40 0 L 40 40 Z"
                fill={surfaces.D ? '#ef4444' : '#ffffff'}
                stroke="#e5e7eb"
                strokeWidth="0.75"
              />
              {/* Lingual/Palatino (L) - Inferior */}
              <path
                d="M 20 20 L 40 40 L 0 40 Z"
                fill={surfaces.L ? '#ef4444' : '#ffffff'}
                stroke="#e5e7eb"
                strokeWidth="0.75"
              />
              {/* Mesial (M) - Izquierdo */}
              <path
                d="M 20 20 L 0 40 L 0 0 Z"
                fill={surfaces.M ? '#ef4444' : '#ffffff'}
                stroke="#e5e7eb"
                strokeWidth="0.75"
              />
              {/* Division lines */}
              <line x1="0" y1="0" x2="40" y2="40" stroke="#d1d5db" strokeWidth="0.75" />
              <line x1="40" y1="0" x2="0" y2="40" stroke="#d1d5db" strokeWidth="0.75" />
              {/* Center dot */}
              <circle cx="20" cy="20" r="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.75" />
            </g>
          </svg>
        </div>
        <span className={`text-[7px] font-black uppercase px-0.5 rounded leading-none ${isAbsent ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-700'}`}>
          {isAbsent ? 'Aus' : 'Pres'}
        </span>
      </div>
    )
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

      {/* Renderizado estático del Diagrama de O'Leary */}
      {hasOlearyData && (
        <div className="bg-gray-50/30 rounded-2xl p-4 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100/50 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Diagrama Clínico de O&apos;Leary</h4>
            </div>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Índice de Placa: {oralHygiene.plaque_index}%
            </span>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex flex-col gap-3 min-w-[760px] p-2 bg-white rounded-2xl border border-gray-100/80 shadow-2xs">
              {/* Arcada Superior */}
              <div className="flex justify-between items-center gap-1">
                {upperTeeth.map(renderOlearyTooth)}
              </div>
              <div className="h-px bg-dashed border-t border-gray-100" />
              {/* Arcada Inferior */}
              <div className="flex justify-between items-center gap-1">
                {lowerTeeth.map(renderOlearyTooth)}
              </div>
            </div>
          </div>
        </div>
      )}

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

function TreatmentSessionsDisplay({
  slug,
  recordId,
  sessions,
}: {
  slug: string
  recordId: string
  sessions: TreatmentSessionData[]
}) {
  const nextSessionNumber = sessions.length + 1

  // Ordenar cronológicamente descendente (lo más reciente primero)
  const sortedSessions = [...sessions].sort((a, b) => b.session_number - a.session_number)

  // Mostrar por defecto las 3 sesiones más recientes
  const visibleSessions = sortedSessions.slice(0, 3)
  const olderSessions = sortedSessions.slice(3)

  // parseSessionFeedbacks se importa de sessionFeedbacksHelpers.ts

  const renderSessionNode = (session: TreatmentSessionData) => {
    const formattedDate = session.session_date
      ? new Date(session.session_date).toLocaleDateString('es-EC', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Sin fecha'

    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks(session.diagnoses_complications)

    return (
      <div
        key={session.id}
        className="relative group transition-all"
      >
        {/* Timeline node badge centered on the vertical line */}
        <div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center border-4 border-white shadow-md shadow-blue-200 text-xs select-none">
          {session.session_number}
        </div>

        <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col space-y-4">
          {/* Session metadata header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 uppercase">
                Sesión {session.session_number}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden sm:inline" />
              <span className="text-xs font-bold text-gray-500">{formattedDate}</span>
            </div>
            {session.signature && (
              <span className="self-start sm:self-auto text-[9px] font-black text-blue-600 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Médico: {session.signature}
              </span>
            )}
          </div>

          {/* Timeline fields: highlight what treatment was performed */}
          <div className="grid grid-cols-1 gap-4">
            {/* TREATMENT performed (Primary highlight) */}
            <div className="bg-green-50/30 border-l-4 border-green-500 p-4 rounded-r-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-green-700 uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5" />
                Tratamientos / Procedimientos Realizados
              </div>
              <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap pl-0.5">
                {session.procedures || 'No se registraron procedimientos en esta sesión.'}
              </p>
            </div>

            {/* DIAGNOSES and complications */}
            {cleanDiagnosis && (
              <div className="bg-amber-50/30 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-700 uppercase tracking-widest">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Diagnósticos y Complicaciones
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap pl-0.5">
                  {cleanDiagnosis}
                </p>
              </div>
            )}

            {/* PRESCRIPTIONS */}
            {session.prescriptions && (
              <div className="bg-purple-50/30 border-l-4 border-purple-500 p-4 rounded-r-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-700 uppercase tracking-widest">
                  <Pill className="w-3.5 h-3.5" />
                  Prescripciones / Receta Asociada
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap pl-0.5">
                  {session.prescriptions}
                </p>
              </div>
            )}

            {/* Session feedbacks / notes component */}
            <SessionFeedbacksSection
              slug={slug}
              recordId={recordId}
              sessionId={session.id}
              initialFeedbacks={feedbacksList}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl overflow-hidden">
      <div className="card-body p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Línea de Tiempo de Evolución
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                Registro secuencial de sesiones y tratamientos ejecutados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 border border-blue-100">
              {sessions.length} {sessions.length === 1 ? 'Sesión' : 'Sesiones'}
            </span>
            <TreatmentSessionModalButton
              slug={slug}
              recordId={recordId}
              nextSessionNumber={nextSessionNumber}
            />
          </div>
        </div>

        {sessions.length > 0 ? (
          /* Timeline wrapper */
          <div className="relative border-l-2 border-blue-100 ml-4 md:ml-8 pl-6 md:pl-8 py-2 space-y-8">
            {/* 3 Sesiones más recientes siempre visibles */}
            {visibleSessions.map(renderSessionNode)}

            {/* Sesiones anteriores colapsables de forma interactiva y nativa */}
            {olderSessions.length > 0 && (
              <details className="group border-none outline-none">
                <summary className="list-none outline-none cursor-pointer flex items-center justify-start -ml-6 md:-ml-8 py-2">
                  <div className="flex items-center gap-3">
                    <span className="btn btn-outline btn-sm btn-primary rounded-full px-6 font-black text-xs uppercase tracking-wider shadow-sm group-open:hidden flex items-center gap-2 cursor-pointer">
                      Ver las {olderSessions.length} sesiones anteriores
                    </span>
                    <span className="btn btn-outline btn-sm btn-secondary rounded-full px-6 font-black text-xs uppercase tracking-wider shadow-sm hidden group-open:flex items-center gap-2 cursor-pointer">
                      Ocultar sesiones anteriores
                    </span>
                  </div>
                </summary>
                <div className="space-y-8 pt-6 animate-in fade-in slide-in-from-top-4 duration-200">
                  {olderSessions.map(renderSessionNode)}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50/40 rounded-[28px] border-2 border-dashed border-gray-200 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-gray-400" />
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
              No hay sesiones de tratamiento registradas
            </h4>
            <p className="text-[10px] text-gray-500 max-w-sm">
              Esta línea de tiempo muestra el historial progresivo de visitas del paciente. Hacé clic en **&quot;Registrar Evolución&quot;** para guardar el primer procedimiento de hoy.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
