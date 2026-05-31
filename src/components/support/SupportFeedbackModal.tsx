'use client'

import { useState, useEffect, useTransition, ClipboardEvent } from 'react'
import { FeedbackType, FeedbackContext } from '@/types/support'
import { createSupportFeedback } from '@/app/(tenant)/[slug]/settings/support/actions'
import { HelpCircle, X, ShieldAlert, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  slug: string
  userRole: string
}

export default function SupportFeedbackModal({ isOpen, onClose, slug, userRole }: Props) {
  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [context, setContext] = useState<FeedbackContext>({
    pathname: '',
    userAgent: '',
    userRole: userRole,
    viewportWidth: 0,
    viewportHeight: 0,
    timestamp: ''
  })

  // Capturar metadatos técnicos del entorno del usuario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContext({
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
        userRole: userRole,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timestamp: new Date().toISOString()
      })
      setSuccess(false)
      setError(null)
      setMessage('')
      setScreenshotBase64(null)
    }
  }, [isOpen, userRole])

  // Manejar pegar imagen (Ctrl+V) sobre el modal
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setScreenshotBase64(event.target.result as string)
            }
          }
          reader.readAsDataURL(blob)
        }
      }
    }
  }

  // Manejar arrastrar y soltar archivo (Drag & Drop)
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshotBase64(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Carga de archivo tradicional
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshotBase64(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Enviar el ticket
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Escribí una descripción detallada del reporte')
      return
    }

    startTransition(async () => {
      try {
        setError(null)
        await createSupportFeedback(slug, type, message, context, screenshotBase64)
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1500)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error al enviar el reporte'
        setError(errMsg)
      }
    })
  }

  if (!isOpen) return null

  return (
    <div 
      onPaste={handlePaste}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div 
        className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Cabecera */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">Soporte Técnico & Feedback</h3>
              <p className="text-[10px] text-blue-150 font-bold uppercase tracking-wider">Reportá bugs o solicitá mejoras al instante</p>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base uppercase tracking-tight">¡Reporte Enviado!</h4>
                <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto mt-1 leading-relaxed">
                  Gracias por tu feedback. El equipo de soporte técnico y la IA analizarán el diagnóstico a la brevedad.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Alerta de Error */}
              {error && (
                <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/20 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selector de Tipo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">¿Qué tipo de reporte es?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bug', 'feature', 'feedback'] as FeedbackType[]).map((t) => {
                    const isActive = type === t
                    const label = t === 'bug' ? 'Bug / Error' : t === 'feature' ? 'Mejora / Feature' : 'Comentario'
                    const Icon = t === 'bug' ? ShieldAlert : t === 'feature' ? Sparkles : HelpCircle
                    const colorClass = t === 'bug' 
                      ? (isActive ? 'bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-rose-50/50') 
                      : t === 'feature'
                      ? (isActive ? 'bg-amber-50 text-amber-600 border-amber-200' : 'hover:bg-amber-50/50')
                      : (isActive ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-blue-50/50')

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isActive 
                            ? `${colorClass} shadow-xs font-black border-2`
                            : 'bg-white border-gray-150 text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mensaje */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mensaje / Detalles del reporte</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detallá qué estabas haciendo, el error que visualizaste o qué funcionalidad te gustaría ver..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea textarea-bordered w-full rounded-2xl text-xs font-semibold placeholder:text-gray-300"
                />
              </div>

              {/* Zona de Imagen / Carga */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Captura de Pantalla (Opcional)</label>
                {!screenshotBase64 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-gray-200 bg-gray-50/30 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/5 transition-all cursor-pointer relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <span className="text-xs font-black text-gray-500 uppercase tracking-tight block">Arrastrá una captura o cargá un archivo</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-1">Soporte: podés pegar la imagen con CTRL + V</span>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2 group">
                    <img 
                      src={screenshotBase64} 
                      alt="Screenshot de soporte" 
                      className="max-h-[140px] rounded-lg object-contain shadow-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshotBase64(null)}
                      className="absolute top-3 right-3 bg-red-650 bg-red-600 text-white rounded-xl p-1.5 shadow-md hover:bg-red-700 transition-all opacity-80 group-hover:opacity-100"
                      title="Eliminar captura"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer de Enviar */}
              <div className="border-t border-gray-50 pt-4 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  {isPending && <span className="loading loading-spinner loading-xs" />}
                  Enviar Reporte
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
