import { createClient } from '@/lib/supabase/server'
import { Users, CalendarDays, FileText, HeartPulse } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's tenant
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  // Fetch stats
  const [patientsCount, appointmentsCount, recordsCount] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('tenant_id', membership.tenant_id),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('tenant_id', membership.tenant_id),
    supabase.from('dental_records').select('*', { count: 'exact', head: true }).eq('tenant_id', membership.tenant_id),
  ])

  const stats = [
    { label: 'Pacientes', value: patientsCount.count ?? 0, icon: Users, color: 'primary' },
    { label: 'Turnos', value: appointmentsCount.count ?? 0, icon: CalendarDays, color: 'secondary' },
    { label: 'Historias Clínicas', value: recordsCount.count ?? 0, icon: FileText, color: 'accent' },
    { label: 'Enfermería', value: 0, icon: HeartPulse, color: 'info' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-base-content">Dashboard</h2>
        <p className="text-base-content/60">Resumen de tu clínica</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card bg-base-100 shadow-md">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">{stat.label}</p>
                  <p className="text-3xl font-bold text-base-content">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Próximos turnos</h3>
          <p className="text-base-content/60">
            Los turnos de hoy aparecerán acá cuando crees tu primera cita.
          </p>
        </div>
      </div>
    </div>
  )
}
