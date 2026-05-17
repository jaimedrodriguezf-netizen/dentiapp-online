import { getPatients } from '../actions'
import Link from 'next/link'
import { HeartPulse, Activity, Stethoscope, FileText } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function VitalSignsListPage({ params }: Props) {
  const { slug } = await params
  const patients = await getPatients(slug)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Enfermería</h2>
        <p className="text-gray-500 mt-1">Seleccioná un paciente para registrar sus datos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div key={patient.id} className="card bg-white border border-gray-200 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {patient.first_name[0]}{patient.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{patient.cedula || 'Sin cédula'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${slug}/nursing/vital-signs/${patient.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Signos Vitales
                </Link>
                <Link
                  href={`/${slug}/nursing/stomatognathic-exam/${patient.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Examen
                </Link>
                <Link
                  href={`/${slug}/nursing/notes/${patient.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Notas
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <HeartPulse className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No hay pacientes registrados</p>
          </div>
        </div>
      )}
    </div>
  )
}
