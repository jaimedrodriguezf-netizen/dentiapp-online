'use client'

import { useState, useEffect } from 'react'
import { isDeciduous } from './OdontogramSVG'
import { Info } from 'lucide-react'

interface InteractiveToothSelectorProps {
  initialTooth?: number | number[] | null
  initialSurfaces?: string[]
  onChange?: (teeth: number | number[] | null, surfaces: string[]) => void
}

const permanentsUpper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const deciduousUpper = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
const deciduousLower = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
const permanentsLower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

function makeArcPath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number) {
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

const parseInitialTeeth = (init: number | number[] | null | undefined): number[] => {
  if (!init) return []
  if (Array.isArray(init)) return init
  if (typeof init === 'string') {
    return (init as string).split(',').map((t) => parseInt(t, 10)).filter((n) => !isNaN(n))
  }
  return [init]
}

export default function InteractiveToothSelector({
  initialTooth = null,
  initialSurfaces = [],
  onChange,
}: InteractiveToothSelectorProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>(parseInitialTeeth(initialTooth))
  const [activeTooth, setActiveTooth] = useState<number | null>(
    selectedTeeth.length > 0 ? selectedTeeth[selectedTeeth.length - 1] : null
  )
  const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>(initialSurfaces)

  useEffect(() => {
    const teeth = parseInitialTeeth(initialTooth)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTeeth(teeth)
    if (teeth.length > 0 && (!activeTooth || !teeth.includes(activeTooth))) {
      setActiveTooth(teeth[teeth.length - 1])
    } else if (teeth.length === 0) {
      setActiveTooth(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTooth])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSurfaces(initialSurfaces)
  }, [initialSurfaces])

  const notifyChange = (teeth: number | number[] | null, surfaces: string[]) => {
    if (onChange) {
      onChange(teeth, surfaces)
    }
  }

  const handleToothClick = (tooth: number) => {
    let nextTeeth: number[]
    let nextActive: number | null

    if (selectedTeeth.includes(tooth)) {
      // Toggle off
      nextTeeth = selectedTeeth.filter((t) => t !== tooth)
      nextActive = nextTeeth.length > 0 ? nextTeeth[nextTeeth.length - 1] : null
    } else {
      // Toggle on
      nextTeeth = [...selectedTeeth, tooth]
      nextActive = tooth
    }

    setSelectedTeeth(nextTeeth)
    setActiveTooth(nextActive)

    // Notify parent
    let notifyVal: number | number[] | null = null
    if (nextTeeth.length === 1) {
      notifyVal = nextTeeth[0]
    } else if (nextTeeth.length > 1) {
      notifyVal = nextTeeth
    }
    notifyChange(notifyVal, selectedSurfaces)
  }

  const handleClearTeeth = () => {
    setSelectedTeeth([])
    setActiveTooth(null)
    setSelectedSurfaces([])
    notifyChange(null, [])
  }

  const handleSurfaceToggle = (surface: string) => {
    if (selectedTeeth.length === 0) return

    let nextSurfaces: string[]
    if (selectedSurfaces.includes(surface)) {
      nextSurfaces = selectedSurfaces.filter((s) => s !== surface)
    } else {
      nextSurfaces = [...selectedSurfaces, surface]
    }

    setSelectedSurfaces(nextSurfaces)
    
    let notifyVal: number | number[] | null = null
    if (selectedTeeth.length === 1) {
      notifyVal = selectedTeeth[0]
    } else if (selectedTeeth.length > 1) {
      notifyVal = selectedTeeth
    }
    notifyChange(notifyVal, nextSurfaces)
  }

  const isDec = activeTooth ? isDeciduous(activeTooth) : false

  // Side-dependent surface mapping for active tooth
  const getSides = () => {
    if (!activeTooth) {
      return {
        leftKey: 'M',
        rightKey: 'D',
        leftLabel: 'Mesial (M)',
        rightLabel: 'Distal (D)',
      }
    }
    const quadrant = Math.floor(activeTooth / 10)
    const isRightSide = [1, 4, 5, 8].includes(quadrant)

    const leftKey = isRightSide ? 'D' : 'M'
    const rightKey = isRightSide ? 'M' : 'D'

    const leftLabel = isRightSide ? 'Distal (D)' : 'Mesial (M)'
    const rightLabel = isRightSide ? 'Mesial (M)' : 'Distal (D)'

    return { leftKey, rightKey, leftLabel, rightLabel }
  }

  const { leftKey, rightKey, leftLabel, rightLabel } = getSides()

  const renderToothCell = (tooth: number) => {
    const isSel = selectedTeeth.includes(tooth)
    const isActive = activeTooth === tooth
    return (
      <button
        key={tooth}
        type="button"
        onClick={() => handleToothClick(tooth)}
        className={`w-8 h-8 rounded-lg text-[11px] font-black flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer select-none relative ${
          isSel
            ? isActive
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-4 ring-blue-100 scale-110 z-10'
              : 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm scale-105'
            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:scale-105'
        }`}
        title={`Pieza dental ${tooth}${isActive ? ' (Editando caras)' : ''}`}
      >
        <span>{tooth}</span>
        {isSel && !isActive && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hidden inputs for seamless Next.js Form data aggregation */}
      {selectedTeeth.length === 0 && (
        <input type="hidden" name="diagnosis_tooth" value="" />
      )}
      {selectedTeeth.length === 1 && (
        <input type="hidden" name="diagnosis_tooth" value={selectedTeeth[0]} />
      )}
      {selectedTeeth.length > 1 && (
        <>
          {/* Output multi-value name so actions.ts reads all of them */}
          {selectedTeeth.map((tooth) => (
            <input type="hidden" name="diagnosis_teeth" key={tooth} value={tooth} />
          ))}
          {/* Legacy single-field backup format */}
          <input type="hidden" name="diagnosis_tooth" value={selectedTeeth.join(',')} />
        </>
      )}
      {selectedSurfaces.map((surf) => (
        <input type="hidden" name="diagnosis_surfaces" key={surf} value={surf} />
      ))}

      {/* Grid selector of teeth */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
            Piezas Dentales FDI (Podés seleccionar varias piezas)
          </label>
          {selectedTeeth.length > 0 && (
            <button
              type="button"
              onClick={handleClearTeeth}
              className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer transition-colors"
            >
              Quitar Piezas (General)
            </button>
          )}
        </div>

        {/* Teeth Arch Layout */}
        <div className="bg-gray-50/50 p-4 md:p-6 rounded-[24px] border border-gray-100 space-y-4 overflow-x-auto max-w-full">
          <div className="min-w-[620px] space-y-3">
            {/* ROW 1: Permanents Upper */}
            <div className="flex justify-between gap-1">
              <span className="text-[9px] font-black text-gray-400 w-16 uppercase tracking-wider self-center">Perm. Sup</span>
              <div className="flex gap-1 justify-center flex-1">
                {permanentsUpper.map(renderToothCell)}
              </div>
            </div>

            {/* ROW 2: Deciduos Upper */}
            <div className="flex justify-between gap-1">
              <span className="text-[9px] font-black text-gray-400 w-16 uppercase tracking-wider self-center">Decid. Sup</span>
              <div className="flex gap-1 justify-center flex-1">
                <div className="w-[12%]"></div>
                {deciduousUpper.map(renderToothCell)}
                <div className="w-[12%]"></div>
              </div>
            </div>

            {/* divider line */}
            <div className="border-t border-dashed border-gray-200 my-2"></div>

            {/* ROW 3: Deciduos Lower */}
            <div className="flex justify-between gap-1">
              <span className="text-[9px] font-black text-gray-400 w-16 uppercase tracking-wider self-center">Decid. Inf</span>
              <div className="flex gap-1 justify-center flex-1">
                <div className="w-[12%]"></div>
                {deciduousLower.map(renderToothCell)}
                <div className="w-[12%]"></div>
              </div>
            </div>

            {/* ROW 4: Permanents Lower */}
            <div className="flex justify-between gap-1">
              <span className="text-[9px] font-black text-gray-400 w-16 uppercase tracking-wider self-center">Perm. Inf</span>
              <div className="flex gap-1 justify-center flex-1">
                {permanentsLower.map(renderToothCell)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive tooth surface visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/20 p-4 md:p-6 rounded-[24px] border border-gray-100">
        {selectedTeeth.length > 0 && activeTooth ? (
          <>
            {/* Visual interactive SVG */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-gray-800 uppercase tracking-wide block">
                  Caras de las Piezas Seleccionadas
                </span>
                <span className="text-[10px] font-bold text-blue-600 block">
                  {selectedTeeth.length === 1 
                    ? `Configurando Pieza ${selectedTeeth[0]}`
                    : `Configurando ${selectedTeeth.length} piezas. Editando vista de Pieza ${activeTooth}`
                  }
                </span>
              </div>

              <div className="relative w-44 h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                  {isDec ? (
                    <g>
                      {/* Vestibular (V) */}
                      <path
                        d={makeArcPath(50, 50, 20, 45, 225, 315)}
                        fill={selectedSurfaces.includes('V') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('V') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('V')}
                      />
                      {/* Right */}
                      <path
                        d={makeArcPath(50, 50, 20, 45, 315, 405)}
                        fill={selectedSurfaces.includes(rightKey) ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes(rightKey) ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle(rightKey)}
                      />
                      {/* Lingual/Palatina (L/P) */}
                      <path
                        d={makeArcPath(50, 50, 20, 45, 45, 135)}
                        fill={selectedSurfaces.includes('L/P') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('L/P') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('L/P')}
                      />
                      {/* Left */}
                      <path
                        d={makeArcPath(50, 50, 20, 45, 135, 225)}
                        fill={selectedSurfaces.includes(leftKey) ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes(leftKey) ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle(leftKey)}
                      />
                      {/* Oclusal/Incisal (O/I) */}
                      <circle
                        cx={50}
                        cy={50}
                        r={20}
                        fill={selectedSurfaces.includes('O/I') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('O/I') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('O/I')}
                      />
                    </g>
                  ) : (
                    <g>
                      {/* Vestibular (V) */}
                      <polygon
                        points="0,0 100,0 75,25 25,25"
                        fill={selectedSurfaces.includes('V') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('V') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('V')}
                      />
                      {/* Right */}
                      <polygon
                        points="100,0 75,25 75,75 100,100"
                        fill={selectedSurfaces.includes(rightKey) ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes(rightKey) ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle(rightKey)}
                      />
                      {/* Lingual/Palatina (L/P) */}
                      <polygon
                        points="25,75 75,75 100,100 0,100"
                        fill={selectedSurfaces.includes('L/P') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('L/P') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('L/P')}
                      />
                      {/* Left */}
                      <polygon
                        points="0,0 25,25 25,75 0,100"
                        fill={selectedSurfaces.includes(leftKey) ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes(leftKey) ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle(leftKey)}
                      />
                      {/* Oclusal/Incisal (O/I) */}
                      <polygon
                        points="25,25 75,25 75,75 25,75"
                        fill={selectedSurfaces.includes('O/I') ? '#3b82f6' : '#ffffff'}
                        stroke="#4b5563"
                        strokeWidth={selectedSurfaces.includes('O/I') ? 1.5 : 0.8}
                        className="cursor-pointer hover:fill-blue-50/50 transition-all duration-200"
                        onClick={() => handleSurfaceToggle('O/I')}
                      />
                    </g>
                  )}

                  {/* Surface indicator labels overlay */}
                  <g className="pointer-events-none fill-gray-500 font-black text-[6px]">
                    <text x={50} y={15} textAnchor="middle">V</text>
                    <text x={85} y={52} textAnchor="middle">{rightKey}</text>
                    <text x={50} y={90} textAnchor="middle">L/P</text>
                    <text x={15} y={52} textAnchor="middle">{leftKey}</text>
                    <text x={50} y={52} textAnchor="middle">O/I</text>
                  </g>
                </svg>
              </div>

              <span className="text-[10px] font-medium text-gray-400">
                Hacé clic directamente en las caras para marcarlas.
              </span>
            </div>

            {/* Descriptive checklist */}
            <div className="flex flex-col justify-center space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                  Caras Afectadas (Seleccionadas: {selectedSurfaces.length})
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'V', label: 'V (Vestibular - Superior)' },
                    { value: leftKey, label: `${leftKey} (${leftLabel} - Izquierda)` },
                    { value: rightKey, label: `${rightKey} (${rightLabel} - Derecha)` },
                    { value: 'O/I', label: 'O/I (Oclusal/Incisal - Centro)' },
                    { value: 'L/P', label: 'L/P (Lingual/Palatina - Inferior)' },
                  ].map((cara) => {
                    const isChecked = selectedSurfaces.includes(cara.value)
                    return (
                      <label
                        key={cara.value}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none font-bold text-xs ${
                          isChecked
                            ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                            : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSurfaceToggle(cara.value)}
                            className="checkbox checkbox-primary checkbox-sm rounded-md"
                          />
                          <span>{cara.label}</span>
                        </div>
                        {isChecked && (
                          <span className="badge badge-primary font-black text-[9px] px-1.5 py-0.5 rounded-md">
                            MARCADA
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>

              {selectedSurfaces.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] font-bold">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>
                    No has seleccionado ninguna cara. El diagnóstico se aplicará a todas las piezas seleccionadas.
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-gray-200 rounded-[24px] bg-white space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                Diagnóstico General de la Boca
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                No has seleccionado ninguna pieza dental. El diagnóstico se registrará de forma general. Si querés especificar dientes y sus caras, hacé clic en las piezas que desees en la grilla superior. ¡Podés seleccionar varios!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
