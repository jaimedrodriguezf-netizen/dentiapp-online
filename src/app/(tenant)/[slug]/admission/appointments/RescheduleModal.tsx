'use client'

import { useState, useCallback, useEffect } from 'react'
import { rescheduleAppointment, getOperatingHours } from '../../settings/actions'
import type { OperatingHour } from '../../settings/actions'
import { CalendarDays, Clock, Loader2, X, ChevronRight } from 'lucide-react'

interface Props {
  slug: string
  appointmentId: string
  currentDate: string
  currentTime: string
  onClose: () => void
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

export default function RescheduleModal({ slug, appointmentId, currentDate, currentTime, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([])

  useEffect(() => {
    getOperatingHours(slug).then(setOperatingHours)
  }, [slug])

  const dayOfWeek = new Date(selectedDate + 'T00:00:00').getDay()
  const dayHours = operatingHours.find(h => h.day_of_week === dayOfWeek)

  async function handleReschedule() {
    if (!selectedTime) {
      setError('Seleccioná un horario')
      return
    }

    setLoading(true)
    setError(null)

    const result = await rescheduleAppointment(slug, appointmentId, selectedDate, selectedTime)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onClose()
  }

  const isPast = (time: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (selectedDate > today) return false
    const now = new Date()
    const [h, m] = time.split(':').map(Number)
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Reprogramar Turno</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border-2 border-red-100 p-4 text-sm text-red-700 flex items-center gap-3">
              <X className="w-4 h-4 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
              Nueva Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime(null)
              }}
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {dayHours && !dayHours.is_open ? (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-100 rounded-2xl text-center">
              <p className="text-sm font-bold text-yellow-700">
                La clínica no atiende los {getDayName(dayOfWeek)}. Elegí otra fecha.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Nuevo Horario
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => {
                  const disabled = isPast(time)
                  const selected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedTime(time)}
                      className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${
                        disabled
                          ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          : selected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleReschedule}
            disabled={loading || !selectedTime}
            className="w-full rounded-[24px] bg-blue-600 px-8 py-5 text-lg font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                REPROGRAMANDO...
              </>
            ) : (
              <>
                CONFIRMAR CAMBIO
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function getDayName(day: number): string {
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return names[day] || 'Desconocido'
}
