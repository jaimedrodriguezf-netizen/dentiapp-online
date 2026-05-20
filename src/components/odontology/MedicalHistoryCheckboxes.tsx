'use client'

import { useState, useRef } from 'react'

interface MedicalHistoryCheckboxesProps {
  defaultPersonal?: {
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
  defaultFamily?: {
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
}

const personalHistoryItems = [
  { id: 'allergy_antibiotic', label: 'Alergia a antibiótico' },
  { id: 'allergy_anesthesia', label: 'Alergia a anestesia' },
  { id: 'hemorrhages', label: 'Hemorragias' },
  { id: 'hiv', label: 'VIH / SIDA' },
  { id: 'tuberculosis', label: 'Tuberculosis' },
  { id: 'asthma', label: 'Asma' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'Hipertensión arterial' },
  { id: 'heart_disease', label: 'Enfermedad cardíaca' },
  { id: 'other', label: 'Otro' },
]

const familyHistoryItems = [
  { id: 'cardiopathy', label: 'Cardiopatía' },
  { id: 'hypertension', label: 'Hipertensión arterial' },
  { id: 'vascular_disease', label: 'Enf. cardiovascular' },
  { id: 'endocrine', label: 'Endócrino metabólico' },
  { id: 'cancer', label: 'Cáncer' },
  { id: 'tuberculosis', label: 'Tuberculosis' },
  { id: 'mental_illness', label: 'Enf. mental' },
  { id: 'infectious_disease', label: 'Enf. infecciosa' },
  { id: 'malformation', label: 'Mal formación' },
  { id: 'other', label: 'Otro' },
]

function CheckboxGrid({
  title,
  items,
  defaults,
  hiddenName,
  onOtherText,
}: {
  title: string
  items: { id: string; label: string }[]
  defaults?: Record<string, boolean | string>
  hiddenName: string
  onOtherText?: (text: string) => void
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    items.forEach((item) => {
      initial[item.id] = !!defaults?.[item.id]
    })
    return initial
  })
  const [otherText, setOtherText] = useState(defaults?.other_text?.toString() || '')
  const hiddenRef = useRef<HTMLInputElement>(null)

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      if (hiddenRef.current) {
        hiddenRef.current.value = JSON.stringify(next)
      }
      return next
    })
  }

  function handleOtherTextChange(text: string) {
    setOtherText(text)
    onOtherText?.(text)
  }

  function uncheckAll() {
    const next: Record<string, boolean> = {}
    items.forEach(i => next[i.id] = false)
    setChecked(next)
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(next)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</h4>
        <button
          type="button"
          onClick={uncheckAll}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-white px-2 py-1 rounded border border-blue-100"
        >
          No refiere
        </button>
      </div>
      <input type="hidden" ref={hiddenRef} name={hiddenName} value={JSON.stringify(checked)} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              checked[item.id]
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                checked[item.id] ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}
            >
              {checked[item.id] && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
      {checked.other && (
        <div className="mt-3">
          <input
            type="text"
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Especificar..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      )}
    </div>
  )
}

export default function MedicalHistoryCheckboxes({
  defaultPersonal,
  defaultFamily,
}: MedicalHistoryCheckboxesProps) {
  const [personalOtherText, setPersonalOtherText] = useState(defaultPersonal?.other_text || '')
  const [familyOtherText, setFamilyOtherText] = useState(defaultFamily?.other_text || '')

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-gray-900 mb-3">Antecedentes Patológicos</h3>
        <CheckboxGrid
          title="Antecedentes Personales"
          items={personalHistoryItems}
          defaults={defaultPersonal}
          hiddenName="personal_history"
          onOtherText={setPersonalOtherText}
        />
        <input type="hidden" name="personal_history_other_text" defaultValue={personalOtherText} />
      </div>
      <div>
        <CheckboxGrid
          title="Antecedentes Familiares"
          items={familyHistoryItems}
          defaults={defaultFamily}
          hiddenName="family_history"
          onOtherText={setFamilyOtherText}
        />
        <input type="hidden" name="family_history_other_text" defaultValue={familyOtherText} />
      </div>
    </div>
  )
}
