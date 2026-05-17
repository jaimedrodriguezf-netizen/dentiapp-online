'use client'

interface ToothSVGProps {
  toothNumber: number
  status: string
  size?: number
}

export default function ToothSVG({ toothNumber, status, size = 80 }: ToothSVGProps) {
  const isUpper = toothNumber >= 11 && toothNumber <= 28
  const isLower = !isUpper

  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 80 96">
      {/* Simplified tooth crown */}
      <path
        d={
          isUpper
            ? 'M 10 40 Q 8 15, 20 8 Q 30-2, 40 2 Q 50-2, 60 8 Q 72 15, 70 40 L 60 50 Q 40 55, 20 50 Z'
            : 'M 10 56 Q 8 81, 20 88 Q 30 98, 40 94 Q 50 98, 60 88 Q 72 81, 70 56 L 60 46 Q 40 41, 20 46 Z'
        }
        fill={status === 'healthy' ? '#e5e7eb' : '#f87171'}
        stroke="#9ca3af"
        strokeWidth="1.5"
      />
      {/* Root */}
      <path
        d={
          isUpper
            ? 'M 25 48 Q 22 75, 28 90 L 40 92 L 52 90 Q 58 75, 55 48'
            : 'M 25 48 Q 22 21, 28 6 L 40 4 L 52 6 Q 58 21, 55 48'
        }
        fill={status === 'healthy' ? '#f3f4f6' : '#fca5a5'}
        stroke="#9ca3af"
        strokeWidth="1.5"
      />
      <text
        x={40}
        y={isUpper ? 70 : 26}
        textAnchor="middle"
        fontSize="11"
        fill="#4b5563"
        fontWeight="600"
      >
        {toothNumber}
      </text>
    </svg>
  )
}
