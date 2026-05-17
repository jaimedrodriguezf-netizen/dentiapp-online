import Link from 'next/link'
import { Fragment } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

const roles = [
  { key: 'ceo', label: 'CEO', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'doctor', label: 'Doctor', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'nurse', label: 'Enfermero', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'receptionist', label: 'Admisión', color: 'bg-teal-100 text-teal-700 border-teal-200' },
]

const sections = [
  {
    title: 'Dashboard',
    permissions: [
      { key: 'view_dashboard', label: 'Ver Dashboard', ceo: true, admin: true, doctor: true, nurse: true, receptionist: true },
    ],
  },
  {
    title: 'Pacientes',
    permissions: [
      { key: 'view_patients', label: 'Ver lista de pacientes', ceo: true, admin: true, doctor: true, nurse: true, receptionist: true },
      { key: 'create_patient', label: 'Crear pacientes', ceo: true, admin: true, doctor: false, nurse: false, receptionist: true },
      { key: 'edit_patient', label: 'Editar pacientes', ceo: true, admin: true, doctor: false, nurse: false, receptionist: true },
    ],
  },
  {
    title: 'Turnos',
    permissions: [
      { key: 'view_appointments', label: 'Ver turnos', ceo: true, admin: true, doctor: true, nurse: true, receptionist: true },
      { key: 'create_appointment', label: 'Crear turnos', ceo: true, admin: true, doctor: false, nurse: false, receptionist: true },
      { key: 'manage_appointment_status', label: 'Cambiar estado de turnos', ceo: true, admin: true, doctor: true, nurse: true, receptionist: false },
    ],
  },
  {
    title: 'Odontología',
    permissions: [
      { key: 'view_odontology', label: 'Ver odontología', ceo: true, admin: true, doctor: true, nurse: false, receptionist: false },
      { key: 'create_form033', label: 'Crear Formulario 033', ceo: true, admin: true, doctor: true, nurse: false, receptionist: false },
      { key: 'view_odontogram', label: 'Ver odontograma', ceo: true, admin: true, doctor: true, nurse: false, receptionist: false },
    ],
  },
  {
    title: 'Enfermería',
    permissions: [
      { key: 'view_nursing', label: 'Ver enfermería', ceo: true, admin: true, doctor: true, nurse: true, receptionist: false },
      { key: 'record_vital_signs', label: 'Registrar signos vitales', ceo: true, admin: true, doctor: false, nurse: true, receptionist: false },
      { key: 'nursing_notes', label: 'Notas de enfermería', ceo: true, admin: true, doctor: false, nurse: true, receptionist: false },
    ],
  },
  {
    title: 'Configuración',
    permissions: [
      { key: 'manage_clinic', label: 'Editar datos de clínica', ceo: true, admin: true, doctor: false, nurse: false, receptionist: false },
      { key: 'manage_team', label: 'Gestionar equipo', ceo: true, admin: true, doctor: false, nurse: false, receptionist: false },
      { key: 'view_settings', label: 'Ver configuración', ceo: true, admin: true, doctor: false, nurse: false, receptionist: false },
    ],
  },
]

export default async function PermissionsSettingsPage({ params }: Props) {
  const { slug } = await params

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${slug}/settings/profile`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
          <p className="text-gray-500 mt-1">Matriz de permisos por rol en la clínica</p>
        </div>
      </div>

      <div className="card bg-white border border-gray-200 shadow-sm overflow-x-auto">
        <div className="card-body p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[200px]">Permiso</th>
                {roles.map((role) => (
                  <th key={role.key} className="text-center py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${role.color}`}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="py-2 px-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{section.title}</span>
                    </td>
                  </tr>
                  {section.permissions.map((perm) => {
                    const permVal = perm as Record<string, unknown>
                    return (
                      <tr key={perm.key} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{perm.label}</td>
                        {roles.map((role) => {
                          const allowed = permVal[role.key] as boolean
                          return (
                            <td key={role.key} className="text-center py-3 px-3">
                              {allowed ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                                  <Check className="w-4 h-4 text-green-600" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                                  <X className="w-4 h-4 text-gray-300" />
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
