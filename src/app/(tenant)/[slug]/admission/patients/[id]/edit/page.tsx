import { getPatient, updatePatient } from '../../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function EditPatientPage({ params }: Props) {
  const { slug, id } = await params
  const patient = await getPatient(slug, id)

  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/admission/patients`} className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/admission/patients/${id}`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Paciente</h2>
          <p className="text-gray-500 mt-1">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

      <form action={updatePatient.bind(null, slug, id) as unknown as (fd: FormData) => Promise<void>} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="first_name"
                required
                defaultValue={patient.first_name}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input
                type="text"
                name="last_name"
                required
                defaultValue={patient.last_name}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                name="cedula"
                defaultValue={patient.cedula || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="birth_date"
                defaultValue={patient.birth_date || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select
              name="gender"
              defaultValue={patient.gender || ''}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="phone"
                defaultValue={patient.phone || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={patient.email || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <textarea
              name="address"
              defaultValue={patient.address || ''}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Paciente</label>
            <select
              name="status"
              defaultValue={patient.status || 'active'}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Activo</option>
              <option value="in_treatment">En Tratamiento</option>
              <option value="inactive">Inactivo</option>
              <option value="discharged">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observations"
              defaultValue={patient.observations || ''}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Notas clínicas, alergias, medicación..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
            <Link
              href={`/${slug}/admission/patients/${id}`}
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
