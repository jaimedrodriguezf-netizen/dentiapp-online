'use client'

import { useState } from 'react'
import { ToothMeasurement, PeriodontalPoint } from '@/types/periodontogram'
import { calculatePointNIC } from '@/utils/periodontogramHelpers'
import { UPPER_TEETH, LOWER_TEETH } from '@/utils/periodontogramHelpers'
import { ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'

interface Props {
  teeth: Record<string, ToothMeasurement>
  onChange: (toothId: string, updated: ToothMeasurement) => void
}

type FaceKey = 'vestibular' | 'lingual'
type PointKey = 'distal' | 'middle' | 'mesial'

export default function PeriodontalMatrixEditor({ teeth, onChange }: Props) {
  const [selectedToothId, setSelectedToothId] = useState<string>('18')
  const selectedTooth = teeth[selectedToothId]

  if (!selectedTooth) return null

  // Manejar el cambio de un punto clínico particular
  const handlePointChange = (
    face: FaceKey,
    point: PointKey,
    field: keyof PeriodontalPoint,
    value: string | boolean | null
  ) => {
    const updatedTooth = { ...selectedTooth }
    const updatedPoint = { ...updatedTooth[face][point] }

    if (field === 'margin' || field === 'depth') {
      if (typeof value === 'string') {
        const numVal = value === '' ? null : parseInt(value, 10)
        updatedPoint[field] = numVal
        // Recalcular NIC automáticamente en el cliente
        updatedPoint.nic = calculatePointNIC(updatedPoint.margin, updatedPoint.depth)
      }
    } else {
      if (typeof value === 'boolean') {
        updatedPoint[field as 'bleeding' | 'plaque' | 'suppuration'] = value
      }
    }

    updatedTooth[face] = {
      ...updatedTooth[face],
      [point]: updatedPoint
    }

    onChange(selectedToothId, updatedTooth)
  }

  // Manejar el cambio de estado del diente (Ausente/Presente)
  const handleMissingChange = (isMissing: boolean) => {
    const updatedTooth = {
      ...selectedTooth,
      isMissing
    }
    onChange(selectedToothId, updatedTooth)
  }

  // Manejar movilidad o furca
  const handleGeneralFieldChange = (field: 'mobility' | 'furcation', value: string) => {
    const val = value === '' ? null : parseInt(value, 10)
    onChange(selectedToothId, {
      ...selectedTooth,
      [field]: val
    })
  }

  // Comprobar si hay bolsas periodontales patológicas en el diente actual (depth >= 4)
  const hasPathology = (tooth: ToothMeasurement) => {
    if (tooth.isMissing) return false
    const faces: FaceKey[] = ['vestibular', 'lingual']
    const points: PointKey[] = ['distal', 'middle', 'mesial']
    return faces.some(f => points.some(p => {
      const d = tooth[f][p].depth
      return d !== null && d >= 4
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Arcada Dental Completa (Panel Izquierdo - 7 Columnas) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Arcada Dental</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Seleccioná un diente para editar sus celdas clínicas</p>
          </div>

          {/* Fila Superior */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Arcada Superior</span>
            <div className="grid grid-cols-8 gap-2">
              {UPPER_TEETH.map((id) => {
                const activeTooth = teeth[id]
                const isSelected = id === selectedToothId
                const isMissing = activeTooth?.isMissing
                const hasPath = activeTooth && hasPathology(activeTooth)

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedToothId(id)}
                    className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/10'
                        : isMissing
                        ? 'border-gray-150 bg-gray-50/50 opacity-40'
                        : hasPath
                        ? 'border-rose-300 bg-rose-50/20 hover:bg-rose-50/40 text-rose-600'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-black">{id}</span>
                    {isMissing ? (
                      <span className="text-[7px] font-black text-gray-400 uppercase mt-0.5">AUS</span>
                    ) : hasPath ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 animate-pulse" />
                    ) : (
                      <Tooth className={`w-3.5 h-3.5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fila Inferior */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Arcada Inferior</span>
            <div className="grid grid-cols-8 gap-2">
              {LOWER_TEETH.map((id) => {
                const activeTooth = teeth[id]
                const isSelected = id === selectedToothId
                const isMissing = activeTooth?.isMissing
                const hasPath = activeTooth && hasPathology(activeTooth)

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedToothId(id)}
                    className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/10'
                        : isMissing
                        ? 'border-gray-150 bg-gray-50/50 opacity-40'
                        : hasPath
                        ? 'border-rose-300 bg-rose-50/20 hover:bg-rose-50/40 text-rose-600'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-black">{id}</span>
                    {isMissing ? (
                      <span className="text-[7px] font-black text-gray-400 uppercase mt-0.5">AUS</span>
                    ) : hasPath ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 animate-pulse" />
                    ) : (
                      <Tooth className={`w-3.5 h-3.5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Detallado (Panel Derecho - 5 Columnas) */}
      <div className="lg:col-span-5">
        <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6 sticky top-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Tooth className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Pieza Dental {selectedToothId}</h3>
                <p className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Editor clínico periodontal</p>
              </div>
            </div>

            {/* Selector de Ausencia */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedTooth.isMissing}
                onChange={(e) => handleMissingChange(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary rounded-lg border-2"
              />
              <span className="text-xs font-black text-gray-500 uppercase tracking-tight">Marcar Ausente</span>
            </label>
          </div>

          {!selectedTooth.isMissing ? (
            <div className="space-y-6">
              {/* Parámetros de la cara Vestibular */}
              <FaceSection
                title="Cara Vestibular (Externa)"
                faceKey="vestibular"
                tooth={selectedTooth}
                onPointChange={handlePointChange}
              />

              {/* Parámetros de la cara Lingual / Palatina */}
              <FaceSection
                title="Cara Lingual / Palatina (Interna)"
                faceKey="lingual"
                tooth={selectedTooth}
                onPointChange={handlePointChange}
              />

              {/* Parámetros Generales: Movilidad y Furca */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-450 uppercase tracking-widest block">Movilidad</label>
                  <select
                    value={selectedTooth.mobility ?? ''}
                    onChange={(e) => handleGeneralFieldChange('mobility', e.target.value)}
                    className="select select-sm select-bordered w-full rounded-xl text-xs font-bold focus:border-blue-500"
                  >
                    <option value="">0 (Normal)</option>
                    <option value="1">1 (Grado I)</option>
                    <option value="2">2 (Grado II)</option>
                    <option value="3">3 (Grado III)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-455 uppercase tracking-widest block">Furca</label>
                  <select
                    value={selectedTooth.furcation ?? ''}
                    onChange={(e) => handleGeneralFieldChange('furcation', e.target.value)}
                    className="select select-sm select-bordered w-full rounded-xl text-xs font-bold focus:border-blue-500"
                  >
                    <option value="">N/A (Ninguna)</option>
                    <option value="1">I (Inicial)</option>
                    <option value="2">II (Media)</option>
                    <option value="3">III (Completa)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Tooth className="w-5 h-5 opacity-40" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">Pieza Dental Ausente</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto mt-1">
                Esta pieza dental fue marcada como ausente o extraída. Desmarcá &quot;Marcar Ausente&quot; para poder registrar mediciones clínicas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FaceSectionProps {
  title: string
  faceKey: FaceKey
  tooth: ToothMeasurement
  onPointChange: (face: FaceKey, point: PointKey, field: keyof PeriodontalPoint, value: string | boolean | null) => void
}

function FaceSection({ title, faceKey, tooth, onPointChange }: FaceSectionProps) {
  const points: { key: PointKey; label: string }[] = [
    { key: 'distal', label: 'Disto (D)' },
    { key: 'middle', label: 'Medio (M)' },
    { key: 'mesial', label: 'Mesio (Me)' }
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{title}</h4>
      <div className="grid grid-cols-3 gap-3">
        {points.map(({ key, label }) => {
          const pt = tooth[faceKey][key]
          const isBolsa = pt.depth !== null && pt.depth >= 4

          return (
            <div key={key} className={`rounded-2xl border p-3.5 space-y-3 transition-colors ${
              isBolsa ? 'border-rose-100 bg-rose-50/10' : 'border-gray-100 bg-gray-50/10'
            }`}>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block text-center border-b border-gray-100 pb-1.5">
                {label}
              </span>

              {/* Margen Gingival (MG) */}
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Margen (MG)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={pt.margin ?? ''}
                  onChange={(e) => onPointChange(faceKey, key, 'margin', e.target.value)}
                  className="input input-xs input-bordered w-full rounded-lg font-bold text-center"
                />
              </div>

              {/* Profundidad de Sondaje (PS) */}
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Sondaje (PS)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={pt.depth ?? ''}
                  onChange={(e) => onPointChange(faceKey, key, 'depth', e.target.value)}
                  className={`input input-xs input-bordered w-full rounded-lg font-bold text-center ${
                    isBolsa ? 'border-rose-300 focus:border-rose-500 text-rose-600 bg-rose-50/50 font-black' : ''
                  }`}
                />
              </div>

              {/* NIC (Calculado e inmutable) */}
              <div className="flex items-center justify-between text-[8px] font-black text-gray-450 border-t border-gray-100 pt-2 leading-none">
                <span className="uppercase">NIC:</span>
                <span className={`text-[10px] font-black ${isBolsa ? 'text-rose-600' : 'text-gray-900'}`}>
                  {pt.nic !== null ? `${pt.nic}mm` : '—'}
                </span>
              </div>

              {/* Marcas de Placa y Sangrado */}
              <div className="flex gap-2 justify-center border-t border-gray-100 pt-2.5">
                {/* Botón Sangrado */}
                <button
                  type="button"
                  onClick={() => onPointChange(faceKey, key, 'bleeding', !pt.bleeding)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    pt.bleeding
                      ? 'bg-rose-500 border-rose-600 text-white shadow-sm scale-103'
                      : 'bg-white border-gray-150 text-gray-300 hover:text-rose-400 hover:bg-rose-50/30'
                  }`}
                  title="Sangrado al Sondaje"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>

                {/* Botón Placa */}
                <button
                  type="button"
                  onClick={() => onPointChange(faceKey, key, 'plaque', !pt.plaque)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    pt.plaque
                      ? 'bg-amber-400 border-amber-500 text-white shadow-sm scale-103'
                      : 'bg-white border-gray-150 text-gray-300 hover:text-amber-400 hover:bg-amber-50/30'
                  }`}
                  title="Placa Bacteriana"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
