'use client'

import { useState, useEffect, useTransition, ClipboardEvent } from 'react'
import { FeedbackType, FeedbackContext } from '@/types/support'
import { createSupportFeedback } from './actions'
import { HelpCircle, ShieldAlert, Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react'

interface Props {
  slug: string
  userRole: string
}

// Comprimir y redimensionar imagen en el cliente para optimizar el storage
function compressImage(file: Blob, maxWidth = 1600, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(event.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.onerror = () => {
        resolve(event.target?.result as string)
      }
      img.src = event.target?.result as string
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

export default function SupportFeedbackPageForm({ slug, userRole }: Props) {
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

  // Capturar metadatos técnicos del entorno del usuario al montar el componente
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext({
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      userRole: userRole,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString()
    })
  }, [userRole])

  // Manejar pegar imagen (Ctrl+V) sobre la página
  const handlePaste = async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (blob) {
          try {
            const compressed = await compressImage(blob)
            setScreenshotBase64(compressed)
          } catch (err) {
            console.error('Error compressing pasted image:', err)
          }
        }
      }
    }
  }

  // Arrastrar y soltar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file)
        setScreenshotBase64(compressed)
      } catch (err) {
        console.error('Error compressing dropped image:', err)
      }
    }
  }

  // Carga de archivo tradicional
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file)
        setScreenshotBase64(compressed)
      } catch (err) {
        console.error('Error compressing selected image:', err)
      }
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
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error al enviar el reporte'
        setError(errMsg)
      }
    })
  }

  const resetForm = () => {
    setSuccess(false)
    setError(null)
    setMessage('')
    setScreenshotBase64(null)
  }

  return (
    <div 
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="space-y-5"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-base uppercase tracking-tight">¡Reporte Enviado!</h4>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto mt-1 leading-relaxed">
              Gracias por tu feedback. El equipo de soporte técnico y la IA analizarán el reporte a la brevedad.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Enviar otro reporte
          </button>
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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Tipo de Reporte</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'bug'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-500/10'
                    : 'bg-gray-50/50 border-gray-150 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <ShieldAlert className={`w-4 h-4 ${type === 'bug' ? 'text-rose-500' : 'text-gray-400'}`} />
                </div>
                <span>Bug / Error</span>
              </button>

              <button
                type="button"
                onClick={() => setType('feature')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'feature'
                    ? 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500/10'
                    : 'bg-gray-50/50 border-gray-150 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className={`w-4 h-4 ${type === 'feature' ? 'text-amber-500' : 'text-gray-400'}`} />
                </div>
                <span>Sugerencia</span>
              </button>

              <button
                type="button"
                onClick={() => setType('feedback')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  type === 'feedback'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/10'
                    : 'bg-gray-50/50 border-gray-150 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <HelpCircle className={`w-4 h-4 ${type === 'feedback' ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <span>Otro</span>
              </button>
            </div>
          </div>

          {/* Mensaje de descripción */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Descripción del reporte</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describí con detalle el problema o la sugerencia. Si es un bug, ¿qué estabas haciendo y qué error apareció?"
              className="w-full rounded-2xl border border-gray-150 bg-gray-50/20 px-4 py-3 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Dropzone de imagen */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Captura de Pantalla (Opcional)</label>
            
            {screenshotBase64 ? (
              <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 p-2 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={screenshotBase64} 
                  alt="Vista previa" 
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">captura-de-pantalla.png</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Captura cargada con éxito</p>
                  <button
                    type="button"
                    onClick={() => setScreenshotBase64(null)}
                    className="text-[10px] text-rose-500 hover:text-rose-600 font-bold mt-1.5 block transition-colors"
                  >
                    Eliminar captura
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-200 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-all bg-gray-50/20 group cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-2.5 bg-gray-50 border border-gray-150 rounded-xl text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Arrastrá una imagen o hacé clic para seleccionar</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                      También podés presionar <kbd className="px-1.5 py-0.5 rounded border bg-white font-mono text-[9px]">Ctrl + V</kbd> para pegar una captura del portapapeles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? 'Enviando Reporte...' : 'Enviar Reporte al Soporte'}
          </button>
        </form>
      )}
    </div>
  )
}
