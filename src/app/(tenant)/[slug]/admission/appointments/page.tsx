import { getAppointments } from '../actions'
import { CalendarDays, Plus, Clock, ChevronLeft, ChevronRight, Phone, ArrowRight, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import AppointmentActions from './AppointmentActions'
import WeeklyCalendar from './WeeklyCalendar'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ view?: string }>
}

interface AppointmentWithPatient {
  id: string
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
  scheduled: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  confirmed: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  in_progress: { label: 'En curso', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Completado', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  no_show: { label: 'No asistió', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
}

export default async function AppointmentsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { view: viewParam } = await searchParams
  const isWeekly = viewParam === 'week'
  
  const todayDate = new Date()
  const todayStr = todayDate.toISOString().split('T')[0]
  const appointmentsRaw = await getAppointments(slug, todayStr)
  const appointments = (appointmentsRaw as unknown as AppointmentWithPatient[]) || []

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Agenda</h2>
          <p className="text-gray-500 font-medium mt-1">
            {todayDate.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <Link
              href={`/${slug}/admission/appointments`}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isWeekly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Hoy
            </Link>
            <Link
              href={`/${slug}/admission/appointments?view=week`}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isWeekly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Semana
            </Link>
          </div>
          <Link
            href={`/${slug}/admission/appointments/new`}
            className="btn btn-primary rounded-2xl font-black shadow-lg shadow-blue-500/20 px-8 h-12"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">NUEVO TURNO</span>
          </Link>
        </div>
      </div>

      {isWeekly ? (
        <WeeklyCalendar slug={slug} appointments={appointments} currentDate={todayStr} />
      ) : (
        <>

      {/* Selector de Fecha Rápido (Estilizado) */}
      <div className="flex items-center gap-2 px-4 md:px-0 overflow-x-auto scrollbar-hide py-2">
        <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-blue-600 transition-all flex-shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {/* Generar unos días de ejemplo para la UI */}
        {[-1, 0, 1, 2, 3].map((offset) => {
          const date = new Date()
          date.setDate(date.getDate() + offset)
          const isToday = offset === 0
          return (
            <button 
              key={offset}
              className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border-2 transition-all flex-shrink-0 ${
                isToday 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {date.toLocaleDateString('es-EC', { weekday: 'short' }).replace('.', '')}
              </span>
              <span className="text-xl font-black">{date.getDate()}</span>
            </button>
          )
        })}

        <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-blue-600 transition-all flex-shrink-0">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="card bg-white border border-dashed border-gray-300 mx-4 md:mx-0">
          <div className="card-body items-center text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Agenda libre para hoy</h3>
            <p className="text-gray-500 mt-2 mb-8 max-w-xs">No tenés citas registradas para esta fecha.</p>
            <Link
              href={`/${slug}/admission/appointments/new`}
              className="btn btn-primary rounded-xl font-black shadow-lg shadow-blue-500/20"
            >
              AGENDAR TURNO
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-4 md:px-0">
          {appointments.map((appointment) => {
            const statusInfo = statusLabels[appointment.status] || statusLabels.scheduled
            return (
              <div
                key={appointment.id}
                className="bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      {/* Hora */}
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors border border-gray-100">
                        <span className="text-lg font-black text-gray-900">{appointment.time?.slice(0, 5)}</span>
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                      </div>

                      {/* Info Paciente */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight truncate">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          {appointment.reason && (
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 text-blue-400" /> {appointment.reason}
                            </p>
                          )}
                          {appointment.patients?.phone && (
                            <p className="text-sm font-medium text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {appointment.patients.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones Táctiles */}
                    <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                      <AppointmentActions 
                        slug={slug} 
                        appointmentId={appointment.id} 
                        status={appointment.status}
                        date={todayStr}
                        time={appointment.time || ''}
                      />
                      <Link
                        href={`/${slug}/odontology?patientId=${appointment.patients?.id}`}
                        className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                        title="Ver Odontograma"
                      >
                         <User className="w-5 h-5" />
                         <span className="text-xs font-black md:hidden uppercase tracking-widest">Ver Ficha</span>
                      </Link>
                    </div>
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
