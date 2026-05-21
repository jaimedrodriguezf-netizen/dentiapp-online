'use client'

import Link from 'next/link'
import { Fragment, useState, useEffect, use } from 'react'
import { ArrowLeft, Check, X, Loader2, Shield, Info, MoveHorizontal } from 'lucide-react'
import { getRolePermissions, togglePermission } from '../actions'

interface Props {
  params: Promise<{ slug: string }>
}

interface Permission {
  role: string
  permission_key: string
  is_allowed: boolean
}

const roles = [
  { key: 'supervisor', label: 'Supervisor', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'doctor', label: 'Doctor', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'nurse', label: 'Enfermero', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'receptionist', label: 'Admisión', color: 'bg-teal-100 text-teal-700 border-teal-200' },
]

const sections = [
  {
    title: 'Dashboard',
    permissions: [
      { key: 'view_dashboard', label: 'Ver Dashboard' },
    ],
  },
  {
    title: 'Pacientes',
    permissions: [
      { key: 'view_patients', label: 'Ver lista de pacientes' },
      { key: 'create_patient', label: 'Crear pacientes' },
      { key: 'edit_patient', label: 'Editar pacientes' },
    ],
  },
  {
    title: 'Turnos',
    permissions: [
      { key: 'view_appointments', label: 'Ver turnos' },
      { key: 'create_appointment', label: 'Crear turnos' },
      { key: 'manage_appointment_status', label: 'Cambiar estado de turnos' },
    ],
  },
  {
    title: 'Odontología',
    permissions: [
      { key: 'view_odontology', label: 'Ver odontología' },
      { key: 'create_form033', label: 'Crear Formulario 033' },
      { key: 'view_odontogram', label: 'Ver odontograma' },
    ],
  },
  {
    title: 'Enfermería',
    permissions: [
      { key: 'view_nursing', label: 'Ver enfermería' },
      { key: 'record_vital_signs', label: 'Registrar signos vitales' },
      { key: 'nursing_notes', label: 'Notas de enfermería' },
    ],
  },
  {
    title: 'Configuración',
    permissions: [
      { key: 'manage_clinic', label: 'Editar datos de clínica' },
      { key: 'manage_team', label: 'Gestionar equipo' },
      { key: 'view_settings', label: 'Ver configuración' },
    ],
  },
]

export default function PermissionsSettingsPage({ params }: Props) {
  const { slug } = use(params)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getRolePermissions(slug)
      setPermissions(data as Permission[])
      setLoading(false)
    }
    load()
  }, [slug])

  const handleToggle = async (role: string, permissionKey: string, currentStatus: boolean) => {
    const key = `${role}-${permissionKey}`
    setUpdating(key)
    const newStatus = !currentStatus

    const result = await togglePermission(slug, role, permissionKey, newStatus)
    
    if (result.success) {
      setPermissions(prev => {
        const index = prev.findIndex(p => p.role === role && p.permission_key === permissionKey)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = { ...updated[index], is_allowed: newStatus }
          return updated
        } else {
          return [...prev, { role, permission_key: permissionKey, is_allowed: newStatus }]
        }
      })
    } else {
      alert('Error al actualizar: ' + result.error)
    }
    setUpdating(null)
  }

  const isAllowed = (role: string, permissionKey: string) => {
    return permissions.find(p => p.role === role && p.permission_key === permissionKey)?.is_allowed ?? false
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500 font-black uppercase tracking-widest">Cargando matriz...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link href={`/${slug}/settings/profile`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Permisos</h2>
          <p className="text-gray-500 font-medium mt-1">Controlá qué puede hacer cada rol</p>
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="bg-blue-50/50 p-2 flex items-center justify-center gap-2 lg:hidden border-b border-blue-100 rounded-2xl mx-4 md:mx-0">
        <MoveHorizontal className="w-4 h-4 text-blue-400" />
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">
          Deslizá horizontalmente para ver todos los roles
        </span>
      </div>

      <div className="card bg-white border border-gray-100 shadow-sm overflow-hidden mx-4 md:mx-0 rounded-[32px]">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="table table-md table-pin-rows">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="bg-transparent py-6 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Permiso</th>
                {roles.map((role) => (
                  <th key={role.key} className="bg-transparent text-center py-6 px-4">
                    <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase border-2 shadow-sm ${role.color}`}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr className="bg-blue-50/30">
                    <td colSpan={roles.length + 1} className="py-2 px-6">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{section.title}</span>
                    </td>
                  </tr>
                  {section.permissions.map((perm) => (
                    <tr key={perm.key} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-5 px-6">
                         <p className="text-sm font-bold text-gray-900 leading-tight">{perm.label}</p>
                         <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{perm.key}</p>
                      </td>
                      {roles.map((role) => {
                        const allowed = isAllowed(role.key, perm.key)
                        const key = `${role.key}-${perm.key}`
                        const isUpdating = updating === key

                        return (
                          <td key={role.key} className="text-center py-4 px-4">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleToggle(role.key, perm.key, allowed)}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-all border-2 ${
                                isUpdating 
                                  ? 'bg-gray-50 animate-pulse border-gray-100' 
                                  : allowed 
                                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 shadow-sm' 
                                    : 'bg-white text-gray-200 border-gray-100 hover:border-red-200 hover:text-red-400'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : allowed ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : (
                                <X className="w-5 h-5 stroke-[3]" />
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="alert alert-info shadow-sm rounded-3xl bg-blue-50 border-2 border-blue-100 mx-4 md:mx-0 p-5">
        <div className="flex gap-4">
          <div className="p-2 bg-blue-600 rounded-xl text-white h-fit shadow-lg shadow-blue-200">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-black text-blue-900 uppercase tracking-wide mb-1">Nota de seguridad</p>
            <p className="text-blue-800 leading-relaxed font-medium">Los cambios se aplican instantáneamente. Es posible que el personal deba recargar la aplicación para ver los nuevos accesos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
