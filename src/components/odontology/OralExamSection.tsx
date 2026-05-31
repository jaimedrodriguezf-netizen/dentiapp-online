'use client'

import { useState } from 'react'

/* ─── Oral Hygiene ─── */

interface OralHygieneProps {
  defaultRating?: string
  defaultPlaqueIndex?: string
  defaultPiezasPresentes?: number
  defaultSuperficiesEvaluadas?: number
  defaultSuperficiesConPlaca?: number
  defaultOlearyData?: Record<number, { absent: boolean; surfaces: Record<string, boolean> }>
}

const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const initialTeethList = [...upperTeeth, ...lowerTeeth]

interface ToothState {
  absent: boolean
  surfaces: Record<string, boolean>
}

interface ToothPlaqueCellProps {
  toothNumber: number
  state: ToothState
  onChange: (state: ToothState) => void
}

function ToothPlaqueCell({ toothNumber, state, onChange }: ToothPlaqueCellProps) {
  const toggleSurface = (surf: string) => {
    if (state.absent) return
    const nextSurfaces = { ...state.surfaces, [surf]: !state.surfaces[surf] }
    onChange({ ...state, surfaces: nextSurfaces })
  }

  const toggleAbsent = () => {
    const nextAbsent = !state.absent
    const nextSurfaces = nextAbsent 
      ? { V: false, L: false, M: false, D: false }
      : { V: false, L: false, M: false, D: false } // Reset surfaces on toggle
    onChange({ absent: nextAbsent, surfaces: nextSurfaces })
  }

  const isAbsent = state.absent

  return (
    <div className="flex flex-col items-center gap-1 p-1.5 bg-white border border-gray-150 rounded-xl shadow-xs hover:border-blue-200 transition-all select-none min-w-[48px]">
      <span className="text-[9px] font-black text-gray-500">{toothNumber}</span>
      
      <div className={`relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 transition-all ${isAbsent ? 'opacity-30 bg-gray-100 pointer-events-none' : 'bg-white'}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <clipPath id={`clip-${toothNumber}`}>
              <circle cx="20" cy="20" r="20" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${toothNumber})`}>
            {/* Vestibular (V) - Superior */}
            <path
              d="M 20 20 L 0 0 L 40 0 Z"
              data-testid={`tooth-${toothNumber}-surface-V`}
              fill={state.surfaces.V ? '#ef4444' : '#ffffff'}
              stroke="#e5e7eb"
              strokeWidth="0.75"
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => toggleSurface('V')}
            />
            {/* Distal (D) - Derecho */}
            <path
              d="M 20 20 L 40 0 L 40 40 Z"
              data-testid={`tooth-${toothNumber}-surface-D`}
              fill={state.surfaces.D ? '#ef4444' : '#ffffff'}
              stroke="#e5e7eb"
              strokeWidth="0.75"
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => toggleSurface('D')}
            />
            {/* Lingual/Palatino (L) - Inferior */}
            <path
              d="M 20 20 L 40 40 L 0 40 Z"
              data-testid={`tooth-${toothNumber}-surface-L`}
              fill={state.surfaces.L ? '#ef4444' : '#ffffff'}
              stroke="#e5e7eb"
              strokeWidth="0.75"
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => toggleSurface('L')}
            />
            {/* Mesial (M) - Izquierdo */}
            <path
              d="M 20 20 L 0 40 L 0 0 Z"
              data-testid={`tooth-${toothNumber}-surface-M`}
              fill={state.surfaces.M ? '#ef4444' : '#ffffff'}
              stroke="#e5e7eb"
              strokeWidth="0.75"
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => toggleSurface('M')}
            />

            {/* Division lines */}
            <line x1="0" y1="0" x2="40" y2="40" stroke="#d1d5db" strokeWidth="0.75" />
            <line x1="40" y1="0" x2="0" y2="40" stroke="#d1d5db" strokeWidth="0.75" />
            
            {/* Center dot */}
            <circle cx="20" cy="20" r="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.75" />
          </g>
        </svg>
      </div>

      <button
        type="button"
        data-testid={`tooth-${toothNumber}-toggle-absent`}
        onClick={toggleAbsent}
        className={`px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-tight transition-all border ${
          isAbsent
            ? 'bg-gray-100 text-gray-400 border-gray-200'
            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
        }`}
      >
        {isAbsent ? 'Aus' : 'Pres'}
      </button>
    </div>
  )
}

export function OralHygieneFields({
  defaultRating,
  defaultPiezasPresentes,
  defaultSuperficiesEvaluadas,
  defaultSuperficiesConPlaca,
  defaultOlearyData,
}: OralHygieneProps) {
  const [piezasPresentes, setPiezasPresentes] = useState<string>(defaultPiezasPresentes?.toString() || '32')
  const [superficiesEvaluadas, setSuperficiesEvaluadas] = useState<string>(defaultSuperficiesEvaluadas?.toString() || '128')
  const [superficiesConPlaca, setSuperficiesConPlaca] = useState<string>(defaultSuperficiesConPlaca?.toString() || '0')

  const [diagramState, setDiagramState] = useState<Record<number, ToothState>>(() => {
    if (defaultOlearyData && Object.keys(defaultOlearyData).length > 0) {
      const state: Record<number, ToothState> = {}
      initialTeethList.forEach((num) => {
        state[num] = defaultOlearyData[num] || {
          absent: false,
          surfaces: { V: false, L: false, M: false, D: false }
        }
      })
      return state
    }
    const init: Record<number, ToothState> = {}
    initialTeethList.forEach((num) => {
      init[num] = {
        absent: false,
        surfaces: { V: false, L: false, M: false, D: false }
      }
    })
    return init
  })

  // Sync if defaultOlearyData changes
  const [prevDefaultOlearyData, setPrevDefaultOlearyData] = useState(defaultOlearyData)
  if (defaultOlearyData !== prevDefaultOlearyData) {
    setPrevDefaultOlearyData(defaultOlearyData)
    if (defaultOlearyData && Object.keys(defaultOlearyData).length > 0) {
      const state: Record<number, ToothState> = {}
      initialTeethList.forEach((num) => {
        state[num] = defaultOlearyData[num] || {
          absent: false,
          surfaces: { V: false, L: false, M: false, D: false }
        }
      })
      setDiagramState(state)
    }
  }

  const handlePiezasChange = (val: string) => {
    setPiezasPresentes(val)
    if (val && !isNaN(parseInt(val))) {
      const num = parseInt(val)
      setSuperficiesEvaluadas((num * 4).toString())
    } else {
      setSuperficiesEvaluadas('')
    }
  }

  const calculateFromDiagram = (state: Record<number, ToothState>) => {
    let present = 0
    let withPlaque = 0
    initialTeethList.forEach((num) => {
      const tooth = state[num]
      if (!tooth.absent) {
        present++
        Object.values(tooth.surfaces).forEach((hasPlaque) => {
          if (hasPlaque) withPlaque++
        })
      }
    })
    return {
      present,
      evaluadas: present * 4,
      conPlaca: withPlaque
    }
  }

  const handleToothChange = (toothNumber: number, toothState: ToothState) => {
    const nextState = { ...diagramState, [toothNumber]: toothState }
    setDiagramState(nextState)
    
    const calcs = calculateFromDiagram(nextState)
    setPiezasPresentes(calcs.present.toString())
    setSuperficiesEvaluadas(calcs.evaluadas.toString())
    setSuperficiesConPlaca(calcs.conPlaca.toString())
  }

  const resetDiagram = () => {
    const nextState: Record<number, ToothState> = {}
    initialTeethList.forEach((num) => {
      nextState[num] = {
        absent: false,
        surfaces: { V: false, L: false, M: false, D: false }
      }
    })
    setDiagramState(nextState)
    setPiezasPresentes('32')
    setSuperficiesEvaluadas('128')
    setSuperficiesConPlaca('0')
  }

  const conPlaca = parseFloat(superficiesConPlaca)
  const evaluadas = parseFloat(superficiesEvaluadas)
  const plaqueIndex = (!isNaN(conPlaca) && !isNaN(evaluadas) && evaluadas > 0)
    ? ((conPlaca * 100) / evaluadas).toFixed(1)
    : ''

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="oral_hygiene_rating" className="block text-xs font-medium text-gray-600 mb-1">Higiene oral</label>
          <select
            id="oral_hygiene_rating"
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
          <label htmlFor="oral_hygiene_piezas_presentes" className="block text-xs font-medium text-gray-600 mb-1">Piezas presentes</label>
          <input
            id="oral_hygiene_piezas_presentes"
            type="number"
            name="oral_hygiene_piezas_presentes"
            value={piezasPresentes}
            onChange={(e) => handlePiezasChange(e.target.value)}
            placeholder="Ej. 6"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="oral_hygiene_superficies_evaluadas" className="block text-xs font-medium text-gray-600 mb-1">Total superficies</label>
          <input
            id="oral_hygiene_superficies_evaluadas"
            type="number"
            name="oral_hygiene_superficies_evaluadas"
            value={superficiesEvaluadas}
            onChange={(e) => setSuperficiesEvaluadas(e.target.value)}
            placeholder="Ej. 24"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="oral_hygiene_superficies_con_placa" className="block text-xs font-medium text-gray-600 mb-1">Superficies con placa</label>
          <input
            id="oral_hygiene_superficies_con_placa"
            type="number"
            name="oral_hygiene_superficies_con_placa"
            value={superficiesConPlaca}
            onChange={(e) => setSuperficiesConPlaca(e.target.value)}
            placeholder="Ej. 5"
            min="0"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Diagrama Clínico de O'Leary */}
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Diagrama Clínico de O&apos;Leary</h4>
            <p className="text-[10px] text-gray-400 font-bold">Hacé clic en los cuadrantes para marcar placa (rojo). Marcá piezas como ausentes para excluirlas.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] text-gray-500 font-bold bg-white px-2 py-1 rounded-lg border border-gray-150">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> Placa
            </span>
            <button
              type="button"
              onClick={resetDiagram}
              className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-150 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[840px] space-y-3 py-1">
            {/* Arcada Superior */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-400 uppercase w-12 shrink-0">Superior</span>
              <div className="flex-1 flex justify-between gap-1">
                {upperTeeth.map((num) => (
                  <ToothPlaqueCell
                    key={num}
                    toothNumber={num}
                    state={diagramState[num]}
                    onChange={(ts) => handleToothChange(num, ts)}
                  />
                ))}
              </div>
            </div>

            {/* Arcada Inferior */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-400 uppercase w-12 shrink-0">Inferior</span>
              <div className="flex-1 flex justify-between gap-1">
                {lowerTeeth.map((num) => (
                  <ToothPlaqueCell
                    key={num}
                    toothNumber={num}
                    state={diagramState[num]}
                    onChange={(ts) => handleToothChange(num, ts)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 pt-1 text-[9px] text-gray-400 font-bold border-t border-gray-100">
          <span>Leyenda: Arriba = Vestibular (V)</span>
          <span>Abajo = Lingual/Palatino (L)</span>
          <span>Izquierda = Mesial (M)</span>
          <span>Derecha = Distal (D)</span>
        </div>

        <input
          type="hidden"
          name="oral_hygiene_oleary_data"
          value={JSON.stringify(diagramState)}
        />
      </div>

      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
        <span className="text-xs font-bold text-blue-800">Índice de O&apos;Leary</span>
        <div className="flex items-center gap-2">
          <input
            type="hidden"
            name="oral_hygiene_plaque_index"
            value={plaqueIndex}
          />
          <span className="text-sm font-black text-blue-900">
            {plaqueIndex ? `Índice de O'Leary: ${plaqueIndex}%` : "Índice de O'Leary: 0.0%"}
          </span>
        </div>
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
  values?: { caries?: number; missing?: number; filled?: number; extraction?: number; total?: number }
  readOnly?: boolean
}

export function IndiceField({ prefix, defaultValues, values, readOnly = false }: IndexProps) {
  // Si values viene del padre (Odontograma en el wizard), es controlado por el padre.
  // Si no, lo controlamos con un estado local para recalcular el total en tiempo real (p. ej. en la edición).
  const [localCaries, setLocalCaries] = useState<string>(
    defaultValues?.caries?.toString() || ''
  )
  const [localMissing, setLocalMissing] = useState<string>(
    (defaultValues?.missing ?? defaultValues?.extraction)?.toString() || ''
  )
  const [localFilled, setLocalFilled] = useState<string>(
    defaultValues?.filled?.toString() || ''
  )

  const [prevDefaultValues, setPrevDefaultValues] = useState(defaultValues)
  if (defaultValues !== prevDefaultValues) {
    setPrevDefaultValues(defaultValues)
    setLocalCaries(defaultValues?.caries?.toString() || '')
    setLocalMissing((defaultValues?.missing ?? defaultValues?.extraction)?.toString() || '')
    setLocalFilled(defaultValues?.filled?.toString() || '')
  }

  const caries = values ? (values.caries ?? 0) : (parseInt(localCaries) || 0)
  const missing = values ? (values.missing ?? 0) : (parseInt(localMissing) || 0)
  const filled = values ? (values.filled ?? 0) : (parseInt(localFilled) || 0)
  const total = caries + missing + filled

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor={`${prefix}_caries`} className="block text-xs font-medium text-gray-600 mb-1">
            {prefix === 'cpod' ? 'Cariados (C)' : 'Cariados (C)'}
          </label>
          <input
            id={`${prefix}_caries`}
            type="number"
            name={`${prefix}_caries`}
            value={values ? (values.caries ?? 0) : localCaries}
            onChange={values ? undefined : (e) => setLocalCaries(e.target.value)}
            readOnly={readOnly}
            min="0"
            max="28"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 read-only:bg-gray-50"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}_missing`} className="block text-xs font-medium text-gray-600 mb-1">
            {prefix === 'cpod' ? 'Perdidos (P)' : 'Extracción (E)'}
          </label>
          <input
            id={`${prefix}_missing`}
            type="number"
            name={`${prefix}_missing`}
            value={values ? (values.missing ?? 0) : localMissing}
            onChange={values ? undefined : (e) => setLocalMissing(e.target.value)}
            readOnly={readOnly}
            min="0"
            max="28"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 read-only:bg-gray-50"
          />
        </div>
        <div>
          <label htmlFor={`${prefix}_filled`} className="block text-xs font-medium text-gray-600 mb-1">Obturados (O)</label>
          <input
            id={`${prefix}_filled`}
            type="number"
            name={`${prefix}_filled`}
            value={values ? (values.filled ?? 0) : localFilled}
            onChange={values ? undefined : (e) => setLocalFilled(e.target.value)}
            readOnly={readOnly}
            min="0"
            max="28"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 read-only:bg-gray-50"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-600">
        <span>Total {prefix.toUpperCase()}:</span>
        <span className="text-sm font-black text-gray-900">{total}</span>
      </div>
    </div>
  )
}
