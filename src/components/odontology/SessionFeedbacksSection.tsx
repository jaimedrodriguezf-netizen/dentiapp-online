'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, User, Loader2, AlertCircle } from 'lucide-react'
import { addSessionFeedback } from '@/app/(tenant)/[slug]/odontology/actions'
import { SessionFeedback } from '@/app/(tenant)/[slug]/odontology/sessionFeedbacksHelpers'

interface SessionFeedbacksSectionProps {
  slug: string
  recordId: string
  sessionId: string
  initialFeedbacks: SessionFeedback[]
}

export default function SessionFeedbacksSection({
  slug,
  recordId,
  sessionId,
  initialFeedbacks,
}: SessionFeedbacksSectionProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [feedbacks, setFeedbacks] = useState<SessionFeedback[]>(initialFeedbacks)
  const [newNote, setNewNote] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState('')

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!newNote.trim()) {
      setErrorMessage('La nota de colaboración no puede estar vacía.')
      return
    }

    const finalAuthor = authorName.trim() || 'Odontólogo'

    startTransition(async () => {
      const res = await addSessionFeedback(slug, recordId, sessionId, finalAuthor, newNote)

      if (res && 'error' in res) {
        setErrorMessage(res.error)
      } else {
        // Añadir optimistamente al estado local para visualización instantánea
        const newFeedbackObj: SessionFeedback = {
          id: Math.random().toString(36).substring(2, 9),
          author: finalAuthor,
          date: new Date().toISOString(),
          text: newNote.trim(),
        }
        setFeedbacks((prev) => [...prev, newFeedbackObj])
        setNewNote('')
        router.refresh()
      }
    })
  }

  return (
    <div className="pt-2 border-t border-gray-50 space-y-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer select-none"
      >
        <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-50/10" />
        Notas de Colaboración Médica ({feedbacks.length})
      </button>

      {isOpen && (
        <div className="space-y-4 pl-2 border-l-2 border-dashed border-gray-100 ml-4 animate-in fade-in duration-200">
          {/* Notes list */}
          {feedbacks.length > 0 ? (
            <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
              {feedbacks.map((item) => {
                const formattedTime = new Date(item.date).toLocaleDateString('es-EC', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={item.id} className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl flex items-start gap-2.5 shadow-2xs hover:bg-gray-50 transition-colors animate-in slide-in-from-top-1 duration-150">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-950 uppercase tracking-tight truncate">
                          {item.author}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 shrink-0">
                          {formattedTime}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap leading-relaxed pl-0.5">
                        {item.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1 py-1">
              Sin notas de colaboración médica cargadas en esta sesión.
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleAddNote} className="space-y-2 bg-gray-50/20 p-3 rounded-[20px] border border-gray-100 shadow-sm">
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-150 rounded-xl text-red-800 text-[10px] font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-650" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Nombre del Odontólogo (Opcional)"
                disabled={isPending}
                className="w-full sm:col-span-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
              />
              <div className="w-full sm:col-span-2 relative flex items-center">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escribí una nota de colaboración..."
                  disabled={isPending}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white pl-3 pr-10 py-2 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isPending || !newNote.trim()}
                  className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer select-none disabled:opacity-40 flex items-center justify-center"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
