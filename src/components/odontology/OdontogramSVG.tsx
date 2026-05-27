'use client'

const toothColors: Record<string, string> = {
  healthy: '#4ade80',
  caries: '#f87171',
  filling: '#60a5fa',
  extraction_indicated: '#fb923c',
  extraction_done: '#a78bfa',
  endodontics_needed: '#fbbf24',
  endodontics_done: '#f472b6',
  crown: '#facc15',
  fixed_prosthesis: '#2dd4bf',
  sealant_needed: '#818cf8',
  sealant_done: '#34d399',
  multiple: '#94a3b8',
}

const toothLabels: Record<string, string> = {
  healthy: 'Sano',
  caries: 'Caries',
  filling: 'Obturado',
  extraction_indicated: 'Extracción indicada',
  extraction_done: 'Extraído',
  endodontics_needed: 'Endodoncia necesaria',
  endodontics_done: 'Endodoncia realizada',
  crown: 'Corona',
  fixed_prosthesis: 'Prótesis fija',
  sealant_needed: 'Sellante necesario',
  sealant_done: 'Sellante realizado',
  multiple: 'Múltiples',
}

const SURFACES = ['V', 'D', 'M', 'L', 'O'] as const

const permanentJaw: number[][] = [
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
]

const deciduousJaw: number[][] = [
  [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
  [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
]

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface OdontogramSVGProps {
  teeth: ToothData[]
  onToothClick?: (toothNumber: number) => void
  selectedTooth?: number | null
}

function isDeciduous(tooth: number): boolean {
  return (tooth >= 51 && tooth <= 55) ||
         (tooth >= 61 && tooth <= 65) ||
         (tooth >= 71 && tooth <= 75) ||
         (tooth >= 81 && tooth <= 85)
}

export default function OdontogramSVG({ teeth, onToothClick, selectedTooth }: OdontogramSVGProps) {
  const getTooth = (toothNumber: number) =>
    teeth.find((t) => t.tooth_number === toothNumber)

  const cellW = 44
  const cellH = 60
  const gap = 4
  const jawGap = 36
  const deciduousGap = 16
  const offsetX = 20
  const offsetY = 32

  return (
    <svg
      viewBox={`0 0 ${cellW * 16 + gap * 15 + offsetX * 2} ${cellH * 4 + gap * 3 + deciduousGap * 3 + jawGap * 2 + offsetY * 2 + 20}`}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Labels */}
      <text x={offsetX} y={offsetY - 12} className="text-xs fill-gray-400" fontWeight="500">Permanente — Superior</text>
      <text x={offsetX} y={offsetY + cellH + jawGap - 12} className="text-xs fill-gray-400" fontWeight="500">Permanente — Inferior</text>
      <text x={offsetX} y={offsetY + cellH * 2 + jawGap * 2 + gap + deciduousGap - 12} className="text-xs fill-gray-400" fontWeight="500">Decidua — Superior</text>
      <text x={offsetX} y={offsetY + cellH * 3 + jawGap * 2 + gap * 2 + deciduousGap * 2 - 12} className="text-xs fill-gray-400" fontWeight="500">Decidua — Inferior</text>

      {/* Permanent teeth */}
      {permanentJaw.map((row, rowIdx) =>
        row.map((toothNum, colIdx) => {
          const tooth = getTooth(toothNum)
          const isUpper = rowIdx === 0
          const y = isUpper ? offsetY : offsetY + cellH + jawGap
          const x = offsetX + colIdx * (cellW + gap)

          let drawX = x
          if (colIdx >= 8) drawX = x + 8

          return (
            <ToothCell
              key={toothNum}
              toothNum={toothNum}
              tooth={tooth}
              x={drawX}
              y={y}
              cellW={cellW}
              selected={selectedTooth === toothNum}
              onClick={onToothClick}
            />
          )
        })
      )}

      {/* Deciduous teeth */}
      {deciduousJaw.map((row, rowIdx) =>
        row.map((toothNum, colIdx) => {
          const tooth = getTooth(toothNum)
          const isUpper = rowIdx === 0
          const y = isUpper
            ? offsetY + cellH * 2 + jawGap * 2 + gap + deciduousGap
            : offsetY + cellH * 3 + jawGap * 2 + gap * 2 + deciduousGap * 2
          const x = offsetX + colIdx * (cellW + gap)

          let drawX = x
          if (colIdx >= 5) drawX = x + 8

          return (
            <ToothCell
              key={toothNum}
              toothNum={toothNum}
              tooth={tooth}
              x={drawX}
              y={y}
              cellW={cellW}
              selected={selectedTooth === toothNum}
              onClick={onToothClick}
            />
          )
        })
      )}
    </svg>
  )
}

function ToothCell({
  toothNum,
  tooth,
  x,
  y,
  cellW,
  selected,
  onClick,
}: {
  toothNum: number
  tooth?: ToothData
  x: number
  y: number
  cellW: number
  selected: boolean
  onClick?: (n: number) => void
}) {
  const size = 28
  const figX = (cellW - size) / 2
  const figY = 24

  function getSurfaceColor(surf: string) {
    if (tooth?.status === 'extraction_done' || tooth?.status === 'extraction_indicated') {
      return '#f3f4f6'
    }
    const surfStatus = tooth?.surfaces?.[surf] || (tooth?.status !== 'multiple' ? tooth?.status : 'healthy') || 'healthy'
    return toothColors[surfStatus] || '#ffffff'
  }

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onClick?.(toothNum)}
      className="cursor-pointer select-none"
    >
      {/* Selection Border */}
      {selected && (
        <rect
          x={figX - 3}
          y={figY - 3}
          width={size + 6}
          height={size + 6}
          rx={6}
          ry={6}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2}
        />
      )}

      {/* Tooth Number */}
      <text
        x={cellW / 2}
        y={12}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] fill-gray-500 font-black"
      >
        {toothNum}
      </text>

      {/* 5-Surface Diamond Graphic */}
      <g transform={`translate(${figX}, ${figY})`}>
        {/* Vestibular (V) */}
        <polygon
          points="0,0 28,0 19,9 9,9"
          fill={getSurfaceColor('V')}
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
        {/* Distal (D) */}
        <polygon
          points="28,0 28,28 19,19 19,9"
          fill={getSurfaceColor('D')}
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
        {/* Lingual (L) */}
        <polygon
          points="9,19 19,19 28,28 0,28"
          fill={getSurfaceColor('L')}
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
        {/* Mesial (M) */}
        <polygon
          points="0,0 9,9 9,19 0,28"
          fill={getSurfaceColor('M')}
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
        {/* Oclusal/Incisal (O) */}
        <polygon
          points="9,9 19,9 19,19 9,19"
          fill={getSurfaceColor('O')}
          stroke="#94a3b8"
          strokeWidth={0.5}
        />
      </g>

      {/* Extraction Needed (Red X) */}
      {tooth?.status === 'extraction_indicated' && (
        <g stroke="#ef4444" strokeWidth={2}>
          <line x1={figX} y1={figY} x2={figX + size} y2={figY + size} />
          <line x1={figX + size} y1={figY} x2={figX} y2={figY + size} />
        </g>
      )}

      {/* Extraction Done (Blue X) */}
      {tooth?.status === 'extraction_done' && (
        <g stroke="#2563eb" strokeWidth={2}>
          <line x1={figX} y1={figY} x2={figX + size} y2={figY + size} />
          <line x1={figX + size} y1={figY} x2={figX} y2={figY + size} />
        </g>
      )}
    </g>
  )
}

export { toothColors, toothLabels, SURFACES, isDeciduous }
