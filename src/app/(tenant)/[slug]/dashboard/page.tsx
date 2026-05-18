import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  CalendarDays, 
  FileText, 
  HeartPulse, 
  Clock, 
  Phone, 
  ArrowRight, 
  PlayCircle,
  AlertCircle,
  CommandIcon,
  LucideIcon
} from 'lucide-react'
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
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('id, tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const tenantId = membership.tenant_id
  const today = new Date().toISOString().split('T')[0]

  // Cargar datos
  const [patientsCount, allAppointmentsCount, recordsCount, todayAppointmentsRaw] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .not('status', 'in', '("cancelled","no_show")'),
    supabase.from('dental_records').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments')
      .select('id, time, status, reason, patients(id, first_name, last_name, phone)')
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .order('time', { ascending: true }),
  ])

  const todayAppointments = (todayAppointmentsRaw.data as unknown as AppointmentWithPatient[]) || []
  
  // Encontrar el paciente actual (el primero que esté 'in_progress' o el próximo 'confirmed'/'scheduled')
  const nextAppointment = todayAppointments.find(a => a.status === 'in_progress') || 
                          todayAppointments.find(a => a.status === 'confirmed' || a.status === 'scheduled')

  const pendingToday = todayAppointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed' || a.status === 'in_progress'
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">¡Hola, Doctor! 👋</h2>
          <p className="text-gray-500 font-medium mt-1">
            Hoy es {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Sistema Online</span>
        </div>
      </div>

      {/* 1. SECCIÓN: PRÓXIMO PACIENTE (FOCO TOTAL) */}
      {nextAppointment ? (
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl" />
          <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 shadow-xl">
                <span className="text-2xl font-black">{nextAppointment.time.slice(0, 5)}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Turno</span>
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-2">
                  {nextAppointment.status === 'in_progress' ? 'Atendiendo ahora' : 'Siguiente en la lista'}
                </span>
                <h3 className="text-3xl font-black text-white leading-tight">
                  {nextAppointment.patients?.first_name} {nextAppointment.patients?.last_name}
                </h3>
                <p className="text-blue-100 font-medium flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4" />
                  Motivo: {nextAppointment.reason || 'Consulta general'}
                </p>
              </div>
            </div>
            <Link 
              href={`/${slug}/odontology?patientId=${nextAppointment.patients?.id}`}
              className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg shadow-2xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <PlayCircle className="w-6 h-6" />
              INICIAR CONSULTA
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-400 font-bold">No hay turnos pendientes para lo que queda del día.</p>
        </div>
      )}

      {/* 2. STATS RÁPIDOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Pacientes" value={patientsCount.count ?? 0} color="blue" />
        <StatCard icon={CalendarDays} label="Citas Activas" value={allAppointmentsCount.count ?? 0} color="indigo" />
        <StatCard icon={FileText} label="Historias" value={recordsCount.count ?? 0} color="purple" />
        <StatCard icon={HeartPulse} label="Pendientes Hoy" value={pendingToday.length} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. LÍNEA DE TIEMPO DEL DÍA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900">Agenda de Hoy</h3>
            <Link href={`/${slug}/admission/appointments`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Ver calendario completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Tu agenda está vacía hoy.</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => {
                const status = statusConfig[appointment.status] || statusConfig.scheduled
                return (
                  <div 
                    key={appointment.id}
                    className={`flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                      <span className="text-lg font-black text-gray-900">{appointment.time.slice(0, 5)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {appointment.patients?.first_name} {appointment.patients?.last_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {appointment.patients?.phone && (
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {appointment.patients.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link 
                      href={`/${slug}/odontology?patientId=${appointment.patients?.id}`}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 4. ACCESOS RÁPIDOS */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 px-2">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4">
            <QuickActionLink 
              href={`/${slug}/admission/patients?new=true`}
              title="Nuevo Paciente"
              desc="Registrar ingreso"
              icon={Users}
              color="blue"
            />
            <QuickActionLink 
              href={`/${slug}/admission/appointments`}
              title="Agendar Turno"
              desc="Manejar calendario"
              icon={CalendarDays}
              color="indigo"
            />
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl text-white shadow-xl">
              <CommandIcon className="w-8 h-8 mb-4 text-blue-400" />
              <h5 className="text-lg font-black mb-1">Truco Pro</h5>
              <p className="text-sm text-gray-400 leading-relaxed">
                Presioná <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Cmd+K</kbd> desde cualquier lugar para buscar pacientes al instante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: number, color: 'blue' | 'indigo' | 'purple' | 'orange' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all border-b-4 border-b-blue-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-4xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function QuickActionLink({ href, title, desc, icon: Icon, color }: { href: string, title: string, desc: string, icon: LucideIcon, color: 'blue' | 'indigo' }) {
  const colors = {
    blue: 'hover:border-blue-500 hover:bg-blue-50/50',
    indigo: 'hover:border-indigo-500 hover:bg-indigo-50/50'
  }

  return (
    <Link href={href} className={`flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl transition-all shadow-sm group ${colors[color]}`}>
      <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white transition-colors">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
      </div>
      <div>
        <p className="font-black text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 font-medium">{desc}</p>
      </div>
    </Link>
  )
}
