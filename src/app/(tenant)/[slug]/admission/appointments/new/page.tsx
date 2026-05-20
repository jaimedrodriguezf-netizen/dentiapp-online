import Link from 'next/link'
import { getPatients, createAppointment } from '../../actions'
import { ArrowLeft, User, Calendar, Clock, ClipboardList, Save, X, AlertCircle } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface PatientData {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

export default async function NewAppointmentPage({ params }: Props) {
  const { slug } = await params
  const patientsRaw = await getPatients(slug)
  const patients = (patientsRaw as unknown as PatientData[]) || []

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header Adaptable */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20 mx-4 md:mx-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/admission/appointments`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate">Nuevo Turno</h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">Agenda de Citas</p>
          </div>
        </div>

        <Link
          href={`/${slug}/admission/appointments`}
          className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200 hidden md:flex"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Link>
      </div>

      <form action={async (fd: FormData) => {
        'use server'
        await createAppointment(slug, fd)
      }} className="space-y-6">
        
        {/* Card de Selección de Paciente */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Paciente</h3>
            </div>

            {patients.length === 0 ? (
              <div className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-[32px] flex flex-col items-center text-center">
                <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-sm font-bold text-yellow-700 leading-tight">No hay pacientes registrados aún.</p>
                <Link href={`/${slug}/admission/patients/new`} className="btn btn-warning btn-sm mt-4 rounded-xl font-black">
                  CREAR PACIENTE AHORA
                </Link>
              </div>
            ) : (
              <FormGroup label="Seleccionar Paciente *" icon={User}>
                <select
                  name="patient_id"
                  required
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                >
                  <option value="">Elegí un paciente de la lista...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} {patient.cedula ? `(${patient.cedula})` : ''}
                    </option>
                  ))}
                </select>
              </FormGroup>
            )}
          </div>
        </div>

        {/* Card de Fecha y Hora */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Fecha y Horario</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormGroup label="Fecha de la Cita *" icon={Calendar}>
                <input
                  type="date" name="date" required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
              <FormGroup label="Hora *" icon={Clock}>
                <input
                  type="time" name="time" required
                  defaultValue="09:00"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Card de Motivo */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Detalles</h3>
            </div>

            <FormGroup label="Motivo de la consulta" icon={ClipboardList}>
              <textarea
                name="reason" rows={3}
                placeholder="Ej: Control de rutina, dolor agudo, profilaxis..."
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </FormGroup>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex gap-4 px-4 md:px-0">
          <button
            type="submit"
            disabled={patients.length === 0}
            className="btn btn-primary rounded-2xl font-black px-12 h-14 shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            AGENDAR TURNO
          </button>
        </div>

        {/* Sticky Mobile Button */}
        <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 flex gap-3">
          <Link
            href={`/${slug}/admission/appointments`}
            className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
          >
            ✕ CANCELAR
          </Link>
          <button
            type="submit"
            disabled={patients.length === 0}
            className="flex-[2] btn btn-primary rounded-2xl h-14 font-black shadow-xl shadow-primary/30 disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            AGENDAR
          </button>
        </div>
      </form>
    </div>
  )
}

function FormGroup({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </label>
      {children}
    </div>
  )
}
