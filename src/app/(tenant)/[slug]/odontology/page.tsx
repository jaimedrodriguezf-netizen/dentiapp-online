import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Activity, ArrowRight } from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OdontologyDashboard({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return null

  const { count: recordsCount } = await supabase
    .from('dental_records')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', membership.tenant_id)

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Odontología</h2>
        <p className="text-gray-500 mt-1">Historias clínicas, Formulario 033 y odontograma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href={`/${slug}/admission/patients`}
          className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
        >
          <div className="card-body p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Formulario 033</h3>
            <p className="text-sm text-gray-500 mb-3">Crear y gestionar historias clínicas odontológicas</p>
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
              Ir a pacientes <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Odontograma</h3>
            <p className="text-sm text-gray-500 mb-3">
              Registro visual de los dientes con estados y plan de tratamiento
            </p>
            <p className="text-xs text-gray-400">
              Accedé desde la historia clínica del paciente
            </p>
          </div>
        </div>
      </div>

      <div className="card bg-gray-50 border border-gray-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Historias clínicas registradas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{recordsCount ?? 0}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Tooth className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
