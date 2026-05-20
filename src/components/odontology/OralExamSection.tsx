'use client'

import { useState, useRef } from 'react'

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
  defaultValue?: {
    regions?: Array<{ id: string; finding: string }>
    free_text?: string
  }
}

const mspRegions = [
  { id: 'labios', label: 'LABIOS' },
  { id: 'mejillas', label: 'MEJILLAS' },
  { id: 'maxilar_superior', label: 'MAXILAR SUPERIOR' },
  { id: 'maxilar_inferior', label: 'MAXILAR INFERIOR' },
  { id: 'lengua', label: 'LENGUA' },
  { id: 'paladar', label: 'PALADAR' },
  { id: 'piso_boca', label: 'PISO DE LA BOCA' },
  { id: 'carrillos', label: 'CARRILLOS' },
  { id: 'glandulas_salivales', label: 'GLÁNDULAS SALIVALES' },
  { id: 'oro_faringe', label: 'ORO FARINGE' },
  { id: 'atm', label: 'A.T.M.' },
  { id: 'ganglios', label: 'GANGLIOS' },
  { id: 'otros', label: 'OTROS' },
]

export function StomatognathicFields({ defaultValue }: StomatognathicProps) {
  const initRegions = mspRegions.map((r) => {
    const found = defaultValue?.regions?.find((d) => d.id === r.id)
    return { id: r.id, finding: found?.finding || '' }
  })

  const [regions, setRegions] = useState(initRegions)
  const serialized = JSON.stringify({ regions: regions, free_text: '' })

  function updateFinding(id: string, finding: string) {
    const next = regions.map((r) => (r.id === id ? { ...r, finding } : r))
    setRegions(next)
  }

  function markAllSPA() {
    const next = regions.map((r) => ({ ...r, finding: 'S.P.A.' }))
    setRegions(next)
  }

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="stomatognathic_exam"
        value={serialized}
        readOnly
      />
      <div className="flex justify-between items-center px-2">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Regiones MSP</p>
        <button
          type="button"
          onClick={markAllSPA}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
        >
          Marcar todo como S.P.A.
        </button>
      </div>
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-2">
        {mspRegions.map((r, i) => (
          <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 group">
            <span className="text-[10px] font-black text-gray-500 w-[140px] uppercase tracking-tight shrink-0">
              {i + 1}. {r.label}
            </span>
            <input
              type="text"
              value={regions.find((reg) => reg.id === r.id)?.finding || ''}
              onChange={(e) => updateFinding(r.id, e.target.value)}
              placeholder="Describir patología o 'S.P.A.'"
              className="flex-1 rounded-xl border-2 border-gray-100 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        ))}
      </div>
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
