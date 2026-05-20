import { getPatient, createDentalRecord } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Form033Wizard from '@/components/odontology/Form033Wizard'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ patient?: string }>
}

export default async function NewForm033Page({ params, searchParams }: Props) {
  const { slug } = await params
  const { patient: patientId } = await searchParams
  const patient = patientId ? await getPatient(slug, patientId) : null

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Seleccioná un paciente</h2>
        <p className="text-gray-500 mt-2">Primero elegí un paciente desde la lista para crear su historia clínica</p>
        <Link
          href={`/${slug}/admission/patients`}
          className="inline-block mt-4 text-blue-600 hover:underline font-medium"
        >
          Ir a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 px-2">
        <Link
          href={`/${slug}/admission/patients/${patientId}`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Formulario 033</h2>
          <p className="text-gray-500 text-sm font-medium">
            {patient.first_name} {patient.last_name}
          </p>
        </div>
      </div>

      <Form033Wizard
        slug={slug}
        createAction={createDentalRecord.bind(null, slug, patientId!) as unknown as (fd: FormData) => Promise<void>}
      />
    </div>
  )
}
