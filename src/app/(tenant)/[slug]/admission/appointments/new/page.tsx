import Link from 'next/link'
import { getPatients, createAppointment } from '../../actions'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewAppointmentPage({ params }: Props) {
  const { slug } = await params
  const patients = await getPatients(slug)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/admission/appointments`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nuevo Turno</h2>
          <p className="text-gray-500 mt-1">Agendá una cita para un paciente</p>
        </div>
      </div>

      <form action={createAppointment.bind(null, slug) as unknown as (fd: FormData) => Promise<void>} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            {patients.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                No hay pacientes registrados.{' '}
                <Link href={`/${slug}/admission/patients/new`} className="font-semibold underline">
                  Creá un paciente primero
                </Link>
              </div>
            ) : (
              <select
                name="patient_id"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} {patient.cedula ? `- ${patient.cedula}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
              <input
                type="time"
                name="time"
                required
                defaultValue="09:00"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la consulta</label>
            <textarea
              name="reason"
              placeholder="Ej: Control de rutina, dolor de muela, limpieza..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={patients.length === 0}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear Turno
            </button>
            <Link
              href={`/${slug}/admission/appointments`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
