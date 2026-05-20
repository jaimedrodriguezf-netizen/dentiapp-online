import Link from 'next/link'
import { getPatients } from '../actions'
import { Users, Plus, Search, User, CreditCard, ChevronRight, Phone } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface PatientData {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
  phone: string | null
  email: string | null
}

export default async function PatientsPage({ params }: Props) {
  const { slug } = await params
  const patientsRaw = await getPatients(slug)
  const patients = (patientsRaw as unknown as PatientData[]) || []

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pacientes</h2>
          <p className="text-gray-500 font-medium mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href={`/${slug}/admission/patients/new`}
          className="btn btn-primary rounded-2xl font-black shadow-lg shadow-blue-500/20 px-8 h-12"
        >
          <Plus className="w-5 h-5" />
          NUEVO PACIENTE
        </Link>
      </div>

      {/* Buscador Rápido (Visual) */}
      <div className="px-4 md:px-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o cédula..."
            className="w-full pl-12 pr-4 h-14 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="card bg-white border border-dashed border-gray-300 mx-4 md:mx-0">
          <div className="card-body items-center text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Tu base de datos está vacía</h3>
            <p className="text-gray-500 mt-2 mb-8 max-w-xs">Registrá tu primer paciente para empezar a gestionar sus historias clínicas.</p>
            <Link
              href={`/${slug}/admission/patients/new`}
              className="btn btn-primary rounded-xl font-black shadow-lg shadow-blue-500/20"
            >
              REGISTRAR PRIMER PACIENTE
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vista Móvil: Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden px-4">
            {patients.map((patient) => (
              <Link 
                key={patient.id}
                href={`/${slug}/admission/patients/${patient.id}`}
                className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    {patient.first_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> {patient.cedula || 'S/C'}
                      </span>
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {patient.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Vista Desktop: Tabla */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <table className="table-fixed w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paciente</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cédula</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {patient.first_name[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-600">{patient.cedula || '—'}</td>
                    <td className="py-4 px-6">
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-gray-700">{patient.phone || '—'}</span>
                         <span className="text-xs text-gray-400">{patient.email || ''}</span>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/${slug}/admission/patients/${patient.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-xs font-black text-gray-600 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        VER FICHA
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
