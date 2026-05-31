'use client'

import { useState, useCallback, useEffect } from 'react'
import OdontogramSVG, { toothColors, toothLabels, isDeciduous } from '@/components/odontology/OdontogramSVG'
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

const editorGradients: Record<string, string> = {
  healthy: 'url(#editor-grad-healthy)',
  caries: 'url(#editor-grad-caries)',
  filling: 'url(#editor-grad-filling)',
  extraction_indicated: 'url(#editor-grad-extraction-indicated)',
  extraction_done: 'url(#editor-grad-extraction-done)',
  endodontics_needed: 'url(#editor-grad-endodontics-needed)',
  endodontics_done: 'url(#editor-grad-endodontics-done)',
  crown: 'url(#editor-grad-crown)',
  fixed_prosthesis: 'url(#editor-grad-fixed-prosthesis)',
  sealant_needed: 'url(#editor-grad-sealant-needed)',
  sealant_done: 'url(#editor-grad-sealant-done)',
  multiple: 'url(#editor-grad-multiple)',
}

export default function OdontogramEditor({ initialTeeth, onTeethChange, readOnly = false }: OdontogramEditorProps) {
  const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null)

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
    setSelectedSurface(null)
  }

  function markAllHealthy() {
    setTeeth([])
    setSelectedTooth(null)
    setSelectedSurface(null)
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

  function handleSurfaceCycle(toothNumber: number, surface: string) {
    if (readOnly) return
    const currentSurfaces = getToothSurfaces(toothNumber)
    const currentStatus = currentSurfaces[surface] || 'healthy'
    const nextStatus = currentStatus === 'healthy'
      ? 'caries'
      : currentStatus === 'caries'
        ? 'filling'
        : 'healthy'
    handleSurfaceChange(toothNumber, surface, nextStatus)
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
                onSurfaceClick={handleSurfaceCycle}
                selectedTooth={selectedTooth}
                variant="msp"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de edición en Modal */}
      {!readOnly && selectedTooth && (() => {
        const isDec = isDeciduous(selectedTooth)
        const quadrant = Math.floor(selectedTooth / 10)
        const isRightSide = [1, 4, 5, 8].includes(quadrant)
        const leftSurfaceKey = isRightSide ? 'D' : 'M'
        const rightSurfaceKey = isRightSide ? 'M' : 'D'
        const leftLabel = isRightSide ? 'Distal (D)' : 'Mesial (M)'
        const rightLabel = isRightSide ? 'Mesial (M)' : 'Distal (D)'

        function makeEditorArcPath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
          const rad = Math.PI / 180
          const x1_in = cx + rInner * Math.cos(startAngle * rad)
          const y1_in = cy + rInner * Math.sin(startAngle * rad)
          const x2_in = cx + rInner * Math.cos(endAngle * rad)
          const y2_in = cy + rInner * Math.sin(endAngle * rad)
          const x1_out = cx + rOuter * Math.cos(startAngle * rad)
          const y1_out = cy + rOuter * Math.sin(startAngle * rad)
          const x2_out = cx + rOuter * Math.cos(endAngle * rad)
          const y2_out = cy + rOuter * Math.sin(endAngle * rad)
          
          return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${rOuter} ${rOuter} 0 0 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${rInner} ${rInner} 0 0 0 ${x1_in} ${y1_in} Z`
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop con blur */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setSelectedTooth(null)}
            />

            {/* Contenido del modal */}
            <div className="relative bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      Diente {selectedTooth}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {isDec ? 'Pieza decidua (leche)' : 'Pieza permanente'}
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
                  {/* Visualización del diente interactivo grande y selector de cara */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                      Edición por Superficie
                    </label>

                    <div className="flex flex-col lg:flex-row items-center gap-6 justify-center bg-gray-50/50 p-5 rounded-2xl border border-gray-150 shadow-xs">
                      {/* Diente interactivo SVG en grande */}
                      <div className="relative w-32 h-32 flex-shrink-0 select-none my-4">
                        <svg viewBox="0 0 120 120" className="w-full h-full">
                          <defs>
                            {/* Healthy */}
                            <linearGradient id="editor-grad-healthy" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="100%" stopColor="#f8fafc" />
                            </linearGradient>
                            {/* Caries */}
                            <linearGradient id="editor-grad-caries" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#fee2e2" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                            {/* Filling */}
                            <linearGradient id="editor-grad-filling" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#eff6ff" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                            {/* Extraction Indicated */}
                            <linearGradient id="editor-grad-extraction-indicated" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ffedd5" />
                              <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                            {/* Extraction Done */}
                            <linearGradient id="editor-grad-extraction-done" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#f3e8ff" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            {/* Endodontics Needed */}
                            <linearGradient id="editor-grad-endodontics-needed" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#fef9c3" />
                              <stop offset="100%" stopColor="#eab308" />
                            </linearGradient>
                            {/* Endodontics Done */}
                            <linearGradient id="editor-grad-endodontics-done" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#fce7f3" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                            {/* Crown */}
                            <linearGradient id="editor-grad-crown" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#fef9c3" />
                              <stop offset="100%" stopColor="#ca8a04" />
                            </linearGradient>
                            {/* Fixed Prosthesis */}
                            <linearGradient id="editor-grad-fixed-prosthesis" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ccfbf1" />
                              <stop offset="100%" stopColor="#0d9488" />
                            </linearGradient>
                            {/* Sealant Needed */}
                            <linearGradient id="editor-grad-sealant-needed" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#e0e7ff" />
                              <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                            {/* Sealant Done */}
                            <linearGradient id="editor-grad-sealant-done" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#d1fae5" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            {/* Multiple */}
                            <linearGradient id="editor-grad-multiple" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#f1f5f9" />
                              <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                            
                            {/* Shadow for 3D layout inside big tooth */}
                            <filter id="editor-shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#475569" floodOpacity="0.12" />
                            </filter>
                          </defs>

                          {/* Outer group with 3D shadow */}
                          <g filter="url(#editor-shadow)">
                            {isDec ? (
                              <g>
                                {/* Vestibular (V) - Arriba */}
                                <path
                                  d={makeEditorArcPath(60, 60, 20, 56, 225, 315)}
                                  fill={editorGradients[selectedSurfaces?.V || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'V' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'V' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'V' ? null : 'V')}
                                  data-testid="big-tooth-face-V"
                                />
                                {/* Right surface */}
                                <path
                                  d={makeEditorArcPath(60, 60, 20, 56, 315, 405)}
                                  fill={editorGradients[selectedSurfaces?.[rightSurfaceKey] || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === rightSurfaceKey ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === rightSurfaceKey ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === rightSurfaceKey ? null : rightSurfaceKey)}
                                  data-testid={`big-tooth-face-${rightSurfaceKey}`}
                                />
                                {/* Lingual (L) - Abajo */}
                                <path
                                  d={makeEditorArcPath(60, 60, 20, 56, 45, 135)}
                                  fill={editorGradients[selectedSurfaces?.L || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'L' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'L' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'L' ? null : 'L')}
                                  data-testid="big-tooth-face-L"
                                />
                                {/* Left surface */}
                                <path
                                  d={makeEditorArcPath(60, 60, 20, 56, 135, 225)}
                                  fill={editorGradients[selectedSurfaces?.[leftSurfaceKey] || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === leftSurfaceKey ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === leftSurfaceKey ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === leftSurfaceKey ? null : leftSurfaceKey)}
                                  data-testid={`big-tooth-face-${leftSurfaceKey}`}
                                />
                                {/* Oclusal (O) - Centro */}
                                <circle
                                  cx={60}
                                  cy={60}
                                  r={20}
                                  fill={editorGradients[selectedSurfaces?.O || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'O' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'O' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'O' ? null : 'O')}
                                  data-testid="big-tooth-face-O"
                                />
                              </g>
                            ) : (
                              <g>
                                {/* Vestibular (V) - Arriba */}
                                <polygon
                                  points="0,0 120,0 80,40 40,40"
                                  fill={editorGradients[selectedSurfaces?.V || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'V' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'V' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'V' ? null : 'V')}
                                  data-testid="big-tooth-face-V"
                                />
                                {/* Right surface */}
                                <polygon
                                  points="120,0 120,120 80,80 80,40"
                                  fill={editorGradients[selectedSurfaces?.[rightSurfaceKey] || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === rightSurfaceKey ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === rightSurfaceKey ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === rightSurfaceKey ? null : rightSurfaceKey)}
                                  data-testid={`big-tooth-face-${rightSurfaceKey}`}
                                />
                                {/* Lingual (L) - Abajo */}
                                <polygon
                                  points="40,80 80,80 120,120 0,120"
                                  fill={editorGradients[selectedSurfaces?.L || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'L' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'L' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'L' ? null : 'L')}
                                  data-testid="big-tooth-face-L"
                                />
                                {/* Left surface */}
                                <polygon
                                  points="0,0 40,40 40,80 0,120"
                                  fill={editorGradients[selectedSurfaces?.[leftSurfaceKey] || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === leftSurfaceKey ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === leftSurfaceKey ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === leftSurfaceKey ? null : leftSurfaceKey)}
                                  data-testid={`big-tooth-face-${leftSurfaceKey}`}
                                />
                                {/* Oclusal/Incisal (O) - Centro */}
                                <polygon
                                  points="40,40 80,40 80,80 40,80"
                                  fill={editorGradients[selectedSurfaces?.O || 'healthy'] || 'url(#editor-grad-healthy)'}
                                  stroke={selectedSurface === 'O' ? '#2563eb' : '#64748b'}
                                  strokeWidth={selectedSurface === 'O' ? 3 : 1.5}
                                  className="cursor-pointer hover:brightness-95"
                                  style={{ transition: 'fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease' }}
                                  onClick={() => setSelectedSurface(selectedSurface === 'O' ? null : 'O')}
                                  data-testid="big-tooth-face-O"
                                />
                              </g>
                            )}
                          </g>
                        </svg>

                        {/* Etiquetas de orientación */}
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Vestibular (V)</span>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Lingual (L)</span>
                        <span className="absolute top-1/2 -left-10 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest">{leftLabel}</span>
                        <span className="absolute top-1/2 -right-10 -translate-y-1/2 text-[9px] font-black text-gray-400 uppercase tracking-widest">{rightLabel}</span>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-gray-800 pointer-events-none">O</span>
                      </div>

                      {/* Selector de estado de cara seleccionada */}
                      <div className="flex-1 w-full space-y-3 border-l border-gray-150 pl-6 min-h-[140px] flex flex-col justify-center">
                        {selectedSurface ? (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <div>
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Superficie seleccionada</span>
                              <strong className="text-sm text-gray-850 font-black uppercase tracking-wide">
                                {selectedSurface === 'V' && 'Vestibular (V) - Arriba'}
                                {selectedSurface === rightSurfaceKey && `${rightLabel} - Derecha`}
                                {selectedSurface === 'L' && 'Lingual / Palatino (L) - Abajo'}
                                {selectedSurface === leftSurfaceKey && `${leftLabel} - Izquierda`}
                                {selectedSurface === 'O' && 'Oclusal / Incisal (O) - Centro'}
                              </strong>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
                              {['healthy', 'caries', 'filling', 'sealant_needed', 'sealant_done'].map((status) => {
                                const isCurrent = (selectedSurfaces?.[selectedSurface] || 'healthy') === status
                                return (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleSurfaceChange(selectedTooth, selectedSurface, status)}
                                    className={`flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                                      isCurrent
                                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs'
                                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50/50'
                                    }`}
                                  >
                                    <div
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs border border-black/5"
                                      style={{ backgroundColor: toothColors[status] }}
                                    />
                                    <span className="truncate">{toothLabels[status]}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 px-4 bg-white/50 rounded-2xl border border-dashed border-gray-200 shadow-xs">
                            <p className="text-xs text-gray-400 font-bold leading-relaxed">
                              Hacé clic sobre alguna de las caras del diente (arriba, abajo, izquierda, derecha o centro) para cambiar su estado de forma individual.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico General del Diente (Pieza completa) */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">
                      Diagnóstico General de la Pieza (Diente Completo)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'healthy', 'extraction_indicated', 'extraction_done', 'lost_other',
                        'endodontics_needed', 'endodontics_done', 'crown_needed', 'crown',
                        'fixed_prosthesis_needed', 'fixed_prosthesis', 'removable_prosthesis_needed', 'removable_prosthesis_done',
                        'total_prosthesis_needed', 'total_prosthesis_done', 'absent'
                      ].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            if (status === 'healthy') {
                              setTeeth((prev) => prev.filter((t) => t.tooth_number !== selectedTooth))
                              setSelectedSurface(null)
                            } else {
                              handleStatusChange(selectedTooth, status)
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black uppercase tracking-wide border-2 transition-all ${
                            getToothStatus(selectedTooth) === status
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-inner border border-black/5"
                            style={{ backgroundColor: toothColors[status] }}
                          />
                          <span className="truncate">{toothLabels[status]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Movilidad y Recesión Inputs */}
                  {!isDec && (
                    <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                          Movilidad (1, 2, 3, 4)
                        </label>
                        <select
                          value={selectedSurfaces?.mobility || ''}
                          onChange={(e) => handleSurfaceChange(selectedTooth, 'mobility', e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                        >
                          <option value="">Ninguna</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                          Recesión (1, 2, 3, 4)
                        </label>
                        <select
                          value={selectedSurfaces?.recession || ''}
                          onChange={(e) => handleSurfaceChange(selectedTooth, 'recession', e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                        >
                          <option value="">Ninguna</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Instrucciones de Uso (Siempre visibles en la parte inferior) */}
      <div className="mx-4 md:mx-0 p-6 bg-blue-50/20 rounded-3xl border-2 border-dashed border-blue-100 shadow-sm mt-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-md font-black text-gray-900 uppercase tracking-tight">Instrucciones de Uso del Odontograma</h4>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Sencillo, rápido y completo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloque de instrucciones */}
          <div className="space-y-4 text-xs font-bold text-gray-600">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Modo Rápido (Edición Directa)</span>
              <p className="text-gray-500 font-medium normal-case">
                Hacé clic directamente sobre las caras de cualquier pieza dental en el odontograma para ciclar su estado rápidamente:
              </p>
              <div className="flex gap-4 mt-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-white border border-gray-200 rounded shadow-xs" />
                  <span className="text-[10px]">Sano (Blanco)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#f87171] border border-red-400 rounded shadow-xs" />
                  <span className="text-[10px]">Caries (Rojo)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#60a5fa] border border-blue-400 rounded shadow-xs" />
                  <span className="text-[10px]">Obturado (Azul)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Modo Detallado (Edición Avanzada)</span>
              <p className="text-gray-500 font-medium normal-case">
                Hacé clic sobre el número de cualquier diente (el botón con el número arriba) para abrir el panel detallado de la pieza. Allí podrás aplicar el resto de estados clínicos avanzados como Extracción, Extraído, Endodoncia, Corona, Sellantes, etc.
              </p>
            </div>
          </div>

          {/* Leyenda de colores */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Leyenda de Estados Clínicos</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs border border-black/5"
                    style={{ backgroundColor: toothColors[status] }}
                  />
                  <span className="truncate">{toothLabels[status]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
