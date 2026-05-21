'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, FileText, Zap, Sparkles, Printer } from 'lucide-react'
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

interface PrescriptionTemplate {
  name: string
  icon: string
  items: PrescriptionItem[]
}

interface Props {
  slug: string
  recordId: string
}

const templates: PrescriptionTemplate[] = [
  {
    name: 'Post-Extracción',
    icon: '🦷',
    items: [
      { medication_name: 'Ibuprofeno', dosage: '600mg', frequency: 'c/8h', duration: '3 días', instructions: 'Tomar después de las comidas', quantity: 10 },
      { medication_name: 'Amoxicilina', dosage: '500mg', frequency: 'c/8h', duration: '7 días', instructions: 'Completar el ciclo de antibiótico', quantity: 21 },
    ]
  },
  {
    name: 'Infección Leve',
    icon: '🦠',
    items: [
      { medication_name: 'Amoxicilina + Ácido Clavulánico', dosage: '875/125mg', frequency: 'c/12h', duration: '7 días', instructions: 'Tomar con abundante agua', quantity: 14 },
      { medication_name: 'Paracetamol', dosage: '1g', frequency: 'c/8h', duration: '3 días', instructions: 'En caso de dolor o fiebre', quantity: 10 },
    ]
  },
  {
    name: 'Gingivitis/Periodontitis',
    icon: '👄',
    items: [
      { medication_name: 'Clorhexidina colutorio 0.12%', dosage: '15ml', frequency: 'c/12h', duration: '15 días', instructions: 'Enjuagar durante 30 segundos, no ingerir', quantity: 1 },
    ]
  }
]

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

  function handleChange(index: number, field: keyof PrescriptionItem, value: string | number | null) {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleAdd() {
    setItems((prev) => [...prev, createEmpty()])
  }

  function applyTemplate(template: PrescriptionTemplate) {
    // Si la lista está vacía o solo tiene un item vacío, reemplazamos todo
    const isListEmpty = items.length === 1 && !items[0].medication_name
    
    if (isListEmpty) {
      setItems([...template.items])
    } else {
      // Si ya hay items, agregamos los de la plantilla al final
      setItems(prev => [...prev, ...template.items])
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Receta Médica
        </h3>
      </div>

      {/* ⚡ SECCIÓN DE PLANTILLAS RÁPIDAS */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Recetas Rápidas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.name}
              type="button"
              onClick={() => applyTemplate(template)}
              className="px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span>{template.icon}</span>
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">
                  {index + 1}
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Medicamento
                </span>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <VademecumSearch
                defaultValue={item.medication_name}
                onSelect={(id, name) => handleMedicationSelect(index, id, name)}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dosis</label>
                  <input
                    type="text"
                    value={item.dosage}
                    onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                    placeholder="Ej: 500mg"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frecuencia</label>
                  <input
                    type="text"
                    value={item.frequency}
                    onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                    placeholder="Ej: c/8h"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duración</label>
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => handleChange(index, 'duration', e.target.value)}
                    placeholder="Ej: 7 días"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
                  <input
                    type="number"
                    value={item.quantity ?? ''}
                    onChange={(e) => handleChange(index, 'quantity', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Ej: 14"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Indicaciones Adicionales</label>
                <input
                  type="text"
                  value={item.instructions}
                  onChange={(e) => handleChange(index, 'instructions', e.target.value)}
                  placeholder="Ej: Tomar después del almuerzo..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button
          type="button"
          onClick={handleAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-6 py-3 text-sm font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Agregar Medicamento
        </button>

        <div className="flex-1" />

        {items.some((item) => item.medication_name.trim()) && (
          <a
            href={`/${slug}/odontology/form-033/${recordId}/print?type=prescription`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Imprimir Receta
          </a>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-10 py-3 text-sm font-black text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
            success ? 'bg-success shadow-success/20' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? '¡Receta Guardada!' : 'GUARDAR RECETA'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-xs font-bold">
          <Trash2 className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}
