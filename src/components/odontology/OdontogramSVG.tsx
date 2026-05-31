'use client'

const toothColors: Record<string, string> = {
  healthy: '#4ade80',
  caries: '#f87171',
  filling: '#60a5fa',
  extraction_indicated: '#ef4444',
  extraction_done: '#3b82f6',
  lost_other: '#6b7280',
  endodontics_needed: '#eab308',
  endodontics_done: '#a855f7',
  crown_needed: '#fca5a5',
  crown: '#ca8a04',
  fixed_prosthesis_needed: '#fed7aa',
  fixed_prosthesis: '#0d9488',
  removable_prosthesis_needed: '#fbcfe8',
  removable_prosthesis_done: '#ec4899',
  total_prosthesis_needed: '#ddd6fe',
  total_prosthesis_done: '#6366f1',
  sealant_needed: '#818cf8',
  sealant_done: '#10b981',
  absent: '#94a3b8',
  multiple: '#64748b',
}

const toothLabels: Record<string, string> = {
  healthy: 'Sano',
  caries: 'Caries',
  filling: 'Obturado',
  extraction_indicated: 'Extracción indicada',
  extraction_done: 'Extraído (Pérdida por caries)',
  lost_other: 'Pérdida (Otra causa)',
  endodontics_needed: 'Endodoncia por realizar',
  endodontics_done: 'Endodoncia realizada',
  crown_needed: 'Corona indicada',
  crown: 'Corona realizada',
  fixed_prosthesis_needed: 'Prótesis fija indicada',
  fixed_prosthesis: 'Prótesis fija realizada',
  removable_prosthesis_needed: 'Prótesis removible indicada',
  removable_prosthesis_done: 'Prótesis removible realizada',
  total_prosthesis_needed: 'Prótesis total indicada',
  total_prosthesis_done: 'Prótesis total realizada',
  sealant_needed: 'Sellante necesario',
  sealant_done: 'Sellante realizado',
  absent: 'Ausente',
  multiple: 'Múltiples',
}

const toothGradients: Record<string, string> = {
  healthy: 'url(#grad-healthy)',
  caries: 'url(#grad-caries)',
  filling: 'url(#grad-filling)',
  extraction_indicated: 'url(#grad-extraction-indicated)',
  extraction_done: 'url(#grad-extraction-done)',
  endodontics_needed: 'url(#grad-endodontics-needed)',
  endodontics_done: 'url(#grad-endodontics-done)',
  crown: 'url(#grad-crown)',
  fixed_prosthesis: 'url(#grad-fixed-prosthesis)',
  sealant_needed: 'url(#grad-sealant-needed)',
  sealant_done: 'url(#grad-sealant-done)',
  multiple: 'url(#grad-multiple)',
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

export interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string> | null
}

interface OdontogramSVGProps {
  teeth: ToothData[]
  onToothClick?: (toothNumber: number) => void
  onSurfaceClick?: (toothNumber: number, surface: string) => void
  selectedTooth?: number | null
  variant?: 'modern' | 'msp'
}

function isDeciduous(tooth: number): boolean {
  return (tooth >= 51 && tooth <= 55) ||
         (tooth >= 61 && tooth <= 65) ||
         (tooth >= 71 && tooth <= 75) ||
         (tooth >= 81 && tooth <= 85)
}

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

export default function OdontogramSVG({ teeth, onToothClick, onSurfaceClick, selectedTooth, variant = 'modern' }: OdontogramSVGProps) {
  const getTooth = (toothNumber: number) =>
    teeth.find((t) => t.tooth_number === toothNumber)

  const cellW = 58
  const cellH = 80
  const gap = 4
  const jawGap = 36
  const deciduousGap = 16
  const offsetX = 20
  const offsetY = 32

  const row1Y = offsetY
  const row2Y = row1Y + cellH + deciduousGap
  const row3Y = row2Y + cellH + jawGap
  const row4Y = row3Y + cellH + deciduousGap

  const midX = offsetX + 8 * cellW + 7.5 * gap + 8

  return (
    <svg
      viewBox={`0 0 ${cellW * 16 + gap * 15 + offsetX * 2 + 16} ${row4Y + cellH + offsetY + 20}`}
      className="w-full max-w-3xl mx-auto"
    >
      <defs>
        {/* Healthy */}
        <linearGradient id="grad-healthy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        {/* Caries */}
        <linearGradient id="grad-caries" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fee2e2" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        {/* Filling */}
        <linearGradient id="grad-filling" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {/* Extraction Indicated */}
        <linearGradient id="grad-extraction-indicated" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        {/* Extraction Done */}
        <linearGradient id="grad-extraction-done" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        {/* Endodontics Needed */}
        <linearGradient id="grad-endodontics-needed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        {/* Endodontics Done */}
        <linearGradient id="grad-endodontics-done" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        {/* Crown */}
        <linearGradient id="grad-crown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        {/* Fixed Prosthesis */}
        <linearGradient id="grad-fixed-prosthesis" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        {/* Sealant Needed */}
        <linearGradient id="grad-sealant-needed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        {/* Sealant Done */}
        <linearGradient id="grad-sealant-done" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        {/* Multiple */}
        <linearGradient id="grad-multiple" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        
        {/* Soft realistic drop shadow for 3D look */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#475569" floodOpacity="0.12" />
        </filter>
        {/* High-definition blue glow for selection box */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Vertical dividing line */}
      <line
        x1={midX}
        y1={offsetY - 20}
        x2={midX}
        y2={row4Y + cellH + 16}
        stroke={variant === 'msp' ? '#000000' : '#cbd5e1'}
        strokeWidth={2}
        strokeDasharray={variant === 'msp' ? undefined : "4 4"}
        className={variant === 'msp' ? '' : "opacity-70"}
      />

      {/* Side indicators */}
      <text
        x={midX - 12}
        y={offsetY - 16}
        textAnchor="end"
        className={variant === 'msp' ? "text-[9px] font-black fill-black uppercase tracking-widest" : "text-[9px] font-black fill-gray-400 uppercase tracking-widest"}
      >
        Derecha (D)
      </text>
      <text
        x={midX + 12}
        y={offsetY - 16}
        textAnchor="start"
        className={variant === 'msp' ? "text-[9px] font-black fill-black uppercase tracking-widest" : "text-[9px] font-black fill-gray-400 uppercase tracking-widest"}
      >
        Izquierda (I)
      </text>

      {/* Row Labels for MSP format */}
      {variant === 'msp' && (
        <g fontSize="7" fontWeight="bold" fill="black">
          <text x={4} y={row1Y + 11} textAnchor="start">RECESIÓN</text>
          <text x={4} y={row1Y + 27} textAnchor="start">MOVILIDAD</text>
          <text x={4} y={row4Y + 59} textAnchor="start">MOVILIDAD</text>
          <text x={4} y={row4Y + 75} textAnchor="start">RECESIÓN</text>
        </g>
      )}

      {/* General Section Labels */}
      {variant !== 'msp' && (
        <>
          <text x={offsetX} y={row1Y - 12} className="text-xs fill-gray-400" fontWeight="500">Permanente — Superior</text>
          <text x={offsetX} y={row2Y - 12} className="text-xs fill-gray-400" fontWeight="500">Decidua — Superior</text>
          <text x={offsetX} y={row3Y - 12} className="text-xs fill-gray-400" fontWeight="500">Decidua — Inferior</text>
          <text x={offsetX} y={row4Y - 12} className="text-xs fill-gray-400" fontWeight="500">Permanente — Inferior</text>
        </>
      )}

      {/* Permanent teeth */}
      {permanentJaw.map((row, rowIdx) =>
        row.map((toothNum, colIdx) => {
          const tooth = getTooth(toothNum)
          const isUpper = rowIdx === 0
          const y = isUpper ? row1Y : row4Y
          const x = offsetX + colIdx * (cellW + gap)

          let drawX = x
          if (colIdx >= 8) drawX = x + 16

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
              onSurfaceClick={onSurfaceClick}
              variant={variant}
            />
          )
        })
      )}

      {/* Deciduous teeth */}
      {deciduousJaw.map((row, rowIdx) =>
        row.map((toothNum, colIdx) => {
          const tooth = getTooth(toothNum)
          const isUpper = rowIdx === 0
          const y = isUpper ? row2Y : row3Y
          // Centered by shifting by 3 columns
          const x = offsetX + (colIdx + 3) * (cellW + gap)

          let drawX = x
          if (colIdx >= 5) drawX = x + 16

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
              onSurfaceClick={onSurfaceClick}
              variant={variant}
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
  onSurfaceClick,
  variant = 'modern',
}: {
  toothNum: number
  tooth?: ToothData
  x: number
  y: number
  cellW: number
  selected: boolean
  onClick?: (n: number) => void
  onSurfaceClick?: (toothNum: number, surface: string) => void
  variant?: 'modern' | 'msp'
}) {
  const isDec = isDeciduous(toothNum)
  const isUpper = (toothNum >= 11 && toothNum <= 28) || (toothNum >= 51 && toothNum <= 65)
  const size = variant === 'msp' ? 28 : 45
  const figX = (cellW - size) / 2
  const figY = variant === 'msp' ? (isDec ? (isUpper ? 20 : 4) : (isUpper ? 48 : 0)) : 28

  const quadrant = Math.floor(toothNum / 10)
  const isRightSide = [1, 4, 5, 8].includes(quadrant)
  const leftSurfaceKey = isRightSide ? 'D' : 'M'
  const rightSurfaceKey = isRightSide ? 'M' : 'D'

  const hasSealantNeeded = tooth?.status === 'sealant_needed' || Object.values(tooth?.surfaces || {}).includes('sealant_needed')
  const hasSealantDone = tooth?.status === 'sealant_done' || Object.values(tooth?.surfaces || {}).includes('sealant_done')

  const cx = cellW / 2
  const cy = variant === 'msp' ? (isDec ? (isUpper ? 34 : 18) : (isUpper ? 62 : 14)) : 0

  function getSurfaceColor(surf: string) {
    if (tooth?.status === 'extraction_done' || tooth?.status === 'extraction_indicated' || tooth?.status === 'absent' || tooth?.status === 'lost_other') {
      return 'url(#grad-healthy)'
    }
    const surfStatus = tooth?.surfaces?.[surf] || (tooth?.status !== 'multiple' ? tooth?.status : 'healthy') || 'healthy'
    return toothGradients[surfStatus] || 'url(#grad-healthy)'
  }

  function getMspSurfaceColor(surf: string) {
    if (tooth?.status === 'extraction_done' || tooth?.status === 'extraction_indicated' || tooth?.status === 'absent' || tooth?.status === 'lost_other') {
      return '#ffffff'
    }
    const surfStatus = tooth?.surfaces?.[surf] || (tooth?.status !== 'multiple' ? tooth?.status : 'healthy') || 'healthy'
    if (surfStatus === 'caries') return '#ef4444'
    if (surfStatus === 'filling') return '#3b82f6'
    return '#ffffff'
  }

  function renderMspToothSymbols(boxY: number) {
    const centerFigX = figX + size / 2
    const centerFigY = boxY + size / 2

    return (
      <g className="pointer-events-none">
        {/* Extraction indicated (Red X) */}
        {tooth?.status === 'extraction_indicated' && (
          <g stroke="#ef4444" strokeWidth={1.5}>
            <line x1={figX} y1={boxY} x2={figX + size} y2={boxY + size} />
            <line x1={figX + size} y1={boxY} x2={figX} y2={boxY + size} />
          </g>
        )}

        {/* Pérdida por caries (Blue X) */}
        {tooth?.status === 'extraction_done' && (
          <g stroke="#3b82f6" strokeWidth={1.5}>
            <line x1={figX} y1={boxY} x2={figX + size} y2={boxY + size} />
            <line x1={figX + size} y1={boxY} x2={figX} y2={boxY + size} />
          </g>
        )}

        {/* Ausente (Blue A) */}
        {tooth?.status === 'absent' && (
          <text x={centerFigX} y={centerFigY} textAnchor="middle" dominantBaseline="central" fill="#3b82f6" fontSize="12" fontWeight="bold">
            A
          </text>
        )}

        {/* Pérdida otra causa (Blue U) */}
        {tooth?.status === 'lost_other' && (
          <text x={centerFigX} y={centerFigY} textAnchor="middle" dominantBaseline="central" fill="#3b82f6" fontSize="12" fontWeight="bold">
            U
          </text>
        )}

        {/* Corona indicada (Red a) */}
        {tooth?.status === 'crown_needed' && (
          <text x={centerFigX} y={centerFigY} textAnchor="middle" dominantBaseline="central" fill="#ef4444" fontSize="12" fontWeight="bold">
            a
          </text>
        )}

        {/* Corona realizada (Blue a) */}
        {tooth?.status === 'crown' && (
          <text x={centerFigX} y={centerFigY} textAnchor="middle" dominantBaseline="central" fill="#3b82f6" fontSize="12" fontWeight="bold">
            a
          </text>
        )}

        {/* Endodoncia por realizar (Red r) */}
        {tooth?.status === 'endodontics_needed' && (
          <text x={centerFigX} y={isUpper ? boxY + size + 8 : boxY - 4} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
            r
          </text>
        )}

        {/* Endodoncia realizada (Blue r) */}
        {tooth?.status === 'endodontics_done' && (
          <text x={centerFigX} y={isUpper ? boxY + size + 8 : boxY - 4} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">
            r
          </text>
        )}

        {/* Prótesis fija indicada (Red ¨---¨) */}
        {tooth?.status === 'fixed_prosthesis_needed' && (
          <g stroke="#ef4444" strokeWidth={1}>
            <line x1={figX} y1={centerFigY} x2={figX + size} y2={centerFigY} strokeDasharray="2 2" />
            <circle cx={figX + 2} cy={centerFigY} r={1.5} fill="#ef4444" />
            <circle cx={figX + size - 2} cy={centerFigY} r={1.5} fill="#ef4444" />
          </g>
        )}

        {/* Prótesis fija realizada (Blue ¨---¨) */}
        {tooth?.status === 'fixed_prosthesis' && (
          <g stroke="#3b82f6" strokeWidth={1}>
            <line x1={figX} y1={centerFigY} x2={figX + size} y2={centerFigY} strokeDasharray="2 2" />
            <circle cx={figX + 2} cy={centerFigY} r={1.5} fill="#3b82f6" />
            <circle cx={figX + size - 2} cy={centerFigY} r={1.5} fill="#3b82f6" />
          </g>
        )}

        {/* Prótesis removible indicada (Red (-----)) */}
        {tooth?.status === 'removable_prosthesis_needed' && (
          <g stroke="#ef4444" fill="none" strokeWidth={1}>
            <path d={`M ${figX} ${boxY + 2} Q ${centerFigX} ${boxY - 2} ${figX + size} ${boxY + 2}`} />
            <path d={`M ${figX} ${boxY + size - 2} Q ${centerFigX} ${boxY + size + 2} ${figX + size} ${boxY + size - 2}`} />
          </g>
        )}

        {/* Prótesis removible realizada (Blue (-----)) */}
        {tooth?.status === 'removable_prosthesis_done' && (
          <g stroke="#3b82f6" fill="none" strokeWidth={1}>
            <path d={`M ${figX} ${boxY + 2} Q ${centerFigX} ${boxY - 2} ${figX + size} ${boxY + 2}`} />
            <path d={`M ${figX} ${boxY + size - 2} Q ${centerFigX} ${boxY + size + 2} ${figX + size} ${boxY + size - 2}`} />
          </g>
        )}

        {/* Prótesis total indicada (Red ═) */}
        {tooth?.status === 'total_prosthesis_needed' && (
          <g stroke="#ef4444" strokeWidth={1}>
            <line x1={figX} y1={centerFigY - 2} x2={figX + size} y2={centerFigY - 2} />
            <line x1={figX} y1={centerFigY + 2} x2={figX + size} y2={centerFigY + 2} />
          </g>
        )}

        {/* Prótesis total realizada (Blue ═) */}
        {tooth?.status === 'total_prosthesis_done' && (
          <g stroke="#3b82f6" strokeWidth={1}>
            <line x1={figX} y1={centerFigY - 2} x2={figX + size} y2={centerFigY - 2} />
            <line x1={figX} y1={centerFigY + 2} x2={figX + size} y2={centerFigY + 2} />
          </g>
        )}
      </g>
    )
  }

  // --- Variant MSP Rendering ---
  if (variant === 'msp') {
    const numY = isDec ? (isUpper ? 14 : 48) : (isUpper ? 40 : 42)

    return (
      <g transform={`translate(${x}, ${y})`} className="select-none">
        {/* Recesión / Movilidad Boxes for Upper Permanent Teeth */}
        {!isDec && isUpper && (
          <>
            {/* Recesión */}
            <rect x={figX} y={0} width={size} height={16} fill="none" stroke="black" strokeWidth={0.5} />
            {tooth?.surfaces?.recession && (
              <text x={cx} y={8} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="black">
                {tooth.surfaces.recession}
              </text>
            )}
            {/* Movilidad */}
            <rect x={figX} y={16} width={size} height={16} fill="none" stroke="black" strokeWidth={0.5} />
            {tooth?.surfaces?.mobility && (
              <text x={cx} y={24} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="black">
                {tooth.surfaces.mobility}
              </text>
            )}
          </>
        )}

        {/* Tooth Number */}
        <g onClick={() => onClick?.(toothNum)} className="cursor-pointer">
          <text
            x={cx}
            y={numY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontWeight="bold"
            fill="black"
          >
            {toothNum}
          </text>
          {hasSealantNeeded && <circle cx={cx} cy={numY} r={7} fill="none" stroke="#ef4444" strokeWidth={1.2} />}
          {hasSealantDone && <circle cx={cx} cy={numY} r={7} fill="none" stroke="#3b82f6" strokeWidth={1.2} />}
        </g>

        {/* Tooth shape (circle for deciduous, square for permanent) */}
        {isDec ? (
          <g>
            {/* Vestibular (V) */}
            <path
              d={makeArcPath(cx, cy, 5, 14, 225, 315)}
              fill={getMspSurfaceColor('V')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'V') }}
            />
            {/* Right surface */}
            <path
              d={makeArcPath(cx, cy, 5, 14, 315, 405)}
              fill={getMspSurfaceColor(rightSurfaceKey)}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, rightSurfaceKey) }}
            />
            {/* Lingual (L) */}
            <path
              d={makeArcPath(cx, cy, 5, 14, 45, 135)}
              fill={getMspSurfaceColor('L')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'L') }}
            />
            {/* Left surface */}
            <path
              d={makeArcPath(cx, cy, 5, 14, 135, 225)}
              fill={getMspSurfaceColor(leftSurfaceKey)}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, leftSurfaceKey) }}
            />
            {/* Oclusal (O) */}
            <circle
              cx={cx}
              cy={cy}
              r={5}
              fill={getMspSurfaceColor('O')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'O') }}
            />
            {renderMspToothSymbols(cy - 14)}
          </g>
        ) : (
          <g>
            {/* Vestibular (V) */}
            <polygon
              points={`0,0 ${size},0 ${size - 9},9 9,9`}
              transform={`translate(${figX}, ${figY})`}
              fill={getMspSurfaceColor('V')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'V') }}
            />
            {/* Right surface */}
            <polygon
              points={`${size},0 ${size},${size} ${size - 9},${size - 9} ${size - 9},9`}
              transform={`translate(${figX}, ${figY})`}
              fill={getMspSurfaceColor(rightSurfaceKey)}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, rightSurfaceKey) }}
            />
            {/* Lingual (L) */}
            <polygon
              points={`9,${size - 9} ${size - 9},${size - 9} ${size},${size} 0,${size}`}
              transform={`translate(${figX}, ${figY})`}
              fill={getMspSurfaceColor('L')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'L') }}
            />
            {/* Left surface */}
            <polygon
              points={`0,0 9,9 9,${size - 9} 0,${size}`}
              transform={`translate(${figX}, ${figY})`}
              fill={getMspSurfaceColor(leftSurfaceKey)}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, leftSurfaceKey) }}
            />
            {/* Oclusal (O) */}
            <polygon
              points={`9,9 ${size - 9},9 ${size - 9},${size - 9} 9,${size - 9}`}
              transform={`translate(${figX}, ${figY})`}
              fill={getMspSurfaceColor('O')}
              stroke="black"
              strokeWidth={0.5}
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSurfaceClick?.(toothNum, 'O') }}
            />
            {renderMspToothSymbols(figY)}
          </g>
        )}

        {/* Movilidad / Recesión Boxes for Lower Permanent Teeth */}
        {!isDec && !isUpper && (
          <>
            {/* Movilidad */}
            <rect x={figX} y={48} width={size} height={16} fill="none" stroke="black" strokeWidth={0.5} />
            {tooth?.surfaces?.mobility && (
              <text x={cx} y={56} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="black">
                {tooth.surfaces.mobility}
              </text>
            )}
            {/* Recesión */}
            <rect x={figX} y={64} width={size} height={16} fill="none" stroke="black" strokeWidth={0.5} />
            {tooth?.surfaces?.recession && (
              <text x={cx} y={72} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="black">
                {tooth.surfaces.recession}
              </text>
            )}
          </>
        )}
      </g>
    )
  }

  // --- Default Modern Rendering ---
  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="select-none"
    >
      <g
        className="transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03]"
        style={{ transformOrigin: '29px 40px', transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Selection Box for the entire tooth cell with soft glow filter */}
        {selected && (
          <rect
            x={figX - 3}
            y={figY - 3}
            width={size + 6}
            height={size + 6}
            rx={6}
            ry={6}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            filter="url(#glow)"
          />
        )}

        {/* Capsule button for Tooth Number (Detailed Mode) */}
        <g
          onClick={() => onClick?.(toothNum)}
          className="cursor-pointer"
        >
          <rect
            x={16}
            y={2}
            width={26}
            height={20}
            rx={10}
            ry={10}
            fill={selected ? '#3b82f6' : '#f1f5f9'}
            stroke={selected ? '#2563eb' : '#e2e8f0'}
            strokeWidth={1}
            className="hover:fill-blue-50 hover:stroke-blue-200 transition-colors"
          />
          <text
            x={cellW / 2}
            y={12}
            textAnchor="middle"
            dominantBaseline="central"
            className={`text-[9px] font-black ${selected ? 'fill-white' : 'fill-gray-600'}`}
          >
            {toothNum}
          </text>
        </g>

        {/* 5-Surface Diamond Graphic (Fast Mode - Direct Clicks) with 3D drop-shadow */}
        <g transform={`translate(${figX}, ${figY})`} filter="url(#shadow)">
          {/* Vestibular (V) */}
          <polygon
            points="0,0 45,0 30,15 15,15"
            fill={getSurfaceColor('V')}
            stroke="#cbd5e1"
            strokeWidth={0.5}
            className="cursor-pointer hover:brightness-95"
            style={{ transition: 'fill 200ms ease' }}
            onClick={(e) => {
              e.stopPropagation()
              onSurfaceClick?.(toothNum, 'V')
            }}
          />
          {/* Distal (D) */}
          <polygon
            points="45,0 45,45 30,30 30,15"
            fill={getSurfaceColor('D')}
            stroke="#cbd5e1"
            strokeWidth={0.5}
            className="cursor-pointer hover:brightness-95"
            style={{ transition: 'fill 200ms ease' }}
            onClick={(e) => {
              e.stopPropagation()
              onSurfaceClick?.(toothNum, 'D')
            }}
          />
          {/* Lingual (L) */}
          <polygon
            points="15,30 30,30 45,45 0,45"
            fill={getSurfaceColor('L')}
            stroke="#cbd5e1"
            strokeWidth={0.5}
            className="cursor-pointer hover:brightness-95"
            style={{ transition: 'fill 200ms ease' }}
            onClick={(e) => {
              e.stopPropagation()
              onSurfaceClick?.(toothNum, 'L')
            }}
          />
          {/* Mesial (M) */}
          <polygon
            points="0,0 15,15 15,30 0,45"
            fill={getSurfaceColor('M')}
            stroke="#cbd5e1"
            strokeWidth={0.5}
            className="cursor-pointer hover:brightness-95"
            style={{ transition: 'fill 200ms ease' }}
            onClick={(e) => {
              e.stopPropagation()
              onSurfaceClick?.(toothNum, 'M')
            }}
          />
          {/* Oclusal/Incisal (O) */}
          <polygon
            points="15,15 30,15 30,30 15,30"
            fill={getSurfaceColor('O')}
            stroke="#cbd5e1"
            strokeWidth={0.5}
            className="cursor-pointer hover:brightness-95"
            style={{ transition: 'fill 200ms ease' }}
            onClick={(e) => {
              e.stopPropagation()
              onSurfaceClick?.(toothNum, 'O')
            }}
          />
        </g>

        {/* Extraction Needed (Red X) */}
        {tooth?.status === 'extraction_indicated' && (
          <g stroke="#ef4444" strokeWidth={2} className="pointer-events-none">
            <line x1={figX} y1={figY} x2={figX + size} y2={figY + size} />
            <line x1={figX + size} y1={figY} x2={figX} y2={figY + size} />
          </g>
        )}

        {/* Extraction Done (Blue X) */}
        {tooth?.status === 'extraction_done' && (
          <g stroke="#2563eb" strokeWidth={2} className="pointer-events-none">
            <line x1={figX} y1={figY} x2={figX + size} y2={figY + size} />
            <line x1={figX + size} y1={figY} x2={figX} y2={figY + size} />
          </g>
        )}
      </g>
    </g>
  )
}

export { toothColors, toothLabels, SURFACES, isDeciduous }

