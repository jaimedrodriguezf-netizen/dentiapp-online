import { createClient } from '@/lib/supabase/server'
import OdontologyDashboardClient from '@/components/odontology/OdontologyDashboardClient'

interface Props {
  params: Promise<{ slug: string }>
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

interface RecordRaw {
  id: string
  opening_date: string | null
  patients: Patient | Patient[] | null
}

export default async function OdontologyDashboard({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Consultamos los últimos 100 expedientes que pertenecen al tenant del slug usando un join.
  // Gracias a las políticas de seguridad RLS de Supabase, solo se retornarán si el usuario autenticado tiene acceso a este tenant.
  const { data: recordsRaw } = await supabase
    .from('dental_records')
    .select(`
      id,
      opening_date,
      patients (
        id,
        first_name,
        last_name,
        cedula
      ),
      tenants!inner (
        slug
      )
    `)
    .eq('tenants.slug', slug)
    .order('opening_date', { ascending: false })
    .limit(100)

  // Tipamos y limpiamos las respuestas de Supabase para evitar 'any'
  const records = (recordsRaw || []).map((r) => {
    const raw = r as unknown as RecordRaw
    let patientData: Patient | null = null
    
    if (raw.patients) {
      if (Array.isArray(raw.patients)) {
        patientData = raw.patients[0] || null
      } else {
        patientData = raw.patients
      }
    }

    return {
      id: raw.id,
      opening_date: raw.opening_date,
      patients: patientData ? {
        id: patientData.id,
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        cedula: patientData.cedula
      } : null
    }
  })

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Odontología</h2>
        <p className="text-gray-500 mt-1">Historias clínicas, Formulario 033 y odontograma</p>
      </div>

      <OdontologyDashboardClient initialRecords={records} slug={slug} />
    </div>
  )
}
