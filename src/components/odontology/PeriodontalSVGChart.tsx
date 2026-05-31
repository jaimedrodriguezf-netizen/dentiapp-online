'use client'

import { useState } from 'react'
import { ToothMeasurement } from '@/types/periodontogram'
import { calculatePointNIC } from '@/utils/periodontogramHelpers'

interface Props {
  teeth: Record<string, ToothMeasurement>
}

// Selector de vista (Vestibular o Lingual/Palatino)
type ViewFace = 'vestibular' | 'lingual'

export default function PeriodontalSVGChart({ teeth }: Props) {
  const [viewFace, setViewFace] = useState<ViewFace>('vestibular')

  // Agrupamos los dientes por maxilar
  const upperTeethIds = [
    '18', '17', '16', '15', '14', '13', '12', '11',
    '21', '22', '23', '24', '25', '26', '27', '28'
  ]
  const lowerTeethIds = [
    '48', '47', '46', '45', '44', '43', '42', '41',
    '31', '32', '33', '34', '35', '36', '37', '38'
  ]

  return (
    <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Gráfico Periodontal (Berna / SEPA)</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Perfil visual de encía y nivel de inserción</p>
        </div>

        {/* Interruptor de Vista */}
        <div className="inline-flex rounded-2xl bg-gray-100 p-1.5 self-start">
          <button
            onClick={() => setViewFace('vestibular')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              viewFace === 'vestibular'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Vestibular
          </button>
          <button
            onClick={() => setViewFace('lingual')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              viewFace === 'lingual'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Lingual / Palatino
          </button>
        </div>
      </div>

      {/* Gráfico SVG de la Arcada Superior */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arcada Superior (Maxilar)</h4>
        <div className="flex justify-between overflow-x-auto gap-1 pb-4 scrollbar-thin">
          {upperTeethIds.map((id) => (
            <ToothSVGItem key={id} tooth={teeth[id]} face={viewFace} isUpper={true} />
          ))}
        </div>
      </div>

      {/* Gráfico SVG de la Arcada Inferior */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arcada Inferior (Mandíbula)</h4>
        <div className="flex justify-between overflow-x-auto gap-1 pb-4 scrollbar-thin">
          {lowerTeethIds.map((id) => (
            <ToothSVGItem key={id} tooth={teeth[id]} face={viewFace} isUpper={false} />
          ))}
        </div>
      </div>

      {/* Simbología del Gráfico */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-xs font-bold text-gray-500 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span>Margen Gingival (Encía)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-rose-500" />
          <span>Nivel de Inserción (Hueso / NIC)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-rose-500/15 border border-dashed border-rose-300 rounded" />
          <span>Bolsa Periodontal (Sondaje ≥ 4mm)</span>
        </div>
      </div>
    </div>
  )
}

interface ToothSVGProps {
  tooth: ToothMeasurement | undefined
  face: ViewFace
  isUpper: boolean
}

function ToothSVGItem({ tooth, face, isUpper }: ToothSVGProps) {
  if (!tooth) return null

  const width = 58
  const height = 150

  if (tooth.isMissing) {
    return (
      <div className="flex flex-col items-center justify-center shrink-0 border border-dashed border-gray-100 bg-gray-50/50 rounded-2xl" style={{ width, height }}>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tooth.id}</span>
        <span className="text-[8px] font-black text-gray-300 uppercase tracking-wider mt-1">AUS</span>
      </div>
    )
  }

  // Obtenemos los 3 puntos de la cara correspondiente
  const measurement = face === 'vestibular' ? tooth.vestibular : tooth.lingual
  const { distal, middle, mesial } = measurement

  // Coordenadas X fijas para Distal, Medio y Mesial
  // (Para arcada izquierda/derecha puede cambiar clínicamente, pero simplificamos de izquierda a derecha en pantalla)
  const xDistal = 10
  const xMiddle = 29
  const xMesial = 48

  // Mapeo vertical: el límite amelocementario (LAC) está en y = 75
  // La escala va de -5mm a 15mm. Cada mm son 3.5px.
  // En Maxilar Superior:
  // - Apical (raíz) está arriba (y < 75). Sondaje y pérdida de inserción suben en el SVG.
  // - Oclusal (corona) está abajo (y > 75).
  // En Mandíbula (Inferior):
  // - Apical (raíz) está abajo (y > 75). Sondaje y pérdida de inserción bajan en el SVG.
  // - Oclusal (corona) está arriba (y < 75).
  const scaleY = (val: number | null, pointMg: number | null = null, depth: number | null = null) => {
    const yBase = 75
    const step = 3.5

    if (val === null) return yBase

    if (isUpper) {
      // Superior: Recesión (margen +) y profundidad suben hacia la raíz (y disminuye)
      // Si pointMg y depth están definidos, es para graficar el NIC o la bolsa
      if (pointMg !== null && depth !== null) {
        const calculatedNic = calculatePointNIC(pointMg, depth) || 0
        return yBase - (calculatedNic * step)
      }
      return yBase - (val * step)
    } else {
      // Inferior: Recesión (margen +) y profundidad bajan hacia la raíz (y aumenta)
      if (pointMg !== null && depth !== null) {
        const calculatedNic = calculatePointNIC(pointMg, depth) || 0
        return yBase + (calculatedNic * step)
      }
      return yBase + (val * step)
    }
  }

  // Coordenadas Y de Encía (Margen Gingival)
  const yMgDistal = scaleY(distal.margin)
  const yMgMiddle = scaleY(middle.margin)
  const yMgMesial = scaleY(mesial.margin)

  // Coordenadas Y del Hueso/Bolsa (NIC)
  const yNicDistal = scaleY(null, distal.margin, distal.depth)
  const yNicMiddle = scaleY(null, middle.margin, middle.depth)
  const yNicMesial = scaleY(null, mesial.margin, mesial.depth)

  // Silueta Anatómica del Diente (SVG Path conceptual)
  // Superior: Raíz arriba (20px), Corona abajo (120px)
  // Inferior: Corona arriba (30px), Raíz abajo (130px)
  const toothPath = isUpper
    ? "M 15,100 C 15,115 43,115 43,100 C 43,80 37,50 35,20 C 35,10 23,10 23,20 C 21,50 15,80 15,100 Z"
    : "M 15,50 C 15,35 43,35 43,50 C 43,70 37,100 35,130 C 35,140 23,140 23,130 C 21,100 15,70 15,50 Z"

  // ¿Hay bolsa patológica en alguna cara? (sondaje >= 4mm)
  const hasBolsa = 
    (distal.depth !== null && distal.depth >= 4) ||
    (middle.depth !== null && middle.depth >= 4) ||
    (mesial.depth !== null && mesial.depth >= 4)

  return (
    <div className="flex flex-col items-center shrink-0 border border-gray-150 bg-gray-50/20 rounded-2xl p-1.5 space-y-1">
      <span className="text-[10px] font-black text-gray-900 tracking-tight">{tooth.id}</span>
      
      <svg width={width} height={height} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Grilla horizontal de fondo (escala mm) */}
        {[30, 45, 60, 75, 90, 105, 120].map((y) => (
          <line key={y} x1={0} y1={y} x2={width} y2={y} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        
        {/* Silueta Dental de Fondo */}
        <path d={toothPath} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />

        {/* Polígono translúcido para sombrear la bolsa si existe */}
        {distal.margin !== null && distal.depth !== null && (
          <polygon
            points={`
              ${xDistal},${yMgDistal} ${xMiddle},${yMgMiddle} ${xMesial},${yMgMesial}
              ${xMesial},${yNicMesial} ${xMiddle},${yNicMiddle} ${xDistal},${yNicDistal}
            `}
            fill={hasBolsa ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.05)"}
          />
        )}

        {/* Línea del Margen Gingival (Encía - Azul) */}
        {distal.margin !== null && (
          <path
            d={`M ${xDistal},${yMgDistal} L ${xMiddle},${yMgMiddle} L ${xMesial},${yMgMesial}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
        )}

        {/* Línea del NIC (Hueso - Rojo) */}
        {distal.depth !== null && (
          <path
            d={`M ${xDistal},${yNicDistal} L ${xMiddle},${yNicMiddle} L ${xMesial},${yNicMesial}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray={hasBolsa ? "0" : "2,2"}
          />
        )}

        {/* Puntos de Marcación */}
        {distal.margin !== null && (
          <>
            <circle cx={xDistal} cy={yMgDistal} r={2} fill="#3b82f6" />
            <circle cx={xMiddle} cy={yMgMiddle} r={2} fill="#3b82f6" />
            <circle cx={xMesial} cy={yMgMesial} r={2} fill="#3b82f6" />
          </>
        )}
        {distal.depth !== null && (
          <>
            <circle cx={xDistal} cy={yNicDistal} r={2} fill="#ef4444" />
            <circle cx={xMiddle} cy={yNicMiddle} r={2} fill="#ef4444" />
            <circle cx={xMesial} cy={yNicMesial} r={2} fill="#ef4444" />
          </>
        )}
      </svg>

      {/* Valores de sondaje de fondo */}
      <div className="flex justify-between w-full text-[8px] font-bold px-1 text-gray-500 leading-none">
        <span>{distal.depth ?? '-'}</span>
        <span>{middle.depth ?? '-'}</span>
        <span>{mesial.depth ?? '-'}</span>
      </div>
    </div>
  )
}
