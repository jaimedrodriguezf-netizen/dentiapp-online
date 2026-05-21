'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Save,
  ClipboardList, Stethoscope, Heart, Activity, FileText,
  User, BookOpen, Syringe, GraduationCap, ArrowUp, Grid3X3
} from 'lucide-react'
import CIESearch from './CIESearch'
import VitalSignsSection from './VitalSignsSection'
import MedicalHistoryCheckboxes from './MedicalHistoryCheckboxes'
import ComplementaryExams from './ComplementaryExams'
import TreatmentSessionManager from './TreatmentSessionManager'
import OdontogramEditor from './OdontogramEditor'
import {
  OralHygieneFields, FluorosisField, MalocclusionFields,
  StomatognathicFields, IndiceField
} from './OralExamSection'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  { id: 'patient', label: 'Motivo y Enfermedad', icon: User },
  { id: 'antecedentes', label: 'Antecedentes', icon: BookOpen },
  { id: 'vitals', label: 'Signos Vitales', icon: Heart },
  { id: 'estomatognatico', label: 'Examen Estomatognático', icon: Activity },
  { id: 'odontograma', label: 'Odontograma', icon: Grid3X3 },
  { id: 'indices', label: 'Higiene e Índices', icon: ClipboardList },
  { id: 'examenes', label: 'Exámenes', icon: Syringe },
  { id: 'diagnostico', label: 'Diagnóstico (CIE-10)', icon: Stethoscope },
  { id: 'plan', label: 'Planes Educativo y Diagnóstico', icon: GraduationCap },
  { id: 'tratamiento', label: 'Plan de Tratamiento', icon: FileText },
]

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface PersonalHistoryData {
  allergy_antibiotic?: boolean
  allergy_anesthesia?: boolean
  hemorrhages?: boolean
  hiv?: boolean
  tuberculosis?: boolean
  asthma?: boolean
  diabetes?: boolean
  hypertension?: boolean
  heart_disease?: boolean
  other?: boolean
  other_text?: string
}

interface FamilyHistoryData {
  cardiopathy?: boolean
  hypertension?: boolean
  vascular_disease?: boolean
  endocrine?: boolean
  cancer?: boolean
  tuberculosis?: boolean
  mental_illness?: boolean
  infectious_disease?: boolean
  malformation?: boolean
  other?: boolean
  other_text?: string
}

interface VitalSignsData {
  blood_pressure?: string
  heart_rate?: number
  respiratory_rate?: number
  temperature?: number
  spo2?: number
  weight?: number
  height?: number
  bmi?: number
}

interface Props {
  slug: string
  createAction: (fd: globalThis.FormData) => Promise<void>
  patientId?: string
  patientName?: string
  defaultPersonalHistory?: PersonalHistoryData
  defaultFamilyHistory?: FamilyHistoryData
  defaultVitalSigns?: VitalSignsData
}

export default function Form033Wizard({
  createAction,
  defaultPersonalHistory,
  defaultFamilyHistory,
  defaultVitalSigns,
  patientId,
  patientName,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('patient')
  const [teeth, setTeeth] = useState<ToothData[]>([])
  
  // Ref for the form to use native FormData on submission
  const formRef = useRef<HTMLFormElement>(null)

  // Use IntersectionObserver instead of scroll event listener
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.2, rootMargin: '-80px 0px -20% 0px' }
    )

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  async function handleFormSubmission(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!formRef.current) return
    setSaving(true)
    
    try {
      // Use native FormData from the form element
      const fd = new globalThis.FormData(formRef.current)
      
      // Manual additions for complex state not easily captured by standard inputs
      fd.set('odontogram_teeth', JSON.stringify(teeth))

      // Default unfilled stomatognathic region findings to 'S.P.A.'
      const stomatognathicVal = fd.get('stomatognathic_exam') as string
      if (stomatognathicVal) {
        const parsed = JSON.parse(stomatognathicVal)
        const updatedRegions = parsed.regions.map((r: { id: string; finding: string }) => ({
          ...r,
          finding: r.finding.trim() === '' ? 'S.P.A.' : r.finding
        }))
        fd.set('stomatognathic_exam', JSON.stringify({ ...parsed, regions: updatedRegions }))
      }

      await createAction(fd)
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setSaving(false)
    }
  }

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [])

  return (
    <div className="relative flex flex-col lg:flex-row gap-8">
      {/* Sticky Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-2 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-4">Navegación</p>
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.id
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{s.label}</span>
              </button>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full btn btn-primary rounded-xl font-black bg-green-600 hover:bg-green-700 border-none text-white shadow-lg shadow-green-100"
            >
              {saving ? 'Guardando...' : 'Finalizar Todo'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Unified Form */}
      <div className="flex-1 min-w-0 space-y-12 pb-24 lg:pb-0">
        <form ref={formRef} className="space-y-12" onSubmit={handleFormSubmission}>
          
          {/* Patient banner (when creating from patient profile) */}
          {patientName && (
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">{patientName}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Formulario 033 — MSP</p>
              </div>
            </div>
          )}

          {/* SECTION: Motivo y Enfermedad */}
          <section id="patient" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={User} title="1 y 2. Motivo de Consulta y Enfermedad Actual" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-5">
                <FieldGroup label="Motivo de consulta (Palabras del paciente)">
                  <textarea
                    name="consultation_reason"
                    placeholder="Ej: 'Me duele el diente de arriba hace dos días'"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    rows={2}
                  />
                </FieldGroup>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">¿Paciente embarazada?</label>
                  <div className="flex gap-4">
                    {['true', 'false'].map((v) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="pregnant"
                          value={v}
                          className="radio radio-primary radio-sm"
                        />
                        <span className="text-sm font-bold text-gray-700">{v === 'true' ? 'Sí' : 'No'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <FieldGroup label="Enfermedad o Problema Actual">
                <textarea
                  name="current_problem"
                  placeholder="Cronología, localización, características, intensidad, causa aparente..."
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all h-full"
                  rows={5}
                />
              </FieldGroup>
            </div>
          </section>

          {/* SECTION: Antecedentes y Signos Vitales */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <section id="antecedentes" className="scroll-mt-24 space-y-6">
              <SectionHeader icon={BookOpen} title="3. Antecedentes" />
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm h-full">
                <MedicalHistoryCheckboxes
                  defaultPersonal={defaultPersonalHistory}
                  defaultFamily={defaultFamilyHistory}
                />
              </div>
            </section>

            <section id="vitals" className="scroll-mt-24 space-y-6">
              <SectionHeader icon={Heart} title="4. Signos Vitales" />
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm h-full">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <VitalSignsSection defaultValues={defaultVitalSigns} />
                </div>
              </div>
            </section>
          </div>

          {/* SECTION: Estomatognático */}
          <section id="estomatognatico" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={Activity} title="5. Examen del Sistema Estomatognático" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm">
              <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase">* Se recomienda registrar hallazgos o &apos;S.P.A.&apos;</p>
              <StomatognathicFields />
            </div>
          </section>

          {/* SECTION: Odontograma */}
          <section id="odontograma" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={Activity} title="6. Odontograma" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-2 md:p-8 shadow-sm overflow-hidden">
              <OdontogramEditor initialTeeth={teeth} onTeethChange={setTeeth} />
            </div>
          </section>

          {/* SECTION: Índices */}
          <section id="indices" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={ClipboardList} title="7 y 8. Indicadores de Salud Bucal e Índices" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8">
              <SubSection title="Higiene Oral Simplificada">
                <OralHygieneFields />
              </SubSection>
              <SubSection title="Enfermedad periodontal">
                <select
                  name="periodontal_disease"
                  defaultValue=""
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                >
                  <option value="">Normal</option>
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="severa">Severa</option>
                </select>
              </SubSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubSection title="Fluorosis">
                  <FluorosisField />
                </SubSection>
                <SubSection title="Maloclusión">
                  <MalocclusionFields />
                </SubSection>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <SubSection title="CPO-D (Permanente)">
                  <IndiceField prefix="cpod" />
                </SubSection>
                <SubSection title="ceo-d (Decidua)">
                  <IndiceField prefix="ceod" />
                </SubSection>
              </div>
            </div>
          </section>

          {/* SECTION: Exámenes */}
          <section id="examenes" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={Syringe} title="10. Planes de Diagnóstico y Exámenes" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm">
              <ComplementaryExams />
            </div>
          </section>

          {/* SECTION: Diagnóstico */}
          <section id="diagnostico" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={Stethoscope} title="11. Diagnóstico (CIE-10)" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Buscar código o descripción</label>
                <DiagnosisSelector />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FieldGroup label="Tipo de diagnóstico">
                    <select
                      name="diagnosis_type"
                      className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="">Seleccioná...</option>
                      <option value="presuntivo">Presuntivo</option>
                      <option value="definitivo">Definitivo</option>
                    </select>
                 </FieldGroup>
                 <FieldGroup label="Notas clínicas">
                  <textarea
                    name="diagnosis_notes"
                    placeholder="Observaciones adicionales..."
                    className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    rows={1}
                  />
                </FieldGroup>
              </div>
            </div>
          </section>

          {/* SECTION: Plan Educativo */}
          <section id="plan" className="scroll-mt-24 space-y-6">
            <SectionHeader icon={GraduationCap} title="Planes Educativo y Diagnóstico" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup label="Plan educativo">
                <textarea
                  name="educational_plan"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  rows={3}
                />
              </FieldGroup>
              <FieldGroup label="Plan diagnóstico">
                <textarea
                  name="diagnostic_plan"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  rows={3}
                />
              </FieldGroup>
            </div>
          </section>

          {/* SECTION: Tratamiento */}
          <section id="tratamiento" className="scroll-mt-24 pb-24 space-y-6">
            <SectionHeader icon={FileText} title="12. Plan de Tratamiento y Evolución" />
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Plan terapéutico">
                  <textarea
                    name="therapeutic_plan"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    rows={3}
                  />
                </FieldGroup>
                <FieldGroup label="Tratamiento realizado">
                  <textarea
                    name="treatment"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    rows={3}
                  />
                </FieldGroup>
              </div>
              <TreatmentSessionManager />
            </div>
          </section>
        </form>
      </div>

      {/* Floating Save Button & Progress (Mobile/Global) */}
      <div className="fixed bottom-20 right-6 lg:bottom-6 flex flex-col gap-3 z-50">
        <AnimatePresence>
          {activeSection !== 'patient' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-circle bg-white border border-gray-200 shadow-xl text-gray-500 hover:bg-gray-50"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <button
          type="button"
          onClick={() => handleFormSubmission()}
          disabled={saving}
          className="btn btn-primary h-16 px-8 rounded-full font-black text-lg shadow-2xl shadow-blue-500/40 flex items-center gap-3"
        >
          {saving ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <Save className="w-6 h-6" />
              <span>Guardar Todo</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom navigation for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-2 flex justify-around items-center z-40 overflow-x-auto gap-4 px-6 scrollbar-hide">
        {SECTIONS.map((s) => {
           const isActive = activeSection === s.id
           const Icon = s.icon
           return (
             <button
               key={s.id}
               type="button"
               onClick={() => scrollTo(s.id)}
               className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
             >
               <Icon className="w-5 h-5" />
               <span className="text-[8px] font-black uppercase tracking-tighter">{s.label.split(' ')[0]}</span>
             </button>
           )
        })}
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
      <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-gray-100">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
        {label}
      </label>
      {children}
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50/30 p-5 rounded-[24px] border border-gray-100">
      <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">{title}</h4>
      {children}
    </div>
  )
}

function DiagnosisSelector() {
  const [selection, setSelection] = useState({ code: '', desc: '' })
  
  return (
    <div className="space-y-4">
      <CIESearch
        onSelect={(code, desc) => setSelection({ code, desc })}
      />
      {selection.code && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div>
            <span className="text-[10px] font-black text-blue-600 block uppercase">Seleccionado:</span>
            <span className="text-xs font-bold text-blue-900">{selection.code} - {selection.desc}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSelection({ code: '', desc: '' })}
            className="text-[10px] font-black text-blue-400 hover:text-blue-600 uppercase"
          >
            Cambiar
          </button>
        </div>
      )}
      <input name="diagnosis_code" type="hidden" value={selection.code} readOnly />
      <input name="diagnosis_description" type="hidden" value={selection.desc} readOnly />
    </div>
  )
}
