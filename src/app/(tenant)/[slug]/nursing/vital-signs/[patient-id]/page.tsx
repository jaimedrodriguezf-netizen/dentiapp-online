import { getPatient, saveVitalSigns, getVitalSigns } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; 'patient-id': string }>
}

export default async function VitalSignsFormPage({ params }: Props) {
  const { slug, 'patient-id': patientId } = await params
  const patient = await getPatient(slug, patientId)
  const history = await getVitalSigns(slug, patientId)

  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/nursing/vital-signs`} className="text-blue-600 hover:underline mt-2 inline-block">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/nursing/vital-signs`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Signos Vitales</h2>
          <p className="text-gray-500 mt-1">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

      <form action={saveVitalSigns.bind(null, slug, patientId)} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presión Arterial</label>
              <input
                type="text"
                name="blood_pressure"
                placeholder="120/80"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frec. Cardíaca</label>
              <input
                type="text"
                name="heart_rate"
                placeholder="80 lpm"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
              <input
                type="text"
                name="temperature"
                placeholder="36.5 °C"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frec. Respiratoria</label>
              <input
                type="text"
                name="respiratory_rate"
                placeholder="16 rpm"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sat. Oxígeno</label>
              <input
                type="text"
                name="oxygen_saturation"
                placeholder="98 %"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
              <input
                type="text"
                name="weight"
                placeholder="70 kg"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="notes"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Guardar Signos Vitales
            </button>
            <Link
              href={`/${slug}/nursing/vital-signs`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      {history.length > 0 && (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Historial</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h: any, i: number) => (
                <div key={i} className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 w-20">
                    {h.record_date ? new Date(h.record_date).toLocaleDateString('es-EC') : ''}
                  </span>
                  <span>PA: {h.blood_pressure || '—'}</span>
                  <span>FC: {h.heart_rate || '—'}</span>
                  <span>T°: {h.temperature || '—'}</span>
                  <span>SpO2: {h.oxygen_saturation || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
