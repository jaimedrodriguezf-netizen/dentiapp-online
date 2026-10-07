import { getAppointments } from '../actions'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Phone, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { getLocalDateString } from '@/lib/utils/date'
import AppointmentActions from './AppointmentActions'
import WeeklyCalendar from './WeeklyCalendar'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ view?: string; date?: string }>
}

interface AppointmentWithPatient {
  id: string
  date?: string
  time: string
  status: string
  reason: string | null
  patients: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  } | null
}

const statusLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Pendiente', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  confirmed: { label: 'Confirmado', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  in_progress: { label: 'En atención', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Atendido', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  no_show: { label: 'No asistió', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' },
}

export default async function AppointmentsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { view: viewParam, date: dateParam } = await searchParams
  const isWeekly = viewParam === 'week'

  // Resolver fecha activa
  const todayDate = new Date()
  const todayStr = getLocalDateString(todayDate)

  let activeDate = todayDate
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const parsed = new Date(dateParam + 'T00:00:00')
    if (!isNaN(parsed.getTime())) {
      activeDate = parsed
    }
  }

  const activeDateStr = getLocalDateString(activeDate)
  const isTodayActive = activeDateStr === todayStr

  // Si es semanal cargamos todas las citas del tenant para popular los 7 días; si es diaria solo la fecha activa
  const appointmentsRaw = isWeekly
    ? await getAppointments(slug)
    : await getAppointments(slug, activeDateStr)

  const appointments = (appointmentsRaw as unknown as AppointmentWithPatient[]) || []

  // Calcular fechas anterior y siguiente para navegación
  const prevDate = new Date(activeDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = getLocalDateString(prevDate)

  const nextDate = new Date(activeDate)
  nextDate.setDate(nextDate.getDate() + 1)
  const nextDateStr = getLocalDateString(nextDate)

  // Tira de 7 días centrada en la fecha activa
  const dayStrip = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(activeDate)
    d.setDate(d.getDate() + offset)
    const dStr = getLocalDateString(d)
    return {
      dateStr: dStr,
      isCurrent: dStr === activeDateStr,
      isToday: dStr === todayStr,
      dayName: d.toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', ''),
      dayNum: d.getDate(),
    }
  })

  return (
    <div className="w-full space-y-6 pb-20 md:pb-12">
      {/* 1. Header Clínico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 px-4 md:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Agenda y Turnos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 capitalize">
            {activeDate.toLocaleDateString('es-EC', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de Vista */}
          <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <Link
              href={`/${slug}/admission/appointments?date=${activeDateStr}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                !isWeekly
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Diaria
            </Link>
            <Link
              href={`/${slug}/admission/appointments?view=week&date=${activeDateStr}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isWeekly
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semanal
            </Link>
          </div>

          <Link
            href={`/${slug}/admission/appointments/new?date=${activeDateStr}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Turno
          </Link>
        </div>
      </div>

      {isWeekly ? (
        <WeeklyCalendar slug={slug} appointments={appointments} currentDate={activeDateStr} />
      ) : (
        <>
          {/* 2. Barra de Navegación por Fechas (Interactiva y Navegable) */}
          <div className="flex items-center gap-2 px-4 md:px-0 overflow-x-auto scrollbar-hide py-1">
            {/* Ir al día anterior */}
            <Link
              href={`/${slug}/admission/appointments?date=${prevDateStr}`}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all shrink-0"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            {/* Días en tira interactiva */}
            {dayStrip.map((item) => (
              <Link
                key={item.dateStr}
                href={`/${slug}/admission/appointments?date=${item.dateStr}`}
                className={`flex flex-col items-center justify-center min-w-[62px] h-[68px] rounded-xl border transition-all shrink-0 ${
                  item.isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    item.isCurrent ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {item.dayName}
                </span>
                <span className="text-lg font-bold leading-tight mt-0.5">{item.dayNum}</span>
                {item.isToday && (
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest ${
                      item.isCurrent ? 'text-blue-200' : 'text-blue-600'
                    }`}
                  >
                    Hoy
                  </span>
                )}
              </Link>
            ))}

            {/* Ir al día siguiente */}
            <Link
              href={`/${slug}/admission/appointments?date=${nextDateStr}`}
              className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all shrink-0"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Volver a Hoy rápido si no estamos en hoy */}
            {!isTodayActive && (
              <Link
                href={`/${slug}/admission/appointments?date=${todayStr}`}
                className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
              >
                Ir a Hoy
              </Link>
            )}
          </div>

          {/* 3. Lista de Turnos del Día */}
          {appointments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-xs mx-4 md:mx-0 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Agenda libre</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  No tenés turnos registrados para el{' '}
                  {activeDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}.
                </p>
              </div>
              <Link
                href={`/${slug}/admission/appointments/new?date=${activeDateStr}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Agendar Turno para esta fecha
              </Link>
            </div>
          ) : (
            <div className="space-y-3 px-4 md:px-0">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  <strong>{appointments.length}</strong> {appointments.length === 1 ? 'paciente citado' : 'pacientes citados'}
                </span>
                <span className="text-[11px] font-medium text-gray-400">
                  Ordenados cronológicamente
                </span>
              </div>

              {appointments.map((appointment) => {
                const statusInfo = statusLabels[appointment.status] || statusLabels.scheduled
                const patientName = appointment.patients
                  ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
                  : 'Paciente sin registrar'

                return (
                  <div
                    key={appointment.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-gray-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Información del Turno */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {/* Bloque Horario */}
                        <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                          <span className="text-sm font-bold font-mono text-gray-900">
                            {appointment.time?.slice(0, 5)}
                          </span>
                          <span className="text-[9px] font-semibold text-gray-400 uppercase">
                            Hora
                          </span>
                        </div>

                        {/* Datos del Paciente */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                              {patientName}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            {appointment.reason ? (
                              <span className="flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-blue-500" />
                                {appointment.reason}
                              </span>
                            ) : (
                              <span className="italic text-gray-400">Consulta odontológica</span>
                            )}

                            {appointment.patients?.phone && (
                              <span className="flex items-center gap-1 text-gray-400">
                                <Phone className="w-3 h-3" />
                                {appointment.patients.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end border-gray-100">
                        <AppointmentActions
                          slug={slug}
                          appointmentId={appointment.id}
                          status={appointment.status}
                          date={activeDateStr}
                          time={appointment.time || ''}
                        />

                        {appointment.patients && (
                          <Link
                            href={`/${slug}/odontology?patientId=${appointment.patients.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Abrir Odontograma / Ficha"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Ficha</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
