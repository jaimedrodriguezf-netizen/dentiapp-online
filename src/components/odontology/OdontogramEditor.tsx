'use client'

import { useState, useCallback, useEffect } from 'react'
import OdontogramSVG, { toothColors, toothLabels, SURFACES, isDeciduous } from '@/components/odontology/OdontogramSVG'
import { Info, MoveHorizontal } from 'lucide-react'

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface OdontogramEditorProps {
  initialTeeth: ToothData[]
  onTeethChange?: (teeth: ToothData[]) => void
  readOnly?: boolean
}

const statusOptions = Object.keys(toothColors).filter(s => s !== 'multiple')

export default function OdontogramEditor({ initialTeeth, onTeethChange, readOnly = false }: OdontogramEditorProps) {
  const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)

  const getTooth = useCallback(
    (toothNumber: number) => teeth.find((t) => t.tooth_number === toothNumber),
    [teeth]
  )

  const getToothStatus = useCallback(
    (toothNumber: number) => getTooth(toothNumber)?.status || 'healthy',
    [getTooth]
  )

  const getToothSurfaces = useCallback(
    (toothNumber: number): Record<string, string> =>
      getTooth(toothNumber)?.surfaces || { V: 'healthy', D: 'healthy', M: 'healthy', L: 'healthy', O: 'healthy' },
    [getTooth]
  )

  function handleToothClick(toothNumber: number) {
    if (readOnly) return
    setSelectedTooth(toothNumber === selectedTooth ? null : toothNumber)
  }

  function markAllHealthy() {
    setTeeth([])
    setSelectedTooth(null)
  }

  function handleStatusChange(toothNumber: number, status: string) {
    setTeeth((prev) => {
      const existing = prev.findIndex((t) => t.tooth_number === toothNumber)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], status }
        return updated
      }
      return [...prev, { tooth_number: toothNumber, status }]
    })
  }

  function handleSurfaceChange(toothNumber: number, surface: string, status: string) {
    setTeeth((prev) => {
      const existing = prev.findIndex((t) => t.tooth_number === toothNumber)
      const surfaces = existing >= 0
        ? { ...getToothSurfaces(toothNumber), [surface]: status }
        : { V: 'healthy', D: 'healthy', M: 'healthy', L: 'healthy', O: 'healthy', [surface]: status }

      const nonHealthy = Object.values(surfaces).filter(s => s !== 'healthy')
      const overall = nonHealthy.length === 0 ? 'healthy' : nonHealthy.length === 1 ? nonHealthy[0] : 'multiple'

      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { tooth_number: toothNumber, status: overall, surfaces }
        return updated
      }
      return [...prev, { tooth_number: toothNumber, status: overall, surfaces }]
    })
  }

  // Notify parent of teeth changes
  useEffect(() => {
    onTeethChange?.(teeth)
  }, [teeth, onTeethChange])

  const selectedSurfaces = selectedTooth ? getToothSurfaces(selectedTooth) : null

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Área del Odontograma con Scroll Horizontal en Móvil */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden mx-4 md:mx-0">
        <div className="card-body p-0">
          <div className="bg-blue-50/50 p-2 flex items-center justify-between gap-2 border-b border-blue-100 px-4">
            <div className="flex items-center gap-2 lg:hidden">
              <MoveHorizontal className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Deslizá
              </span>
            </div>
            <button
              type="button"
              onClick={markAllHealthy}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"
            >
              Marcar Boca Sana
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide py-4 px-4 md:p-8">
            <div className="min-w-[760px] md:min-w-0">
              <OdontogramSVG
                teeth={teeth}
                onToothClick={handleToothClick}
                selectedTooth={selectedTooth}
              />
            </div>
          </div>

          {/* Legend responsiva */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {statusOptions.slice(0, 6).map((status) => (
                <div key={status} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: toothColors[status] }}
                  />
                  {toothLabels[status]}
                </div>
              ))}
              <div className="text-[10px] font-bold text-blue-500">Ver más...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de edición flotante/adaptado */}
      {!readOnly && (
        selectedTooth ? (
          <div className="mx-4 md:mx-0 animate-in slide-in-from-bottom duration-300">
            <div className="card bg-white border-2 border-blue-500 shadow-xl overflow-hidden rounded-3xl">
              <div className="card-body p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      Diente {selectedTooth}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {isDeciduous(selectedTooth) ? 'Pieza decidua (leche)' : 'Pieza permanente'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTooth(null)}
                    className="btn btn-sm btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Overall status con botones táctiles grandes */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Estado General</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(selectedTooth, status)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-wide border-2 transition-all ${
                            getToothStatus(selectedTooth) === status
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-inner"
                            style={{ backgroundColor: toothColors[status] }}
                          />
                          <span className="truncate">{toothLabels[status]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surface selector optimizado */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Por Superficie</label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 md:gap-2">
                      {SURFACES.map((surface) => (
                        <div key={surface} className="flex sm:flex-col items-center gap-3 sm:gap-1 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                            {surface}
                          </div>
                          <select
                            value={selectedSurfaces?.[surface] || 'healthy'}
                            onChange={(e) => handleSurfaceChange(selectedTooth, surface, e.target.value)}
                            className="flex-1 sm:w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 focus:border-blue-500 focus:outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{toothLabels[status]}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 md:mx-0 p-8 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-100 text-center">
            <Info className="w-8 h-8 text-blue-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Tocá un diente para editar su estado</p>
          </div>
        )
      )}
    </div>
  )
}
