import { createClient } from '@/lib/supabase/server'
import { Users, CalendarDays, FileText, HeartPulse, Clock, Phone } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Pendiente', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  confirmed: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_progress: { label: 'En curso', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  completed: { label: 'Completado', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-50 border-red-200 line-through' },
  no_show: { label: 'No asistió', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('id, tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const tenantId = membership.tenant_id
  const today = new Date().toISOString().split('T')[0]

  const [patientsCount, allAppointmentsCount, recordsCount, todayAppointments] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .not('status', 'in', '("cancelled","no_show")'),
    supabase.from('dental_records').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments')
      .select('*, patients(first_name, last_name, phone)')
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .order('time', { ascending: true }),
  ])

  const pendingToday = todayAppointments.data?.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'in_progress'
  ) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Pacientes" value={patientsCount.count ?? 0} />
        <StatCard icon={CalendarDays} label="Turnos Activos" value={allAppointmentsCount.count ?? 0} />
        <StatCard icon={FileText} label="Hist. Clínicas" value={recordsCount.count ?? 0} />
        <StatCard icon={HeartPulse} label="Pendientes Hoy" value={pendingToday.length} />
      </div>

      {/* Today's appointments */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Turnos de Hoy
              <span className="text-sm font-normal text-gray-400 ml-1">
                ({todayAppointments.data?.length ?? 0})
              </span>
            </h3>
          </div>

          {!todayAppointments.data || todayAppointments.data.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay turnos para hoy</p>
              <p className="text-gray-400 text-sm mt-1">Las citas del día aparecerán acá</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.data.map((appointment) => {
                const status = statusConfig[appointment.status] || statusConfig.scheduled
                const patient = appointment.patients as Record<string, string> | null
                const timeLabel = appointment.time?.slice(0, 5) ?? '--:--'

                return (
                  <div
                    key={appointment.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${status.bg} transition-colors`}
                  >
                    {/* Time badge */}
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-lg font-bold text-gray-900 leading-tight">{timeLabel}</span>
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {patient?.first_name} {patient?.last_name}
                      </p>
                      {patient?.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </p>
                      )}
                      {appointment.reason && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{appointment.reason}</p>
                      )}
                    </div>

                    {/* Status */}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color} bg-white border border-gray-100`}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick action */}
      {pendingToday.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900">
              {pendingToday.length} turno{pendingToday.length > 1 ? 's' : ''} pendiente{pendingToday.length > 1 ? 's' : ''} hoy
            </p>
            <p className="text-sm text-blue-600">
              Administralos desde la sección de Turnos
            </p>
          </div>
          <a
            href={`/${slug}/admission/appointments`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Ver Turnos
          </a>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="card bg-white border border-gray-200 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
