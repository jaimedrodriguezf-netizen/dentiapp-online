import { createClient } from '@/lib/supabase/server'
import { updateClinic } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProfileSettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', slug).single()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-500 mt-1">Administrá los datos de tu clínica</p>
      </div>

      {/* Clinic info */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Clínica</h3>
          <p className="text-sm text-gray-500 mb-5">Datos generales de tu clínica dental</p>

          <form action={(fd) => { updateClinic(slug, fd); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la clínica</label>
              <input
                type="text" name="name" required
                defaultValue={tenant?.name || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel" name="phone"
                  defaultValue={tenant?.phone || ''}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" name="email"
                  defaultValue={tenant?.email || ''}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <textarea
                name="address" rows={2}
                defaultValue={tenant?.address || ''}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>

      {/* User info */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Tu cuenta</h3>
          <p className="text-sm text-gray-500 mb-4">Datos de tu usuario</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="font-medium text-gray-700 w-20">Email:</span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <div className="flex gap-3">
              <span className="font-medium text-gray-700 w-20">Nombre:</span>
              <span className="text-gray-600">
                {(user?.user_metadata as Record<string, string> | null)?.name || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${slug}/settings/team`}
          className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="card-body p-4">
            <h4 className="font-semibold text-gray-900">Miembros del Equipo</h4>
            <p className="text-sm text-gray-500 mt-1">Gestioná los integrantes de tu clínica</p>
          </div>
        </Link>
        <Link
          href={`/${slug}/settings/permissions`}
          className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="card-body p-4">
            <h4 className="font-semibold text-gray-900">Roles y Permisos</h4>
            <p className="text-sm text-gray-500 mt-1">Configurá los permisos por rol</p>
          </div>
        </Link>
        <Link
          href={`/${slug}/settings/landing-page`}
          className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="card-body p-4">
            <h4 className="font-semibold text-gray-900">Landing Page</h4>
            <p className="text-sm text-gray-500 mt-1">QR y página pública de tu clínica</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
