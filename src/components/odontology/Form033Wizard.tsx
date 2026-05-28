'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Save,
  ClipboardList, Stethoscope, Heart, Activity, FileText,
  User, BookOpen, Syringe, GraduationCap, ArrowUp, Grid3X3,
  Plus, Trash2, Zap
} from 'lucide-react'
import CIESearch from './CIESearch'
import VitalSignsSection from './VitalSignsSection'
import MedicalHistoryCheckboxes from './MedicalHistoryCheckboxes'
import ComplementaryExams from './ComplementaryExams'
import TreatmentSessionManager from './TreatmentSessionManager'
import OdontogramEditor from './OdontogramEditor'
import VademecumSearch from './VademecumSearch'
import {
  OralHygieneFields, FluorosisField, MalocclusionFields,
  StomatognathicFields, IndiceField
} from './OralExamSection'
import { isDeciduous } from './OdontogramSVG'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveToothSelector from './InteractiveToothSelector'
import DiagnosesListManager from './DiagnosesListManager'

const FDI_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
  85, 84, 83, 82, 81, 71, 72, 73, 74, 75,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
]

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

interface PrescriptionItem {
  id?: string
  medication_id?: string | null
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: number | null
}

interface PrescriptionTemplate {
  name: string
  icon: string
  items: PrescriptionItem[]
}

const prescriptionTemplates: PrescriptionTemplate[] = [
  {
    name: 'Post-Extracción',
    icon: '🦷',
    items: [
      { medication_name: 'Ibuprofeno', dosage: '600mg', frequency: 'c/8h', duration: '3 días', instructions: 'Tomar después de las comidas', quantity: 10 },
      { medication_name: 'Amoxicilina', dosage: '500mg', frequency: 'c/8h', duration: '7 días', instructions: 'Completar el ciclo de antibiótico', quantity: 21 },
    ]
  },
  {
    name: 'Infección Leve',
    icon: '🦠',
    items: [
      { medication_name: 'Amoxicilina + Ácido Clavulánico', dosage: '875/125mg', frequency: 'c/12h', duration: '7 días', instructions: 'Tomar con abundante agua', quantity: 14 },
      { medication_name: 'Paracetamol', dosage: '1g', frequency: 'c/8h', duration: '3 días', instructions: 'En caso de dolor o fiebre', quantity: 10 },
    ]
  },
  {
    name: 'Gingivitis/Periodontitis',
    icon: '👄',
    items: [
      { medication_name: 'Clorhexidina colutorio 0.12%', dosage: '15ml', frequency: 'c/12h', duration: '15 días', instructions: 'Enjuagar durante 30 segundos, no ingerir', quantity: 1 },
    ]
  }
]

interface Props {
  slug: string
  createAction: (fd: globalThis.FormData) => Promise<void>
  patientId?: string
  patientName?: string
  patientGender?: string | null
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
  patientGender,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('patient')
  const [teeth, setTeeth] = useState<ToothData[]>([])
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [pregnant, setPregnant] = useState<string>('false')

  useEffect(() => {
    if (patientGender?.toLowerCase().startsWith('m')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPregnant('false')
    }
  }, [patientGender])

  const calculatedIndices = useMemo(() => {
    const cpod = { caries: 0, missing: 0, filled: 0, total: 0 }
    const ceod = { caries: 0, missing: 0, filled: 0, total: 0 }

    teeth.forEach((tooth) => {
      const isDec = isDeciduous(tooth.tooth_number)

      let hasCaries = false
      let isMissing = false
      let isFilled = false

      if (tooth.surfaces) {
        const surfaceStatuses = Object.values(tooth.surfaces)
        hasCaries = surfaceStatuses.includes('caries')
        isFilled = surfaceStatuses.includes('filling')
        isMissing = tooth.status === 'extraction_done' || tooth.status === 'extraction_indicated'
      } else {
        hasCaries = tooth.status === 'caries'
        isFilled = tooth.status === 'filling'
        isMissing = tooth.status === 'extraction_done' || tooth.status === 'extraction_indicated'
      }

      if (isDec) {
        if (hasCaries) ceod.caries++
        if (tooth.status === 'extraction_indicated' || tooth.status === 'extraction_done') ceod.missing++
        if (isFilled) ceod.filled++
      } else {
        if (hasCaries) cpod.caries++
        if (tooth.status === 'extraction_done' || tooth.status === 'extraction_indicated') cpod.missing++
        if (isFilled) cpod.filled++
      }
    })

    cpod.total = cpod.caries + cpod.missing + cpod.filled
    ceod.total = ceod.caries + ceod.missing + ceod.filled

    return { cpod, ceod }
  }, [teeth])

  function createEmptyPrescription(): PrescriptionItem {
    return {
      medication_id: null,
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: null,
    }
  }

  function handleAddPrescription() {
    setPrescriptions((prev) => [...prev, createEmptyPrescription()])
  }

  function handleRemovePrescription(index: number) {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index))
  }

  function handlePrescriptionChange(index: number, field: keyof PrescriptionItem, value: string | number | null) {
    setPrescriptions((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function applyPrescriptionTemplate(template: PrescriptionTemplate) {
    const isListEmpty = prescriptions.length === 0 || (prescriptions.length === 1 && !prescriptions[0].medication_name)
    if (isListEmpty) {
      setPrescriptions([...template.items])
    } else {
      setPrescriptions((prev) => [...prev, ...template.items])
    }
  }
  
  // Ref for the form to use native FormData on submission
  const formRef = useRef<HTMLFormElement>(null)
  const isProgrammaticSubmit = useRef(false)

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
    if (isProgrammaticSubmit.current) {
      return
    }

    if (e) e.preventDefault()
    
    if (!e || e.type !== 'submit') {
      if (formRef.current) {
        isProgrammaticSubmit.current = true
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true })
        formRef.current.dispatchEvent(submitEvent)
        isProgrammaticSubmit.current = false
        if (submitEvent.defaultPrevented) {
          return
        }
      }
    } else if (e && e.defaultPrevented) {
      return
    }

    if (!formRef.current) return
    setSaving(true)
    
    try {
      // Use native FormData from the form element
      const fd = new globalThis.FormData(formRef.current)
      
      // Manual additions for complex state not easily captured by standard inputs
      fd.set('odontogram_teeth', JSON.stringify(teeth))
      fd.set('prescriptions', JSON.stringify(prescriptions.filter(p => p.medication_name.trim())))

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
                    {['true', 'false'].map((v) => {
                      const isMale = patientGender?.toLowerCase().startsWith('m')
                      return (
                        <label key={v} className={`flex items-center gap-2 cursor-pointer ${isMale ? 'opacity-50' : ''}`}>
                          <input
                            type="radio"
                            name="pregnant"
                            value={v}
                            checked={pregnant === v}
                            onChange={(e) => {
                              if (!isMale) setPregnant(e.target.value)
                            }}
                            disabled={isMale}
                            className="radio radio-primary radio-sm"
                          />
                          <span className="text-sm font-bold text-gray-700">{v === 'true' ? 'Sí' : 'No'}</span>
                        </label>
                      )
                    })}
                  </div>
                  {patientGender?.toLowerCase().startsWith('m') && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">
                      No aplica (Paciente Masculino)
                    </span>
                  )}
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
                  <IndiceField prefix="cpod" values={calculatedIndices.cpod} readOnly />
                </SubSection>
                <SubSection title="ceo-d (Decidua)">
                  <IndiceField prefix="ceod" values={calculatedIndices.ceod} readOnly />
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
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-sm">
              <DiagnosesListManager />
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

              {/* Subsección: Receta Médica */}
              <div className="pt-8 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Receta Médica
                  </h4>
                </div>

                {/* Plantillas Rápidas */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Recetas Rápidas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prescriptionTemplates.map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => applyPrescriptionTemplate(template)}
                        className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                      >
                        <span>{template.icon}</span>
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listado de Medicamentos */}
                <div className="space-y-4">
                  {prescriptions.map((item, index) => (
                    <div key={index} className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">
                            {index + 1}
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Medicamento
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <VademecumSearch
                          defaultValue={item.medication_name}
                          onSelect={(id, name) => {
                            handlePrescriptionChange(index, 'medication_id', id || null)
                            handlePrescriptionChange(index, 'medication_name', name)
                          }}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dosis</label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                              placeholder="Ej: 500mg"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frecuencia</label>
                            <input
                              type="text"
                              value={item.frequency}
                              onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                              placeholder="Ej: c/8h"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duración</label>
                            <input
                              type="text"
                              value={item.duration}
                              onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                              placeholder="Ej: 7 días"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                            <input
                              type="number"
                              value={item.quantity ?? ''}
                              onChange={(e) => handlePrescriptionChange(index, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Ej: 14"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Indicaciones Adicionales</label>
                          <input
                            type="text"
                            value={item.instructions}
                            onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                            placeholder="Ej: Tomar después del almuerzo..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-6 py-3 text-sm font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Medicamento
                </button>

                <input
                  type="hidden"
                  name="prescriptions"
                  value={JSON.stringify(prescriptions.filter((p) => p.medication_name.trim()))}
                  readOnly
                />
              </div>
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
