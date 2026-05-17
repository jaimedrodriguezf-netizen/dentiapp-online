'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import OdontogramSVG, { toothColors, toothLabels, SURFACES, isDeciduous } from '@/components/odontology/OdontogramSVG'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface Props {
  recordId: string
  slug: string
  initialTeeth: ToothData[]
  recordPatientName: string
}

const statusOptions = Object.keys(toothColors).filter(s => s !== 'multiple')

const surfaceNames: Record<string, string> = {
  V: 'Vestibular', D: 'Distal', M: 'Mesial', L: 'Lingual', O: 'Oclusal',
}

export default function OdontogramPage({ recordId, slug, initialTeeth, recordPatientName }: Props) {
  const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth)
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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
    setSelectedTooth(toothNumber === selectedTooth ? null : toothNumber)
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

      // Calculate overall status from surfaces
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

  async function handleSave() {
    setSaving(true)
    setSuccess(false)

    const supabase = createClient()

    for (const tooth of teeth) {
      await supabase.from('odontogram_teeth').upsert(
        {
          dental_record_id: recordId,
          tooth_number: tooth.tooth_number,
          status: tooth.status,
          surfaces: tooth.surfaces,
        },
        { onConflict: 'dental_record_id,tooth_number' }
      )
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const selectedSurfaces = selectedTooth ? getToothSurfaces(selectedTooth) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}/odontology/form-033/${recordId}`}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Odontograma</h2>
            <p className="text-gray-500 mt-1">{recordPatientName}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>

      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <OdontogramSVG
            teeth={teeth}
            onToothClick={handleToothClick}
            selectedTooth={selectedTooth}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {statusOptions.map((status) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: toothColors[status] }}
                />
                {toothLabels[status]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status selector */}
      {selectedTooth && (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Diente {selectedTooth} {isDeciduous(selectedTooth) && <span className="text-xs font-normal text-gray-400">(deciduo)</span>}
            </h3>

            {/* Overall status */}
            <p className="text-xs text-gray-500 mb-2">Estado general</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(selectedTooth, status)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    getToothStatus(selectedTooth) === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: toothColors[status] }}
                  />
                  {toothLabels[status]}
                </button>
              ))}
            </div>

            {/* Surface selector */}
            <p className="text-xs text-gray-500 mb-2">Por superficie</p>
            <div className="grid grid-cols-5 gap-2">
              {SURFACES.map((surface) => (
                <div key={surface}>
                  <p className="text-xs text-center text-gray-400 mb-1">{surface}</p>
                  <select
                    value={selectedSurfaces?.[surface] || 'healthy'}
                    onChange={(e) => handleSurfaceChange(selectedTooth, surface, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      )}
    </div>
  )
}
