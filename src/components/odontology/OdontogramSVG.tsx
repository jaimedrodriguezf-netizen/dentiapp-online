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
  const jawGap = 30
  const deciduousGap = 16
  const offsetX = 20
  const offsetY = 20

  return (
    <svg
      viewBox={`0 0 ${cellW * 16 + gap * 15 + offsetX * 2} ${cellH * 4 + gap * 3 + deciduousGap * 2 + jawGap + offsetY * 2 + 40}`}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Labels */}
      <text x={offsetX} y={offsetY - 5} className="text-xs fill-gray-400" fontWeight="500">Permanente — Superior</text>
      <text x={offsetX} y={offsetY + cellH + jawGap + 5} className="text-xs fill-gray-400" fontWeight="500">Permanente — Inferior</text>
      <text x={offsetX} y={offsetY + cellH * 2 + jawGap * 2 + gap + deciduousGap - 5} className="text-xs fill-gray-400" fontWeight="500">Decidua — Superior</text>
      <text x={offsetX} y={offsetY + cellH * 3 + jawGap * 2 + gap * 2 + deciduousGap + 5} className="text-xs fill-gray-400" fontWeight="500">Decidua — Inferior</text>

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
              cellH={cellH}
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
            : offsetY + cellH * 3 + jawGap * 2 + gap * 2 + deciduousGap
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
              cellH={cellH}
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
  cellH,
  selected,
  onClick,
}: {
  toothNum: number
  tooth?: ToothData
  x: number
  y: number
  cellW: number
  cellH: number
  selected: boolean
  onClick?: (n: number) => void
}) {
  const hasSurfaces = tooth?.surfaces && Object.keys(tooth.surfaces).length > 0
  const fillColor = tooth ? toothColors[tooth.status] || '#e5e7eb' : '#e5e7eb'

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onClick?.(toothNum)}
      className="cursor-pointer"
    >
      <rect
        x={1}
        y={1}
        width={cellW - 2}
        height={cellH - 2}
        rx={6}
        ry={6}
        fill={fillColor}
        stroke={selected ? '#2563eb' : '#d1d5db'}
        strokeWidth={selected ? 2.5 : 1}
      />
      {/* Surface lines */}
      {hasSurfaces && (
        <>
          <line x1={cellW / 2} y1={1} x2={cellW / 2} y2={cellH - 1} stroke="#fff" strokeWidth={1} opacity={0.5} />
          <line x1={1} y1={cellH / 2} x2={cellW - 1} y2={cellH / 2} stroke="#fff" strokeWidth={1} opacity={0.5} />
        </>
      )}
      <text
        x={cellW / 2}
        y={cellH / 2 + 4}
        textAnchor="middle"
        className="text-xs fill-gray-700"
        fontWeight={tooth ? '600' : '400'}
      >
        {toothNum}
      </text>
    </g>
  )
}

export { toothColors, toothLabels, SURFACES, isDeciduous }
