import { getOdontogramTeeth, getDentalRecord } from '../../actions'
import OdontogramPage from '@/components/odontology/OdontogramPage'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string; 'record-id': string }>
}

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface DentalRecord {
  id: string
  patient_id: string
  patients: {
    first_name: string
    last_name: string
  } | null
}

export default async function OdontogramEditPage({ params }: Props) {
  const { slug, 'record-id': recordId } = await params
  const [initialTeethRaw, recordRaw] = await Promise.all([
    getOdontogramTeeth(slug, recordId),
    getDentalRecord(slug, recordId),
  ])

  if (!recordRaw) {
    notFound()
  }

  const record = recordRaw as unknown as DentalRecord
  const initialTeeth = (initialTeethRaw as unknown as ToothData[]) || []
  const patientName = record.patients 
    ? `${record.patients.first_name} ${record.patients.last_name}`
    : 'Paciente'

  return (
    <OdontogramPage
      slug={slug}
      recordId={recordId}
      initialTeeth={initialTeeth}
      recordPatientName={patientName}
    />
  )
}
