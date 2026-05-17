import { getPatient, saveStomatognathicExam, getStomatognathicExam } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; 'patient-id': string }>
}

export default async function StomatognathicExamPage({ params }: Props) {
  const { slug, 'patient-id': patientId } = await params
  const patient = await getPatient(slug, patientId)
  const exam = await getStomatognathicExam(slug, patientId)

  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/nursing/vital-signs`} className="text-blue-600 hover:underline mt-2 inline-block">Volver</Link>
      </div>
    )
  }

  const g = (field: string) => {
    if (exam && typeof exam === 'object') return (exam as any)[field] || ''
    return ''
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${slug}/nursing/vital-signs`} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Examen Estomatognático</h2>
          <p className="text-gray-500 mt-1">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

      <form action={saveStomatognathicExam.bind(null, slug, patientId) as unknown as (fd: FormData) => Promise<void>} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ATM (Articulación Temporomandibular)" name="tmj" value={g('tmj')} />
            <Field label="Ganglios Linfáticos" name="lymph_nodes" value={g('lymph_nodes')} />
            <Field label="Mucosa Oral" name="oral_mucosa" value={g('oral_mucosa')} />
            <Field label="Lengua" name="tongue" value={g('tongue')} />
            <Field label="Paladar" name="palate" value={g('palate')} />
            <Field label="Piso de Boca" name="floor_of_mouth" value={g('floor_of_mouth')} />
            <Field label="Labios" name="lips" value={g('lips')} />
            <Field label="Glándulas Salivales" name="salivary_glands" value={g('salivary_glands')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea name="observations" defaultValue={g('observations')} rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Guardar Examen
            </button>
            <Link href={`/${slug}/nursing/vital-signs`} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" name={name} defaultValue={value}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}
