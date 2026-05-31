'use client'

import { useState, useTransition } from 'react'
import { PeriodontogramRecord, PeriodontogramData } from '@/types/periodontogram'
import {
  createEmptyPeriodontogram,
  calculatePeriodontalIndices
} from '@/utils/periodontogramHelpers'
import { savePeriodontogram, deletePeriodontogram } from '@/app/(tenant)/[slug]/odontology/periodontogram/actions'
import PeriodontalSummaryCards from './PeriodontalSummaryCards'
import PeriodontalSVGChart from './PeriodontalSVGChart'
import PeriodontalMatrixEditor from './PeriodontalMatrixEditor'
import { Calendar, Save, Trash2, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  patientId: string
  patientName: string
  slug: string
  initialRecords: PeriodontogramRecord[]
}

export default function PeriodontogramDashboard({
  patientId,
  patientName,
  slug,
  initialRecords
}: Props) {
  const [records, setRecords] = useState<PeriodontogramRecord[]>(initialRecords)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    initialRecords[0]?.id || null
  )

  // Estado para el examen activo que se está editando en pantalla
  const [activeData, setActiveData] = useState<PeriodontogramData>(() => {
    if (initialRecords[0]) {
      return initialRecords[0].data
    }
    return createEmptyPeriodontogram()
  })

  const [notes, setNotes] = useState<string>(() => {
    if (initialRecords[0]) {
      return initialRecords[0].notes || ''
    }
    return ''
  })

  const [examinationDate, setExaminationDate] = useState<string>(() => {
    if (initialRecords[0]) {
      return initialRecords[0].examination_date
    }
    return new Date().toISOString().split('T')[0]
  })

  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)



  // Cambiar el examen seleccionado en el historial
  const handleSelectRecord = (id: string | null) => {
    setSelectedRecordId(id)
    if (id === null) {
      // Examen Nuevo
      setActiveData(createEmptyPeriodontogram())
      setNotes('')
      setExaminationDate(new Date().toISOString().split('T')[0])
    } else {
      const rec = records.find((r) => r.id === id)
      if (rec) {
        setActiveData(rec.data)
        setNotes(rec.notes || '')
        setExaminationDate(rec.examination_date)
      }
    }
  }

  // Guardar el examen actual
  const handleSave = () => {
    startTransition(async () => {
      try {
        setToast(null)
        const saved = await savePeriodontogram(
          slug,
          patientId,
          null, // dentalRecordId
          examinationDate,
          notes,
          activeData,
          selectedRecordId || undefined
        )

        // Actualizar lista local de históricos
        let updatedRecords = [...records]
        if (selectedRecordId) {
          updatedRecords = updatedRecords.map((r) => (r.id === selectedRecordId ? saved : r))
        } else {
          updatedRecords = [saved, ...updatedRecords]
          setSelectedRecordId(saved.id)
        }

        setRecords(updatedRecords)
        setToast({ type: 'success', message: '¡Periodontograma guardado exitosamente!' })
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error al guardar el examen'
        setToast({ type: 'error', message: errMsg })
      }
    })
  }

  // Eliminar un examen del historial
  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este examen periodontal del historial? Esta acción no se puede deshacer.')) return

    startTransition(async () => {
      try {
        setToast(null)
        await deletePeriodontogram(slug, id)

        const remaining = records.filter((r) => r.id !== id)
        setRecords(remaining)
        
        // Cargar el primer examen restante o inicializar uno nuevo
        const nextId = remaining[0]?.id || null
        handleSelectRecord(nextId)

        setToast({ type: 'success', message: 'Examen periodontal eliminado' })
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error al eliminar el examen'
        setToast({ type: 'error', message: errMsg })
      }
    })
  }

  // Cálculos estadísticos en tiempo real sobre los datos activos
  const indices = calculatePeriodontalIndices(activeData)
  const teethPresentCount = Object.values(activeData.teeth).filter((t) => !t.isMissing).length

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div className="space-y-1.5">
          <Link
            href={`/${slug}/odontology`}
            className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Odontología
          </Link>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Periodontograma Clínico</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Paciente: <strong className="text-gray-900">{patientName}</strong>
          </p>
        </div>

        {/* Acciones principales y Toasts */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {selectedRecordId && (
            <button
              onClick={() => handleDelete(selectedRecordId)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-rose-100 bg-rose-50/20 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-97 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Examen
          </button>
        </div>
      </div>

      {/* Historial de Exámenes y Nueva Ficha (Selector Superior) */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block md:inline">Historial Clínico:</span>
          {records.length > 0 ? (
            records.map((r, idx) => {
              const isActive = r.id === selectedRecordId
              const dateStr = new Date(r.examination_date).toLocaleDateString('es-EC', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })

              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRecord(r.id)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                      : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Examen #{records.length - idx} ({dateStr})
                </button>
              )
            })
          ) : (
            <span className="text-xs font-semibold text-gray-400">Sin exámenes anteriores</span>
          )}
        </div>

        <button
          onClick={() => handleSelectRecord(null)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
            selectedRecordId === null
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo Examen
        </button>
      </div>

      {/* Alertas Toasts */}
      {toast && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Bento Grid de Índices Globales */}
      <PeriodontalSummaryCards
        plaqueIndex={indices.plaqueIndex}
        bleedingIndex={indices.bleedingIndex}
        totalEvaluatedPoints={indices.totalEvaluatedPoints}
        teethCount={teethPresentCount}
      />

      {/* 2. Visualizador del Perfil SVG */}
      <PeriodontalSVGChart teeth={activeData.teeth} />

      {/* 3. Editor de Celdas y Dientes */}
      <PeriodontalMatrixEditor
        teeth={activeData.teeth}
        onChange={(toothId, updated) => {
          setActiveData((prev) => ({
            ...prev,
            teeth: {
              ...prev.teeth,
              [toothId]: updated
            }
          }))
        }}
      />

      {/* Notas Generales del Examen */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Notas y Observaciones Generales</h3>
          <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider mt-0.5">Comentarios adicionales sobre el estado periodontal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Fecha de Examen</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={examinationDate}
                onChange={(e) => setExaminationDate(e.target.value)}
                className="input input-sm input-bordered pl-10 w-full rounded-xl text-xs font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Observaciones Clínicas</label>
            <textarea
              rows={2}
              placeholder="Escribí notas sobre inflamación generalizada, bolsas profundas detectadas, pérdida ósea, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered w-full rounded-xl text-xs font-semibold placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
