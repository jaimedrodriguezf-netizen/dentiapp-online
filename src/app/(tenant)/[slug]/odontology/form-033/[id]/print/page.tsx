import { getDentalRecord, getOdontogramTeeth, getPrescriptions } from '../../../actions'
import PrintContent from './PrintContent'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function PrintForm033Page({ params }: Props) {
  const { slug, id } = await params

  const [record, teeth, prescriptions] = await Promise.all([
    getDentalRecord(slug, id),
    getOdontogramTeeth(slug, id),
    getPrescriptions(slug, id),
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
      record={record}
      teeth={teeth}
      prescriptions={prescriptions}
      slug={slug}
      id={id}
    />
  )
}
