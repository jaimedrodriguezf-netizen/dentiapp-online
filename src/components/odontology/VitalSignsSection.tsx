'use client'

import { useState } from 'react'

interface VitalSignsProps {
  defaultValues?: {
    blood_pressure?: string
    heart_rate?: number
    respiratory_rate?: number
    temperature?: number
    spo2?: number
    weight?: number
    height?: number
    bmi?: number
  }
}

export default function VitalSignsSection({ defaultValues }: VitalSignsProps) {
  const [weight, setWeight] = useState(defaultValues?.weight?.toString() || '')
  const [height, setHeight] = useState(defaultValues?.height?.toString() || '')

  const bmi = weight && height
    ? (parseFloat(weight) / ((parseFloat(height) / 100) ** 2)).toFixed(1)
    : '—'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">TA (mmHg)</label>
        <input
          type="text"
          name="vital_bp"
          defaultValue={defaultValues?.blood_pressure || ''}
          placeholder="120/80"
          aria-label="TA"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">FC (lpm)</label>
        <input
          type="number"
          name="vital_hr"
          defaultValue={defaultValues?.heart_rate ?? ''}
          placeholder="72"
          aria-label="FC"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">FR (rpm)</label>
        <input
          type="number"
          name="vital_rr"
          defaultValue={defaultValues?.respiratory_rate ?? ''}
          placeholder="16"
          aria-label="FR"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Temp (°C)</label>
        <input
          type="number"
          name="vital_temp"
          defaultValue={defaultValues?.temperature ?? ''}
          placeholder="36.5"
          step="0.1"
          aria-label="Temp"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">SpO2 (%)</label>
        <input
          type="number"
          name="vital_spo2"
          defaultValue={defaultValues?.spo2 ?? ''}
          placeholder="98"
          min="0"
          max="100"
          aria-label="SpO2"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Peso (kg)</label>
        <input
          type="number"
          name="vital_weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="70"
          step="0.1"
          aria-label="Peso"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Talla (cm)</label>
        <input
          type="number"
          name="vital_height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="170"
          step="0.1"
          aria-label="Talla"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">IMC</label>
        <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500">
          {bmi}
        </div>
      </div>
    </div>
  )
}
