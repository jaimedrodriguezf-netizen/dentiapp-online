'use client'

import Link from 'next/link'
import { Fragment, useState, useEffect, use } from 'react'
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react'
import { getRolePermissions, togglePermission } from '../actions'

interface Props {
  params: Promise<{ slug: string }>
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
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getRolePermissions(slug)
      setPermissions(data)
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
        <p className="text-sm text-gray-500 font-medium">Cargando matriz de permisos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${slug}/settings/profile`} className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
          <p className="text-gray-500 mt-1 text-sm">Matriz de permisos dinámica por rol en la clínica</p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-md table-pin-rows">
            <thead>
              <tr className="border-b border-base-200">
                <th className="bg-base-100 py-4 px-6 text-xs font-bold uppercase tracking-wider text-base-content/50">Módulo / Permiso</th>
                {roles.map((role) => (
                  <th key={role.key} className="bg-base-100 text-center py-4 px-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${role.color}`}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <Fragment key={section.title}>
                  <tr className="bg-base-200/50">
                    <td colSpan={roles.length + 1} className="py-2 px-6">
                      <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">{section.title}</span>
                    </td>
                  </tr>
                  {section.permissions.map((perm) => (
                    <tr key={perm.key} className="border-b border-base-200 hover:bg-base-200/30 transition-colors group">
                      <td className="py-4 px-6 text-sm font-medium text-base-content/80 group-hover:text-base-content">{perm.label}</td>
                      {roles.map((role) => {
                        const allowed = isAllowed(role.key, perm.key)
                        const key = `${role.key}-${perm.key}`
                        const isUpdating = updating === key

                        return (
                          <td key={role.key} className="text-center py-4 px-2">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleToggle(role.key, perm.key, allowed)}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                                isUpdating 
                                  ? 'bg-base-200 animate-pulse' 
                                  : allowed 
                                    ? 'bg-success/20 text-success hover:bg-success/30 shadow-sm' 
                                    : 'bg-base-200 text-base-content/30 hover:bg-base-300'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : allowed ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-5 h-5" />
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
      
      <div className="alert alert-info shadow-sm rounded-2xl bg-blue-50 border-blue-100">
        <div className="flex gap-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white h-fit">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-blue-900">Nota de seguridad</p>
            <p className="text-blue-800">Los cambios se aplican instantáneamente. Algunos roles pueden requerir recargar la página para ver los cambios en el menú lateral.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
