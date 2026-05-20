'use client'

import { useState, useCallback, useEffect } from 'react'
import { bookAppointment, getBusySlots } from './actions'
import { CalendarDays, CheckCircle, Loader2, Clock, X, User, Phone, Mail, ClipboardList, Sparkles } from 'lucide-react'

interface BookingFormProps {
  slug: string
}

interface SlotResponse {
  busy: string[]
}

interface BookingSuccessData {
  patient_name?: string
  date?: string
  time?: string
}

const MORNING_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

export default function BookingForm({ slug }: BookingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<BookingSuccessData | null>(null)
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
      try {
        const result = await getBusySlots(slug, date) as SlotResponse
        setBusySlots(result.busy)
      } finally {
        setFetchingSlots(false)
      }
    },
    [slug]
  )

  useEffect(() => {
    // Evitamos el error de setState síncrono en efecto usando un microtask
    // o simplemente disparando el efecto tras el mount.
    const timer = setTimeout(() => {
      fetchBusySlots(selectedDate)
    }, 0)
    return () => clearTimeout(timer)
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
    if (isBusy(time)) return 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed line-through'
    if (isPast(time)) return 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
    if (selectedTime === time) return 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-500/10'
    return 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 cursor-pointer active:scale-95'
  }

  async function handleSubmit(formData: FormData) {
    if (!selectedTime) {
      setError('Por favor, seleccioná un horario')
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

    setSuccess((result.data as BookingSuccessData) || {})
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card bg-white border-2 border-green-100 shadow-2xl rounded-[40px] overflow-hidden animate-in zoom-in duration-300">
        <div className="card-body items-center text-center py-12 md:py-16">
          <div className="w-20 h-20 rounded-[32px] bg-green-50 flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">¡Turno Agendado!</h3>
          <div className="mt-6 space-y-4 w-full">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Paciente</p>
               <p className="text-xl font-bold text-gray-900">
                 {success.patient_name || ''}
               </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700">
                 <CalendarDays className="w-5 h-5 mx-auto mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Fecha</p>
                 <p className="font-bold">
                   {success.date ? new Date(success.date + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }) : ''}
                 </p>
               </div>
               <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700">
                 <Clock className="w-5 h-5 mx-auto mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Hora</p>
                 <p className="font-bold">{success.time ? success.time.slice(0, 5) : ''} hs</p>
               </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccess(null)
              setSelectedTime(null)
            }}
            className="mt-10 btn btn-ghost btn-sm rounded-xl font-black text-gray-400 uppercase tracking-widest"
          >
            Tomar otro turno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-white border-2 border-gray-50 shadow-2xl rounded-[40px] overflow-hidden">
      <div className="card-body p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
           </div>
           <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Agendar Cita</h3>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border-2 border-red-100 p-4 text-sm text-red-700 mb-8 flex items-center gap-3 animate-shake">
            <X className="w-5 h-5 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <FormGroup label="Tu Nombre Completo *" icon={User}>
            <input
              type="text" name="name" required
              placeholder="Ej: Juan Pérez"
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormGroup label="WhatsApp / Celular *" icon={Phone}>
              <input
                type="tel" name="phone" required
                placeholder="+593 ..."
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </FormGroup>

            <FormGroup label="Email (Opcional)" icon={Mail}>
              <input
                type="email" name="email"
                placeholder="tu@email.com"
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </FormGroup>
          </div>

          <FormGroup label="Elegí el Día *" icon={CalendarDays}>
            <input
              type="date" name="date" required
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </FormGroup>

          {/* Time slots */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Seleccionar Horario *
            </label>
            
            {fetchingSlots ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consultando agenda...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 mb-3 ml-2 uppercase tracking-widest">Mañana</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MORNING_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={isBusy(time) || isPast(time)}
                        onClick={() => !isBusy(time) && !isPast(time) && setSelectedTime(time)}
                        className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${getSlotStyle(time)}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 mb-3 ml-2 uppercase tracking-widest">Tarde</p>
                  <div className="grid grid-cols-4 gap-2">
                    {AFTERNOON_SLOTS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        disabled={isBusy(time) || isPast(time)}
                        onClick={() => !isBusy(time) && !isPast(time) && setSelectedTime(time)}
                        className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${getSlotStyle(time)}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <FormGroup label="Motivo de visita" icon={ClipboardList}>
            <textarea
              name="reason" rows={2}
              placeholder="Contanos brevemente el motivo..."
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </FormGroup>

          {/* Consent checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <input
              type="checkbox"
              name="consent"
              required
              id="consent-data"
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="consent-data" className="text-xs font-medium text-gray-500 leading-relaxed">
              Acepto la{' '}
              <a 
                href={`/${slug}/privacy`} 
                target="_blank" 
                className="text-blue-600 font-bold underline hover:text-blue-700"
              >
                Política de Privacidad
              </a>{' '}
              y autorizo el tratamiento de mis datos personales para la gestión de turnos 
              y mi historia clínica odontológica.
            </label>
          </div>

          <button
            type="submit" disabled={loading || !selectedTime}
            className="w-full rounded-[24px] bg-blue-600 px-8 py-5 text-lg font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                CONFIRMANDO...
              </>
            ) : (
              <>
                CONFIRMAR MI TURNO
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="w-3 h-3 rounded-full border-2 border-gray-200 bg-white" />
            Libre
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="w-3 h-3 rounded-full border-2 border-red-100 bg-red-50" />
            Ocupado
          </div>
        </div>
      </div>
    </div>
  )
}

function FormGroup({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {children}
    </div>
  )
}
