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
}

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
  surfaces?: Record<string, boolean>
}

interface OdontogramSVGProps {
  teeth: ToothData[]
  onToothClick?: (toothNumber: number) => void
  selectedTooth?: number | null
}

export default function OdontogramSVG({ teeth, onToothClick, selectedTooth }: OdontogramSVGProps) {
  const getTooth = (toothNumber: number) =>
    teeth.find((t) => t.tooth_number === toothNumber)

  const cellW = 44
  const cellH = 60
  const gap = 4
  const jawGap = 40
  const offsetX = 20
  const offsetY = 20

  return (
    <svg
      viewBox={`0 0 ${cellW * 16 + gap * 15 + offsetX * 2} ${cellH * 2 + gap + jawGap + offsetY * 2 + 40}`}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Labels */}
      <text x={offsetX} y={offsetY - 5} className="text-xs fill-gray-400" fontWeight="500">Superior</text>
      <text x={offsetX} y={offsetY + cellH + jawGap + 5} className="text-xs fill-gray-400" fontWeight="500">Inferior</text>

      {/* Jaw arches */}
      {permanentJaw.map((row, rowIdx) =>
        row.map((toothNum, colIdx) => {
          const tooth = getTooth(toothNum)
          const isUpper = rowIdx === 0
          const y = isUpper ? offsetY : offsetY + cellH + jawGap
          const x = offsetX + colIdx * (cellW + gap)

          // Middle line in quadrants
          let drawX = x
          let flip = false
          if (colIdx >= 8) {
            drawX = x + 8
            flip = true
          }

          return (
            <g
              key={toothNum}
              transform={`translate(${drawX}, ${y})`}
              onClick={() => onToothClick?.(toothNum)}
              className="cursor-pointer"
            >
              <rect
                x={1}
                y={1}
                width={cellW - 2}
                height={cellH - 2}
                rx={6}
                ry={6}
                fill={tooth ? toothColors[tooth.status] || '#e5e7eb' : '#e5e7eb'}
                stroke={selectedTooth === toothNum ? '#2563eb' : '#d1d5db'}
                strokeWidth={selectedTooth === toothNum ? 2.5 : 1}
              />
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
        })
      )}
    </svg>
  )
}

export { toothColors, toothLabels }
