import { getDentalRecord, getOdontogramTeeth, getPrescriptions, getTreatmentSessions } from '../../../actions'
import PrintContent, { DentalRecord } from './PrintContent'

interface Props {
  params: Promise<{ slug: string; id: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function PrintForm033Page({ params, searchParams }: Props) {
  const { slug, id } = await params
  const { type } = await searchParams

  const [record, teeth, prescriptions, sessions] = await Promise.all([
    getDentalRecord(slug, id),
    getOdontogramTeeth(slug, id),
    getPrescriptions(slug, id),
    getTreatmentSessions(slug, id),
  ])

  if (!record) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Historia clínica no encontrada</h2>
      </div>
    )
  }

  return (
    <PrintContent
      record={record as unknown as DentalRecord}
      teeth={teeth}
      prescriptions={prescriptions}
      sessions={sessions}
      slug={slug}
      id={id}
      type={type}
    />
  )
}
