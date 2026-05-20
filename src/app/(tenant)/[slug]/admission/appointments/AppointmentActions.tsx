'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, CalendarClock } from 'lucide-react'
import { updateAppointmentStatus } from '../actions'
import RescheduleModal from './RescheduleModal'

interface Props {
  slug: string
  appointmentId: string
  status: string
  date: string
  time: string
}

export default function AppointmentActions({ slug, appointmentId, status, date, time }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)

  async function handleStatus(newStatus: string) {
    setLoading(newStatus)
    const result = await updateAppointmentStatus(slug, appointmentId, newStatus)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  if (status === 'cancelled' || status === 'completed') return null

  return (
    <>
      <div className="flex gap-2">
        {(status === 'scheduled' || status === 'confirmed') && (
          <>
            <button
              onClick={() => setShowReschedule(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Reprogramar
            </button>
            <button
              onClick={() => handleStatus('in_progress')}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading === 'in_progress' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Iniciar
            </button>
          </>
        )}
        {status === 'in_progress' && (
          <button
            onClick={() => handleStatus('completed')}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading === 'completed' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Completar
          </button>
        )}
        <button
          onClick={() => handleStatus('cancelled')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loading === 'cancelled' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          Cancelar
        </button>
      </div>

      {showReschedule && (
        <RescheduleModal
          slug={slug}
          appointmentId={appointmentId}
          currentDate={date}
          currentTime={time}
          onClose={() => {
            setShowReschedule(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
