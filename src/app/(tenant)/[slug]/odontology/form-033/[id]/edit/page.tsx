import { getDentalRecord, getOdontogramTeeth, getTreatmentSessions } from '../../../actions'
import Link from 'next/link'
import EditForm033Form from '@/components/odontology/EditForm033Form'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

interface DiagnosisData {
  code?: string
  description?: string
  text?: string
  type?: string
}

interface DentalRecord {
  id: string
  consultation_reason: string | { text: string } | null
  current_problem: string | { text: string } | null
  personal_family_history: string | { text: string } | null
  diagnostic_plan: string | { text: string } | null
  therapeutic_plan: string | { text: string } | null
  educational_plan: string | { text: string } | null
  treatment: string | { text: string } | null
  diagnosis: DiagnosisData | null
  vital_signs: Record<string, string | number> | null
  stomatognathic_exam: string | Record<string, unknown> | null
  oral_hygiene: {
    rating?: string
    plaque_index?: number
    piezas_presentes?: number
    superficies_evaluadas?: number
    superficies_con_placa?: number
    oleary_data?: Record<number, { absent: boolean; surfaces: Record<string, boolean> }>
  } | null
  fluorosis: string | null
  malocclusion: string | null
  cpod_index: Record<string, number> | null
  ceod_index: Record<string, number> | null
  pregnant: boolean | null
  personal_history: Record<string, boolean | string> | null
  family_history: Record<string, boolean | string> | null
  periodontal_disease: string | null
  complementary_exams: Record<string, string> | null
}

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface TreatmentSessionData {
  id: string
  session_number: number
  session_date: string | null
  diagnoses_complications: string | null
  procedures: string | null
  prescriptions: string | null
  signature: string | null
}

export default async function EditForm033Page({ params }: Props) {
  const { slug, id } = await params
  const recordRaw = await getDentalRecord(slug, id)
  const teethRaw = await getOdontogramTeeth(slug, id)
  const sessionsRaw = await getTreatmentSessions(slug, id)

  if (!recordRaw) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-2xl font-black text-gray-900">Historia clínica no encontrada</h2>
        <Link href={`/${slug}/admission/patients`} className="btn btn-primary mt-6 rounded-2xl font-black shadow-lg shadow-primary/20">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  const record = recordRaw as unknown as DentalRecord
  const teeth = (teethRaw as unknown as ToothData[]) || []
  const sessions = (sessionsRaw as unknown as TreatmentSessionData[]) || []

  return (
    <EditForm033Form
      slug={slug}
      id={id}
      record={record}
      initialTeeth={teeth}
      sessions={sessions}
    />
  )
}
