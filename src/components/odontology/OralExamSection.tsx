'use client'

import { useState } from 'react'

/* ─── Oral Hygiene ─── */

interface OralHygieneProps {
  defaultRating?: string
  defaultPlaqueIndex?: string
}

export function OralHygieneFields({ defaultRating, defaultPlaqueIndex }: OralHygieneProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Higiene oral</label>
        <select
          name="oral_hygiene_rating"
          defaultValue={defaultRating || ''}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Seleccioná...</option>
          <option value="buena">Buena</option>
          <option value="regular">Regular</option>
          <option value="mala">Mala</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Índice de placa (O&apos;Leary)</label>
        <input
          type="number"
          name="oral_hygiene_plaque_index"
          defaultValue={defaultPlaqueIndex || ''}
          placeholder="0-100%"
          min="0"
          max="100"
          step="1"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

/* ─── Fluorosis (Dean Index) ─── */

interface FluorosisProps {
  defaultValue?: string
}

export function FluorosisField({ defaultValue }: FluorosisProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Fluorosis (Índice de Dean)</label>
      <select
        name="fluorosis"
        defaultValue={defaultValue || ''}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Normal</option>
        <option value="dudosa">Dudosa</option>
        <option value="muy_leve">Muy leve</option>
        <option value="leve">Leve</option>
        <option value="moderada">Moderada</option>
        <option value="severa">Severa</option>
      </select>
    </div>
  )
}

/* ─── Malocclusion ─── */

interface MalocclusionProps {
  defaultClass?: string
  defaultOverjet?: string
  defaultOverbite?: string
}

export function MalocclusionFields({ defaultClass, defaultOverjet, defaultOverbite }: MalocclusionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Clase</label>
        <select
          name="malocclusion_class"
          defaultValue={defaultClass || ''}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Sin maloclusión</option>
          <option value="clase_i">Clase I</option>
          <option value="clase_ii">Clase II</option>
          <option value="clase_iii">Clase III</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Overjet (mm)</label>
        <input
          type="number"
          name="malocclusion_overjet"
          defaultValue={defaultOverjet || ''}
          placeholder="0-10 mm"
          step="0.5"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Overbite (mm)</label>
        <input
          type="number"
          name="malocclusion_overbite"
          defaultValue={defaultOverbite || ''}
          placeholder="0-10 mm"
          step="0.5"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

/* ─── Stomatognathic Exam ─── */

interface StomatognathicProps {
  defaultValues?: string[]
}

const stomatognathicStructures = [
  { id: 'labios', label: 'Labios' },
  { id: 'mejillas', label: 'Mejillas' },
  { id: 'atm', label: 'ATM' },
  { id: 'musculos', label: 'Músculos masticatorios' },
  { id: 'piso_boca', label: 'Piso de boca' },
  { id: 'lengua', label: 'Lengua' },
  { id: 'paladar_duro', label: 'Paladar duro' },
  { id: 'paladar_blando', label: 'Paladar blando' },
  { id: 'gingival', label: 'Encía' },
  { id: 'periodontal', label: 'Periodontal' },
]

export function StomatognathicFields({ defaultValues }: StomatognathicProps) {
  const [selected, setSelected] = useState<string[]>(defaultValues || [])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
    // Update the hidden input
    const input = document.querySelector('input[name="stomatognathic_exam"]') as HTMLInputElement
    if (input) {
      const current = selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
      input.value = current.join(',')
    }
  }

  return (
    <div>
      <input type="hidden" name="stomatognathic_exam" defaultValue={selected.join(',')} />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stomatognathicStructures.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              selected.includes(s.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">Seleccioná las estructuras afectadas</p>
    </div>
  )
}

/* ─── CPO-D / CEO-D Indices ─── */

interface IndexProps {
  prefix: 'cpod' | 'ceod'
  defaultValues?: { caries?: number; missing?: number; filled?: number; extraction?: number }
}

export function IndiceField({ prefix, defaultValues }: IndexProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {prefix === 'cpod' ? 'Cariados (C)' : 'Cariados (C)'}
        </label>
        <input
          type="number"
          name={`${prefix}_caries`}
          defaultValue={defaultValues?.caries ?? ''}
          min="0"
          max="28"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {prefix === 'cpod' ? 'Perdidos (P)' : 'Extracción (E)'}
        </label>
        <input
          type="number"
          name={`${prefix}_missing`}
          defaultValue={defaultValues?.missing ?? defaultValues?.extraction ?? ''}
          min="0"
          max="28"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Obturados (O)</label>
        <input
          type="number"
          name={`${prefix}_filled`}
          defaultValue={defaultValues?.filled ?? ''}
          min="0"
          max="28"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
