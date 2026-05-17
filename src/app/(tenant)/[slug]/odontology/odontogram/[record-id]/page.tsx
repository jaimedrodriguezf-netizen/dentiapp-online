import { getDentalRecord, getOdontogramTeeth } from '../../actions'
import OdontogramPage from '@/components/odontology/OdontogramPage'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string; 'record-id': string }>
}

export default async function OdontogramRoutePage({ params }: Props) {
  const { slug, 'record-id': recordId } = await params

  const record = await getDentalRecord(slug, recordId)
  const teeth = await getOdontogramTeeth(slug, recordId)

  if (!record) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Historia clínica no encontrada</h2>
        <Link href={`/${slug}/admission/patients`} className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  const patient = record.patients as any
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente'

  return (
    <OdontogramPage
      recordId={recordId}
      slug={slug}
      initialTeeth={teeth}
      recordPatientName={patientName}
    />
  )
}
