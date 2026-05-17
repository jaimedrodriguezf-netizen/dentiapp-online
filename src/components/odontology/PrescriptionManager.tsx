'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, FileText } from 'lucide-react'
import VademecumSearch from './VademecumSearch'

interface PrescriptionItem {
  id?: string
  medication_id?: string | null
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: number | null
}

interface Props {
  slug: string
  recordId: string
}

export default function PrescriptionManager({ slug, recordId }: Props) {
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Load existing prescriptions
  useEffect(() => {
    async function load() {
      const res = await fetch(`/${slug}/odontology/api/prescriptions/${recordId}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.length > 0 ? data : [createEmpty()])
      } else {
        setItems([createEmpty()])
      }
      setLoading(false)
    }
    load()
  }, [slug, recordId])

  function createEmpty(): PrescriptionItem {
    return {
      medication_id: null,
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: null,
    }
  }

  function handleChange(index: number, field: keyof PrescriptionItem, value: any) {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleAdd() {
    setItems((prev) => [...prev, createEmpty()])
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleMedicationSelect(index: number, id: string, name: string) {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        medication_id: id || null,
        medication_name: name,
      }
      return updated
    })
  }

  async function handleSave() {
    const validItems = items.filter((item) => item.medication_name.trim())
    if (validItems.length === 0) {
      setError('Agregá al menos un medicamento')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    const res = await fetch(`/${slug}/odontology/api/prescriptions/${recordId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: validItems }),
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando receta...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Receta médica
        </h3>
      </div>

      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Medicamento #{index + 1}
            </span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <VademecumSearch
            defaultValue={item.medication_name}
            onSelect={(id, name) => handleMedicationSelect(index, id, name)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dosis</label>
              <input
                type="text"
                value={item.dosage}
                onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                placeholder="500mg"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Frecuencia</label>
              <input
                type="text"
                value={item.frequency}
                onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                placeholder="c/8h"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duración</label>
              <input
                type="text"
                value={item.duration}
                onChange={(e) => handleChange(index, 'duration', e.target.value)}
                placeholder="7 días"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
              <input
                type="number"
                value={item.quantity ?? ''}
                onChange={(e) => handleChange(index, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="14"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Indicaciones</label>
            <input
              type="text"
              value={item.instructions}
              onChange={(e) => handleChange(index, 'instructions', e.target.value)}
              placeholder="Tomar después de las comidas..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Agregar medicamento
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? 'Receta guardada ✓' : 'Guardar receta'}
        </button>
      </div>
    </div>
  )
}
