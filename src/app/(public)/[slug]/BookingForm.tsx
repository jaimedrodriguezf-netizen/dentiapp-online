'use client'

import { useState, useCallback, useEffect } from 'react'
import { bookAppointment, getBusySlots } from './actions'
import { CalendarDays, CheckCircle, Loader2, Clock, X } from 'lucide-react'

interface BookingFormProps {
  slug: string
}

const MORNING_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

export default function BookingForm({ slug }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Record<string, unknown> | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [busySlots, setBusySlots] = useState<string[]>([])
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const fetchBusySlots = useCallback(
    async (date: string) => {
      setFetchingSlots(true)
      setSelectedTime(null)
      const result = await getBusySlots(slug, date)
      setBusySlots(result.busy)
      setFetchingSlots(false)
    },
    [slug]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBusySlots(selectedDate)
  }, [selectedDate, fetchBusySlots])

  const isPast = (time: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (selectedDate > today) return false
    const now = new Date()
    const [h, m] = time.split(':').map(Number)
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
  }

  const isBusy = (time: string) => busySlots.includes(time)

  const getSlotStyle = (time: string) => {
    if (isBusy(time)) return 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through'
    if (isPast(time)) return 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
    if (selectedTime === time) return 'bg-blue-600 border-blue-600 text-white'
    return 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedTime) {
      setError('Seleccioná un horario disponible')
      return
    }

    formData.set('time', selectedTime)
    setLoading(true)
    setError(null)

    const result = await bookAppointment(slug, null, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(result.data || {})
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card bg-white border border-green-200 shadow-lg">
        <div className="card-body items-center text-center py-10">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">¡Turno confirmado!</h3>
          <div className="mt-4 space-y-1 text-gray-600">
            <p className="text-lg font-medium text-gray-900">
              {String((success as Record<string, unknown>).patient_name || '')}
            </p>
            <p className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {String((success as Record<string, unknown>).date || '')
                ? new Date(
                    String((success as Record<string, unknown>).date || '') + 'T00:00:00'
                  ).toLocaleDateString('es-EC', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''}
            </p>
            <p className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              {String((success as Record<string, unknown>).time || '').slice(0, 5)} hs
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(null)
              setSelectedTime(null)
            }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Tomar otro turno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-white border border-gray-200 shadow-lg">
      <div className="card-body p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Tomá tu turno</h3>
          <p className="text-sm text-gray-500 mt-1">Completá tus datos y elegí fecha y hora</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              type="text" name="name" required
              placeholder="Juan Pérez"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel" name="phone" required
              placeholder="+593 99 999 9999"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" name="email"
              placeholder="paciente@email.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date" name="date" required
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horario *</label>
            {fetchingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-500">Cargando horarios...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Morning */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Mañana</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MORNING_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={isBusy(time) || isPast(time)}
                        onClick={() => !isBusy(time) && !isPast(time) && setSelectedTime(time)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors ${getSlotStyle(time)}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Afternoon */}
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Tarde</p>
                  <div className="grid grid-cols-4 gap-2">
                    {AFTERNOON_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={isBusy(time) || isPast(time)}
                        onClick={() => !isBusy(time) && !isPast(time) && setSelectedTime(time)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors ${getSlotStyle(time)}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {selectedTime && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Seleccionado: {selectedTime} hs
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              name="reason" rows={2}
              placeholder="Ej: Control, limpieza, dolor..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit" disabled={loading || !selectedTime}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirmando turno...
              </>
            ) : (
              'Tomar Turno'
            )}
          </button>
        </form>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-4 h-4 rounded border border-gray-200 bg-white" />
            Disponible
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-4 h-4 rounded border border-red-200 bg-red-50" />
            Ocupado
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-4 h-4 rounded border border-gray-200 bg-gray-100" />
            Pasado
          </div>
        </div>
      </div>
    </div>
  )
}
