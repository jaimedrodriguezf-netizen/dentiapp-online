'use client'

import { useState, useTransition } from 'react'
import { SupportFeedback, FeedbackType, FeedbackStatus } from '@/types/support'
import { resolveSupportFeedback } from './actions'
import { 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  CheckCircle, 
  Eye, 
  Monitor, 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Bot, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react'

interface FeedbackWithUrl extends SupportFeedback {
  screenshotUrl: string | null
}

interface Props {
  initialFeedbacks: FeedbackWithUrl[]
  slug: string
}

export default function SupportFeedbackListClient({ initialFeedbacks, slug }: Props) {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithUrl[]>(initialFeedbacks)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialFeedbacks.length > 0 ? initialFeedbacks[0].id : null
  )
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all')
  const [isPending, startTransition] = useTransition()

  const selectedFeedback = feedbacks.find(f => f.id === selectedId)

  // Filtrado de feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    const typeMatch = filterType === 'all' || f.type === filterType
    const statusMatch = filterStatus === 'all' || f.status === filterStatus
    return typeMatch && statusMatch
  })

  const handleResolve = async (feedbackId: string) => {
    if (!confirm('¿Estás seguro de marcar este reporte como resuelto? Se eliminará permanentemente la captura de pantalla asociada para ahorrar espacio.')) {
      return
    }

    startTransition(async () => {
      try {
        const success = await resolveSupportFeedback(slug, feedbackId)
        if (success) {
          setFeedbacks(prev => 
            prev.map(f => 
              f.id === feedbackId 
                ? { ...f, status: 'resolved', screenshot_path: null, screenshotUrl: null } 
                : f
            )
          )
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al resolver el feedback')
      }
    })
  }

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-4 h-4 text-rose-500" />
      case 'feature':
        return <Lightbulb className="w-4 h-4 text-amber-500" />
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeBadge = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 uppercase border border-rose-100">Bug</span>
      case 'feature':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 uppercase border border-amber-100">Mejora</span>
      case 'feedback':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase border border-blue-100">Comentario</span>
    }
  }

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-100">Pendiente</span>
      case 'diagnosed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1"><Bot className="w-3 h-3" /> Diagnosticado</span>
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">Resuelto</span>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Filtros de Control */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
              filterType === 'all'
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todos los Tipos
          </button>
          <button
            onClick={() => setFilterType('bug')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 ${
              filterType === 'bug'
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-rose-50/50 border-rose-100 text-rose-700 hover:bg-rose-100/50'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            Bugs
          </button>
          <button
            onClick={() => setFilterType('feature')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 ${
              filterType === 'feature'
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-100/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Mejoras
          </button>
          <button
            onClick={() => setFilterType('feedback')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 ${
              filterType === 'feedback'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-blue-50/50 border-blue-100 text-blue-700 hover:bg-blue-100/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Comentarios
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Estado:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | 'all')}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="diagnosed">Diagnosticados (IA)</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Sin reportes registrados</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-md">
            Acá vas a ver los reportes que envíen tus usuarios usando el botón de soporte flotante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna de Master (Lista) */}
          <div className="lg:col-span-5 space-y-3 max-h-[650px] overflow-y-auto pr-2">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Ningún reporte coincide con los filtros aplicados.
              </div>
            ) : (
              filteredFeedbacks.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedId === f.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeIcon(f.type)}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        selectedId === f.id ? 'text-indigo-100' : 'text-gray-400'
                      }`}>
                        {f.type === 'bug' ? 'Bug' : f.type === 'feature' ? 'Mejora' : 'Feedback'}
                      </span>
                      <span className={`text-[10px] ${
                        selectedId === f.id ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        • {formatDate(f.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm font-bold truncate ${
                      selectedId === f.id ? 'text-white' : 'text-gray-800'
                    }`}>
                      {f.message}
                    </p>
                    <p className={`text-xs truncate ${
                      selectedId === f.id ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {f.user_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="scale-75 origin-right">
                      {getStatusBadge(f.status)}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      selectedId === f.id ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Columna de Detail */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
            {selectedFeedback ? (
              <div className="p-6 space-y-6">
                {/* Cabecera del Detalle */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(selectedFeedback.type)}
                      {getStatusBadge(selectedFeedback.status)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      Reporte de Soporte
                    </h3>
                    <p className="text-xs text-gray-400">
                      ID: {selectedFeedback.id} • Creado el {formatDate(selectedFeedback.created_at)}
                    </p>
                  </div>

                  {selectedFeedback.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(selectedFeedback.id)}
                      disabled={isPending}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-500/15 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolver
                    </button>
                  )}
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Mensaje del Usuario</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedFeedback.message}
                  </div>
                </div>

                {/* Contexto Técnico */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Información de Contexto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-400 font-medium">Usuario / Rol</p>
                        <p className="text-gray-700 font-bold truncate mt-0.5">
                          {selectedFeedback.user_email} ({selectedFeedback.context.userRole})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-400 font-medium">Ruta del Error</p>
                        <p className="text-gray-700 font-bold truncate mt-0.5">
                          {selectedFeedback.context.pathname}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <Monitor className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-400 font-medium">Pantalla (Viewport)</p>
                        <p className="text-gray-700 font-bold truncate mt-0.5">
                          {selectedFeedback.context.viewportWidth} x {selectedFeedback.context.viewportHeight} px
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-400 font-medium">Fecha y Hora Local</p>
                        <p className="text-gray-700 font-bold truncate mt-0.5">
                          {selectedFeedback.context.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[10px] text-gray-500 font-mono break-all leading-normal">
                    <span className="font-bold text-gray-700 block mb-0.5 text-xs font-sans">User Agent</span>
                    {selectedFeedback.context.userAgent}
                  </div>
                </div>

                {/* Captura de Pantalla */}
                {selectedFeedback.screenshotUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Captura de Pantalla</h4>
                      <a
                        href={selectedFeedback.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver en pestaña nueva
                      </a>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 max-h-[300px] flex items-center justify-center group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedFeedback.screenshotUrl}
                        alt="Captura de pantalla del error"
                        className="object-contain max-h-[300px] w-full"
                      />
                    </div>
                  </div>
                ) : selectedFeedback.screenshot_path ? (
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-100 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-bold">Captura no disponible</p>
                      <p className="mt-0.5 text-yellow-700">
                        La captura existe en el Storage (`{selectedFeedback.screenshot_path}`), pero no pudimos generar un enlace de visualización válido.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 text-gray-500 rounded-2xl border border-gray-100 text-xs text-center">
                    No se adjuntó captura de pantalla para este reporte.
                  </div>
                )}

                {/* Diagnóstico por IA */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Diagnóstico Inteligente (IA)</h4>
                      <p className="text-[10px] text-gray-400">Generado analizando el código base y los metadatos</p>
                    </div>
                  </div>

                  {selectedFeedback.ai_diagnosis ? (
                    <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 text-gray-800 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-[250px] overflow-y-auto">
                      {selectedFeedback.ai_diagnosis}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 text-gray-500 rounded-2xl border border-gray-100 text-xs text-center italic">
                      {selectedFeedback.status === 'resolved' 
                        ? 'Este ticket fue resuelto antes de generarse un diagnóstico de IA.'
                        : 'El asistente de IA aún no ha diagnosticado este reporte. Escribí "dame los feedbacks" en el chat del asistente para gatillar el diagnóstico técnico.'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
                <div className="p-4 bg-gray-50 text-gray-400 rounded-full mb-3">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-gray-900 font-bold">Seleccioná un reporte</h4>
                <p className="text-gray-400 text-xs mt-1">
                  Elegí un reporte del listado para ver su contexto técnico y resolver el ticket.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
