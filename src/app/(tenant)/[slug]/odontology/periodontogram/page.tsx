import { createClient } from '@/lib/supabase/server'
import PeriodontogramDashboard from '@/components/odontology/PeriodontogramDashboard'
import PeriodontogramPatientSelector from '@/components/odontology/PeriodontogramPatientSelector'
import { getPeriodontogramsByPatient } from './actions'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ patientId?: string }>
}

interface PatientRaw {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

export default async function PeriodontogramPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { patientId } = await searchParams
  const supabase = await createClient()

  // 1. Obtener la membresía del usuario para conocer el tenant_id
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return notFound()

  if (patientId) {
    // 2. Si se especifica un paciente, cargamos su periodontograma
    const { data: patientRaw } = await supabase
      .from('patients')
      .select('id, first_name, last_name, cedula')
      .eq('id', patientId)
      .eq('tenant_id', membership.tenant_id)
      .single()

    if (!patientRaw) return notFound()

    const patient = patientRaw as unknown as PatientRaw
    const records = await getPeriodontogramsByPatient(patientId)

    return (
      <div className="w-full animate-in fade-in duration-300">
        <PeriodontogramDashboard
          patientId={patient.id}
          patientName={`${patient.last_name} ${patient.first_name}`}
          slug={slug}
          initialRecords={records}
        />
      </div>
    )
  }

  // 3. Si no se especifica paciente, listamos todos los pacientes del tenant con expedientes activos
  const { data: patientsRaw } = await supabase
    .from('patients')
    .select('id, first_name, last_name, cedula')
    .eq('tenant_id', membership.tenant_id)
    .order('last_name', { ascending: true })
    .limit(100)

  const patients = (patientsRaw || []) as unknown as PatientRaw[]

  return (
    <div className="w-full animate-in fade-in duration-300">
      <PeriodontogramPatientSelector patients={patients} slug={slug} />
    </div>
  )
}
