'use client'

import { useState } from 'react'
import { SupportFeedback } from '@/types/support'
import SupportFeedbackPageForm from './SupportFeedbackPageForm'
import SupportFeedbackListClient from './SupportFeedbackListClient'
import { LifeBuoy, PlusCircle, Inbox, CheckCircle2 } from 'lucide-react'

interface FeedbackWithUrl extends SupportFeedback {
  screenshotUrl: string | null
}

interface Props {
  initialFeedbacks: FeedbackWithUrl[]
  slug: string
  userRole: string
}

export default function SupportFeedbackContainerClient({
  initialFeedbacks,
  slug,
  userRole,
}: Props) {
  // Si no hay tickets, empezar en el formulario; si hay tickets y puede gestionar, empezar en la lista
  const [activeTab, setActiveTab] = useState<'create' | 'list'>(
    initialFeedbacks.length === 0 ? 'create' : 'list'
  )

  const pendingCount = initialFeedbacks.filter((f) => f.status === 'pending').length
  const resolvedCount = initialFeedbacks.filter((f) => f.status === 'resolved').length

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header del Centro de Soporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Mesa de Ayuda y Soporte Técnico
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Reportá errores, sugerí mejoras o adjuntá capturas para que el equipo técnico lo resuelva.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de cambio de pestaña */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Nueva Solicitud
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4 text-gray-500" />
            Historial
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'create' ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Enviar reporte o consulta técnica
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Escribí tu mensaje y podés adjuntar una captura de pantalla (arrastrando, pegando con Ctrl+V o seleccionando el archivo).
              </p>
            </div>

            <SupportFeedbackPageForm slug={slug} userRole={userRole} />
          </div>

          {/* Tips útiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Capturas directas
              </p>
              <p>Podés presionar ImpPnt / PrintScreen y pegar con Ctrl+V directo en el recuadro.</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Respaldo en la nube
              </p>
              <p>El reporte y la imagen se guardan de forma privada y segura en Supabase.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Total reportes: <strong>{initialFeedbacks.length}</strong> ({pendingCount} pendientes, {resolvedCount} resueltos)
            </span>
            <button
              onClick={() => setActiveTab('create')}
              className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Enviar otro reporte
            </button>
          </div>

          <SupportFeedbackListClient initialFeedbacks={initialFeedbacks} slug={slug} />
        </div>
      )}
    </div>
  )
}
