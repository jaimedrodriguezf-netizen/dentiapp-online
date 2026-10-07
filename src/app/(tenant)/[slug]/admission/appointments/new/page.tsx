import Link from 'next/link'
import { getPatients, createAppointment } from '../../actions'
import { ArrowLeft, User, Calendar, Clock, ClipboardList, Save, AlertCircle, LucideIcon } from 'lucide-react'
import { getLocalDateString } from '@/lib/utils/date'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ date?: string; patientId?: string }>
}

interface PatientData {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

export default async function NewAppointmentPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { date: dateParam, patientId: patientIdParam } = await searchParams

  const patientsRaw = await getPatients(slug)
  const patients = (patientsRaw as unknown as PatientData[]) || []

  const defaultDate = (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam))
    ? dateParam
    : getLocalDateString()

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${slug}/admission/appointments?date=${defaultDate}`}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Agendar Turno
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Programar nueva cita médica en agenda
            </p>
          </div>
        </div>

        <Link
          href={`/${slug}/admission/appointments?date=${defaultDate}`}
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>

      <form
        action={async (fd: FormData) => {
          'use server'
          await createAppointment(slug, fd)
        }}
        className="space-y-6 px-4 md:px-0"
      >
        {/* Paciente */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Paciente</h2>
          </div>

          {patients.length === 0 ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl flex flex-col items-center text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <p className="text-xs font-semibold text-amber-800">
                Aún no tenés pacientes registrados en la clínica.
              </p>
              <Link
                href={`/${slug}/admission/patients/new`}
                className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
              >
                Crear Paciente Ahora
              </Link>
            </div>
          ) : (
            <FormGroup label="Seleccionar Paciente *" icon={User}>
              <select
                name="patient_id"
                required
                defaultValue={patientIdParam || ''}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">Elegí un paciente de la lista...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}{' '}
                    {patient.cedula ? `(Cédula: ${patient.cedula})` : ''}
                  </option>
                ))}
              </select>
            </FormGroup>
          )}
        </div>

        {/* Fecha y Hora */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Horario de Atención</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="Fecha de la Cita *" icon={Calendar}>
              <input
                type="date"
                name="date"
                required
                defaultValue={defaultDate}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </FormGroup>

            <FormGroup label="Hora de Inicio *" icon={Clock}>
              <input
                type="time"
                name="time"
                required
                defaultValue="09:00"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </FormGroup>
          </div>
        </div>

        {/* Motivo y Notas */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Motivo de Consulta</h2>
          </div>

          <FormGroup label="Procedimiento o motivo previsto" icon={ClipboardList}>
            <textarea
              name="reason"
              rows={3}
              placeholder="Ej: Limpieza dental profiláctica, dolor agudo en molar 36, control..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </FormGroup>

          <FormGroup label="Notas internas (Opcional)" icon={ClipboardList}>
            <input
              type="text"
              name="notes"
              placeholder="Ej: Paciente prefiere anestesia tópica, confirmar por WhatsApp..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </FormGroup>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/${slug}/admission/appointments?date=${defaultDate}`}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            Guardar Cita
          </button>
        </div>
      </form>
    </div>
  )
}

function FormGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        {label}
      </label>
      {children}
    </div>
  )
}
