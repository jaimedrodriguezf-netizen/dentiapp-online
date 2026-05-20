import Link from 'next/link'
import { createPatient } from '../../actions'
import { ArrowLeft, User, CreditCard, Phone, Mail, MapPin, Calendar, Save, X, Activity, FileText } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NewPatientPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Header Adaptable */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20 mx-4 md:mx-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/admission/patients`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate">Nuevo Paciente</h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">Registro de Ingreso</p>
          </div>
        </div>

        <Link
          href={`/${slug}/admission/patients`}
          className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200 hidden md:flex"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Link>
      </div>

      <form action={async (fd: FormData) => {
        'use server'
        await createPatient(slug, fd)
      }} className="space-y-6">
        
        {/* Card de Datos Personales */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Datos Personales</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormGroup label="Nombres *" icon={User}>
                <input
                  type="text" name="first_name" required placeholder="Juan"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
              <FormGroup label="Apellidos *" icon={User}>
                <input
                  type="text" name="last_name" required placeholder="Pérez"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormGroup label="Cédula / ID" icon={CreditCard}>
                <input
                  type="text" name="cedula" placeholder="1234567890"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
              <FormGroup label="Fecha de Nacimiento" icon={Calendar}>
                <input
                  type="date" name="birth_date"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
            </div>

            <FormGroup label="Género" icon={User}>
              <select
                name="gender"
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </FormGroup>
          </div>
        </div>

        {/* Card de Contacto */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Contacto</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormGroup label="Teléfono" icon={Phone}>
                <input
                  type="tel" name="phone" placeholder="+593 9..."
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
              <FormGroup label="Email" icon={Mail}>
                <input
                  type="email" name="email" placeholder="paciente@ejemplo.com"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </FormGroup>
            </div>

            <FormGroup label="Dirección Física" icon={MapPin}>
              <textarea
                name="address" rows={2} placeholder="Av. Principal, Ciudad..."
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </FormGroup>
          </div>
        </div>

        {/* Card de Estado y Observaciones */}
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Estado y Notas</h3>
            </div>

            <FormGroup label="Estado del Paciente" icon={Activity}>
              <select
                name="status"
                defaultValue="active"
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
              >
                <option value="active">Activo</option>
                <option value="in_treatment">En Tratamiento</option>
                <option value="inactive">Inactivo</option>
                <option value="discharged">Alta</option>
              </select>
            </FormGroup>

            <FormGroup label="Observaciones" icon={FileText}>
              <textarea
                name="observations" rows={3}
                placeholder="Notas clínicas, alergias, medicación actual, condiciones relevantes..."
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </FormGroup>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex gap-4 px-4 md:px-0">
          <button
            type="submit"
            className="btn btn-primary rounded-2xl font-black px-12 h-14 shadow-xl shadow-primary/20"
          >
            <Save className="w-5 h-5 mr-2" />
            REGISTRAR PACIENTE
          </button>
        </div>

        {/* Sticky Mobile Button */}
        <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 flex gap-3">
          <Link
            href={`/${slug}/admission/patients`}
            className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
          >
            ✕ CANCELAR
          </Link>
          <button
            type="submit"
            className="flex-[2] btn btn-primary rounded-2xl h-14 font-black shadow-xl shadow-primary/30"
          >
            <Save className="w-5 h-5 mr-2" />
            GUARDAR
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
