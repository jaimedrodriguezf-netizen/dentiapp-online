import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getCachedTenantId } from '@/lib/tenant/getTenantId'
import { getLocalDateString } from '@/lib/utils/date'
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ArrowRight, 
  UserPlus, 
  PlusCircle,
  ExternalLink,
  Activity,
  LucideIcon
} from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

interface PatientData {
  id: string
  first_name: string
  last_name: string
  phone: string | null
}

interface AppointmentWithPatient {
  id: string
  time: string
  status: string
  reason: string | null
  patients: PatientData | null
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Programado', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  confirmed: { label: 'Confirmado', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  in_progress: { label: 'En atención', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Atendido', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
  cancelled: { label: 'Cancelado', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  no_show: { label: 'No asistió', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' },
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id') || (await getCachedTenantId(slug))

  if (!tenantId) return null

  const supabase = await createClient()
  const today = getLocalDateString()

  // Cargar métricas y turnos del día en paralelo
  const [patientsCount, todayAppointmentsRaw] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments')
      .select('id, time, status, reason, patients(id, first_name, last_name, phone)')
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .order('time', { ascending: true }),
  ])

  const todayAppointments = (todayAppointmentsRaw.data as unknown as AppointmentWithPatient[]) || []

  // Métricas del día
  const totalToday = todayAppointments.length
  const inProgressOrWaiting = todayAppointments.filter(
    (a) => a.status === 'in_progress' || a.status === 'confirmed' || a.status === 'scheduled'
  ).length
  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length

  // Paciente en curso o próximo turno
  const currentOrNext =
    todayAppointments.find((a) => a.status === 'in_progress') ||
    todayAppointments.find((a) => a.status === 'confirmed' || a.status === 'scheduled')

  return (
    <div className="w-full space-y-6">
      {/* 1. Header operativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Panel de Consulta
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-EC', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}/admission/patients/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-gray-500" />
            Nuevo Paciente
          </Link>
          <Link
            href={`/${slug}/admission/appointments/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Agendar Turno
          </Link>
        </div>
      </div>

      {/* 2. KPIs clínicos en 1 sola fila */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={CalendarDays}
          label="Citas de hoy"
          value={totalToday}
          helperText="Programadas en agenda"
        />
        <MetricCard
          icon={Clock}
          label="En espera / atención"
          value={inProgressOrWaiting}
          helperText="Pendientes de cierre"
          highlight={inProgressOrWaiting > 0}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Atendidos hoy"
          value={completedToday}
          helperText="Consultas finalizadas"
        />
        <MetricCard
          icon={Users}
          label="Total pacientes"
          value={patientsCount.count ?? 0}
          helperText="Historias registradas"
        />
      </div>

      {/* 3. Área de trabajo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Izquierda: Agenda del Día (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Agenda del Día</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {todayAppointments.length}
              </span>
            </div>
            <Link
              href={`/${slug}/admission/appointments`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Ver calendario completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {todayAppointments.length === 0 ? (
              <div className="p-10 text-center text-gray-500 space-y-3">
                <Clock className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-sm font-medium">No hay turnos registrados para hoy.</p>
                <Link
                  href={`/${slug}/admission/appointments/new`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Agendar primer turno
                </Link>
              </div>
            ) : (
              todayAppointments.map((appointment) => {
                const status = statusConfig[appointment.status] || statusConfig.scheduled
                const patientName = appointment.patients
                  ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
                  : 'Paciente sin registrar'

                return (
                  <div
                    key={appointment.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs font-bold font-mono text-gray-800 shrink-0">
                        {appointment.time.slice(0, 5)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {patientName}
                          </p>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${status.bg} ${status.color} ${status.border}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs text-gray-500">
                          {appointment.reason ? (
                            <span>Motivo: {appointment.reason}</span>
                          ) : (
                            <span className="italic">Consulta odontológica</span>
                          )}

                          {appointment.patients?.phone && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Phone className="w-3 h-3" /> {appointment.patients.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {appointment.patients && (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/${slug}/admission/patients/${appointment.patients.id}`}
                          className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Ficha
                        </Link>
                        <Link
                          href={`/${slug}/odontology?patientId=${appointment.patients.id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Tooth className="w-3 h-3" />
                          Atender
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Turno en Foco + Accesos Clínicos */}
        <div className="space-y-4">
          {/* Tarjeta de Foco: Paciente Actual / Próximo */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                {currentOrNext?.status === 'in_progress' ? 'En Atención' : 'Próximo Turno'}
              </span>
              {currentOrNext && (
                <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {currentOrNext.time.slice(0, 5)}
                </span>
              )}
            </div>

            {currentOrNext?.patients ? (
              <div className="space-y-3 pt-1">
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {currentOrNext.patients.first_name} {currentOrNext.patients.last_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentOrNext.reason || 'Consulta dental general'}
                  </p>
                </div>

                {currentOrNext.patients.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{currentOrNext.patients.phone}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/${slug}/odontology?patientId=${currentOrNext.patients.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                  >
                    <Tooth className="w-4 h-4" />
                    Abrir Odontograma
                  </Link>
                  <Link
                    href={`/${slug}/admission/patients/${currentOrNext.patients.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Ver Historia Clínica <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">
                No hay turnos pendientes para el resto del día.
              </div>
            )}
          </div>

          {/* Accesos directos a módulos de trabajo */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Accesos Clínicos
            </h4>

            <div className="space-y-2">
              <ClinicalQuickLink
                href={`/${slug}/odontology`}
                title="Odontograma MSP 033"
                subtitle="Ficha odontológica oficial"
                icon={Tooth}
              />
              <ClinicalQuickLink
                href={`/${slug}/admission/patients`}
                title="Fichas de Pacientes"
                subtitle="Búsqueda e historias clínicas"
                icon={Users}
              />
              <ClinicalQuickLink
                href={`/${slug}/admission/appointments`}
                title="Agenda Médica"
                subtitle="Gestión semanal y mensual"
                icon={CalendarDays}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helperText,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  value: number
  helperText: string
  highlight?: boolean
}) {
  return (
    <div
      className={`p-4 rounded-xl border bg-white shadow-xs transition-colors ${
        highlight ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between text-gray-500 mb-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <div
          className={`p-1.5 rounded-lg ${
            highlight ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      <p className="text-[11px] text-gray-400 mt-0.5">{helperText}</p>
    </div>
  )
}

function ClinicalQuickLink({
  href,
  title,
  subtitle,
  icon: Icon,
}: {
  href: string
  title: string
  subtitle: string
  icon: LucideIcon | React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
    >
      <div className="p-2 rounded-md bg-gray-50 group-hover:bg-blue-50 text-gray-500 group-hover:text-blue-600 transition-colors shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  )
}
