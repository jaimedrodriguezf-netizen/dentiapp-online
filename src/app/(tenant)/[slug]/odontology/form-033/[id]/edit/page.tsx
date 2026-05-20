import { getDentalRecord, updateDentalRecord, getOdontogramTeeth, getTreatmentSessions } from '../../../actions'
import Link from 'next/link'
import { ArrowLeft, Activity, Edit, Save, X, Info, ClipboardList, Stethoscope, Baby } from 'lucide-react'
import CIESearch from '@/components/odontology/CIESearch'
import PrescriptionManager from '@/components/odontology/PrescriptionManager'
import VitalSignsSection from '@/components/odontology/VitalSignsSection'
import OdontogramSVG from '@/components/odontology/OdontogramSVG'
import MedicalHistoryCheckboxes from '@/components/odontology/MedicalHistoryCheckboxes'
import ComplementaryExams from '@/components/odontology/ComplementaryExams'
import { OralHygieneFields, FluorosisField, MalocclusionFields, StomatognathicFields, IndiceField } from '@/components/odontology/OralExamSection'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

interface DiagnosisData {
  code?: string
  description?: string
  text?: string
  type?: string
}

interface DentalRecord {
  id: string
  consultation_reason: string | { text: string } | null
  current_problem: string | { text: string } | null
  personal_family_history: string | { text: string } | null
  diagnostic_plan: string | { text: string } | null
  therapeutic_plan: string | { text: string } | null
  educational_plan: string | { text: string } | null
  treatment: string | { text: string } | null
  diagnosis: DiagnosisData | null
  vital_signs: Record<string, string | number> | null
  stomatognathic_exam: string | Record<string, unknown> | null
  oral_hygiene: { rating?: string; plaque_index?: number } | null
  fluorosis: string | null
  malocclusion: string | null
  cpod_index: Record<string, number> | null
  ceod_index: Record<string, number> | null
  pregnant: boolean | null
  personal_history: Record<string, boolean | string> | null
  family_history: Record<string, boolean | string> | null
  periodontal_disease: string | null
  complementary_exams: Record<string, string> | null
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

export default async function EditForm033Page({ params }: Props) {
  const { slug, id } = await params
  const recordRaw = await getDentalRecord(slug, id)
  const teethRaw = await getOdontogramTeeth(slug, id)
  const sessionsRaw = await getTreatmentSessions(slug, id)

  if (!recordRaw) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-2xl font-black text-gray-900">Historia clínica no encontrada</h2>
        <Link href={`/${slug}/admission/patients`} className="btn btn-primary mt-6 rounded-2xl font-black shadow-lg shadow-primary/20">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  const record = recordRaw as unknown as DentalRecord
  const teeth = (teethRaw as unknown as ToothData[]) || []
  const sessions = (sessionsRaw as unknown as TreatmentSessionData[]) || []

  const getText = (val: string | { text: string } | null): string => {
    if (!val) return ''
    return typeof val === 'object' ? val.text : val
  }

  const mal = (() => {
    if (!record.malocclusion) return { class: '', overjet: '', overbite: '' }
    try { 
      const parsed = JSON.parse(record.malocclusion)
      return {
        class: parsed.class || '',
        overjet: parsed.overjet?.toString() || '',
        overbite: parsed.overbite?.toString() || ''
      }
    } catch { return { class: '', overjet: '', overbite: '' } }
  })()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header adaptable */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/odontology/form-033/${id}`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate">Editar Ficha</h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">Formulario 033 — MSP</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/${slug}/odontology/form-033/${id}`}
            className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200 hidden md:flex"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Link>
        </div>
      </div>

      <form action={async (fd: FormData) => {
        'use server'
        await updateDentalRecord(slug, id, fd)
      }} className="space-y-6">
        
        {/* Contenido Principal con Card Estilizada */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-3xl">
          <div className="card-body p-5 md:p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Información de Consulta</h3>
            </div>

            {/* A: Motivo de consulta */}
            <SectionEdit
              title="1. Motivo de consulta"
              name="consultation_reason"
              value={getText(record.consultation_reason)}
            />
            
            {/* C: Problema actual */}
            <SectionEdit
              title="2. Problema actual"
              name="current_problem"
              value={getText(record.current_problem)}
              rows={4}
            />

            {/* B: Embarazada */}
            <div className="pt-4 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                3. ¿Paciente embarazada?
              </label>
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pregnant"
                    value="true"
                    defaultChecked={record.pregnant === true}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-sm font-bold text-gray-700">Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pregnant"
                    value="false"
                    defaultChecked={record.pregnant === false}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="text-sm font-bold text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* D + E: Antecedentes */}
            <div className="pt-4 border-t border-gray-50 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                4. Antecedentes Patológicos
              </h3>
              <MedicalHistoryCheckboxes
                defaultPersonal={record.personal_history as Record<string, boolean | string> | undefined}
                defaultFamily={record.family_history as Record<string, boolean | string> | undefined}
              />
            </div>

            {/* Antecedentes texto libre legacy */}
            {getText(record.personal_family_history) && (
              <SectionEdit
                title="Antecedentes personales y familiares (notas)"
                name="personal_family_history"
                value={getText(record.personal_family_history)}
                rows={3}
              />
            )}

            {/* F: Signos vitales */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                5. Signos vitales
              </h3>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <VitalSignsSection defaultValues={record.vital_signs as Record<string, string | number>} />
              </div>
            </div>

            {/* G: Examen estomatognático */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                6. Examen Estomatognático
              </h3>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <StomatognathicFields
                  defaultValue={
                    typeof record.stomatognathic_exam === 'string'
                      ? JSON.parse(record.stomatognathic_exam)
                      : (record.stomatognathic_exam as { regions?: Array<{ id: string; finding: string }>; free_text?: string } | undefined)
                  }
                />
              </div>
            </div>

            {/* I: Salud Bucal */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                7. Salud Bucal
              </h3>
              <div className="space-y-6">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Higiene oral</h4>
                  <OralHygieneFields
                    defaultRating={record.oral_hygiene?.rating}
                    defaultPlaqueIndex={record.oral_hygiene?.plaque_index?.toString()}
                  />
                </div>

                {/* Enfermedad periodontal */}
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Enfermedad periodontal</h4>
                  <select
                    name="periodontal_disease"
                    defaultValue={record.periodontal_disease || ''}
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="">Normal</option>
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="severa">Severa</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Fluorosis</h4>
                    <FluorosisField defaultValue={record.fluorosis || ''} />
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Maloclusión</h4>
                    <MalocclusionFields
                      defaultClass={mal.class}
                      defaultOverjet={mal.overjet}
                      defaultOverbite={mal.overbite}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* J: Índices */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                8. Índices CPO-D / CEO-D
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Permanente</h4>
                  <IndiceField prefix="cpod" defaultValues={record.cpod_index as Record<string, number>} />
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Decidua</h4>
                  <IndiceField prefix="ceod" defaultValues={record.ceod_index as Record<string, number>} />
                </div>
              </div>
            </div>

            {/* L: Exámenes Complementarios */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                9. Exámenes Complementarios
              </h3>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <ComplementaryExams defaults={record.complementary_exams as Record<string, string> | undefined} />
              </div>
            </div>

            {/* N: Diagnóstico */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                10. Diagnóstico (CIE-10)
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Código o Descripción</label>
                  <CIESearch
                    defaultCode={record.diagnosis?.code || ''}
                    defaultDescription={record.diagnosis?.description || ''}
                  />
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Tipo de diagnóstico</label>
                  <select
                    name="diagnosis_type"
                    defaultValue={record.diagnosis?.type || ''}
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  >
                    <option value="">Seleccioná...</option>
                    <option value="presuntivo">Presuntivo</option>
                    <option value="definitivo">Definitivo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Notas Clínicas</label>
                  <textarea
                    name="diagnosis_notes"
                    defaultValue={record.diagnosis?.text || ''}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    rows={4}
                    placeholder="Escribí notas adicionales aquí..."
                  />
                </div>
              </div>
            </div>

            {/* Planes */}
            <div className="space-y-6 pt-4 border-t border-gray-50">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                11. Planes
              </h3>
              <SectionEdit
                title="Plan diagnóstico"
                name="diagnostic_plan"
                value={getText(record.diagnostic_plan)}
                rows={3}
              />
              <SectionEdit
                title="Plan educativo"
                name="educational_plan"
                value={getText(record.educational_plan)}
                rows={3}
              />
              <SectionEdit
                title="Plan terapéutico"
                name="therapeutic_plan"
                value={getText(record.therapeutic_plan)}
                rows={3}
              />
              <SectionEdit
                title="12. Tratamiento realizado"
                name="treatment"
                value={getText(record.treatment)}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Sesiones de Tratamiento (read-only) */}
        {sessions.length > 0 && (
          <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
            <div className="card-body p-5 md:p-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Sesiones de Tratamiento
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Las sesiones se gestionan desde el formulario de nueva historia clínica
              </p>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5"
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
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnósticos y complicaciones</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.diagnoses_complications}</p>
                        </div>
                      )}
                      {session.procedures && (
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Procedimientos</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.procedures}</p>
                        </div>
                      )}
                      {session.prescriptions && (
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prescripciones</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.prescriptions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Bar para Escritorio */}
        <div className="hidden md:flex gap-4 px-8 pt-4">
          <button
            type="submit"
            className="btn btn-primary rounded-2xl font-black px-12 h-14 shadow-xl shadow-primary/20"
          >
            <Save className="w-5 h-5 mr-2" />
            GUARDAR TODO
          </button>
          <Link
            href={`/${slug}/odontology/form-033/${id}`}
            className="btn btn-ghost border-gray-200 rounded-2xl px-12 h-14 font-black"
          >
            CANCELAR
          </Link>
        </div>

        {/* Action Bar para Móvil (Sticky) */}
        <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 flex gap-3">
          <Link
            href={`/${slug}/odontology/form-033/${id}`}
            className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
          >
            ✕ CANCELAR
          </Link>
          <button
            type="submit"
            className="flex-[2] btn btn-primary rounded-2xl h-14 font-black shadow-xl shadow-primary/30"
          >
            <Save className="w-5 h-5 mr-2" />
            GUARDAR
          </button>
        </div>
      </form>

      {/* Odontograma (Solo lectura aquí, acceso a edición arriba) */}
      <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
        <div className="card-body p-5 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="w-6 h-6 text-red-500" />
              Estado Dental
            </h3>
            <Link
              href={`/${slug}/odontology/odontogram/${id}`}
              className="btn btn-ghost btn-sm rounded-xl font-black text-blue-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              EDITAR ODONTOGRAMA
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
             <div className="min-w-[700px] md:min-w-0 opacity-60 pointer-events-none">
                <OdontogramSVG teeth={teeth} />
             </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              El odontograma se edita en su propia pantalla para mayor precisión táctil. 
              Los cambios que hagas arriba no afectan al odontograma.
            </p>
          </div>
        </div>
      </div>

      {/* Prescription section */}
      <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
        <div className="card-body p-5 md:p-8">
          <PrescriptionManager slug={slug} recordId={id} />
        </div>
      </div>
    </div>
  )
}

function SectionEdit({ title, name, value, rows = 2 }: { title: string; name: string; value: string; rows?: number }) {
  return (
    <div className="group">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">{title}</label>
      <textarea
        name={name}
        defaultValue={value}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
        rows={rows}
        placeholder={`Completar ${title.toLowerCase()}...`}
      />
    </div>
  )
}
