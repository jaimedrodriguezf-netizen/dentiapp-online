import Link from 'next/link'
import { getPatients } from '../actions'
import { Users, Plus, Search } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PatientsPage({ params }: Props) {
  const { slug } = await params
  const patients = await getPatients(slug)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-500 mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/${slug}/admission/patients/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body items-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay pacientes</h3>
            <p className="text-gray-500 mt-1 mb-4">Registrá tu primer paciente para empezar</p>
            <Link
              href={`/${slug}/admission/patients/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar Paciente
            </Link>
          </div>
        </div>
      ) : (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="text-left py-3 px-4 font-medium">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Cédula</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Teléfono</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Email</th>
                  <th className="text-right py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{patient.cedula || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{patient.phone || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{patient.email || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/${slug}/admission/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
