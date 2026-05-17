import { getAppointments } from '../actions'
import { CalendarDays, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import AppointmentActions from './AppointmentActions'

interface Props {
  params: Promise<{ slug: string }>
}

const statusLabels: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'En curso', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completado', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  no_show: { label: 'No asistió', color: 'bg-orange-100 text-orange-800' },
}

export default async function AppointmentsPage({ params }: Props) {
  const { slug } = await params
  const today = new Date().toISOString().split('T')[0]
  const appointments = await getAppointments(slug, today)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Turnos de Hoy</h2>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href={`/${slug}/admission/appointments/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Turno
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body items-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay turnos para hoy</h3>
            <p className="text-gray-500 mt-1 mb-4">Creá el primer turno del día</p>
            <Link
              href={`/${slug}/admission/appointments/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Turno
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const statusInfo = statusLabels[appointment.status] || statusLabels.scheduled
            return (
              <div
                key={appointment.id}
                className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex w-16 h-16 rounded-xl bg-blue-50 items-center justify-center flex-shrink-0">
                        <Clock className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-semibold text-gray-900">{appointment.time?.slice(0, 5)}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </p>
                        {appointment.reason && (
                          <p className="text-sm text-gray-500 mt-0.5">{appointment.reason}</p>
                        )}
                        {appointment.patients?.phone && (
                          <p className="text-sm text-gray-400 mt-0.5">{appointment.patients.phone}</p>
                        )}
                      </div>
                    </div>
                    <AppointmentActions slug={slug} appointmentId={appointment.id} status={appointment.status} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
