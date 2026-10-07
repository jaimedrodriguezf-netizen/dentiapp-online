'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tooth } from '@/components/ui/ToothIcon'
import { Building2, Phone, MapPin, Globe, Loader2, AlertCircle } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

function formatSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clinicName, setClinicName] = useState('')

  const previewSlug = formatSlug(clinicName) || 'mi-clinica'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const name = (formData.get('name') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim() || null
    const address = (formData.get('address') as string)?.trim() || null

    if (!name) {
      setError('Por favor ingresá el nombre de tu clínica')
      setLoading(false)
      return
    }

    // 1. Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Debés iniciar sesión primero')
      setLoading(false)
      return
    }

    // 2. Generate slug automatically from name
    const baseSlug = formatSlug(name) || `clinica-${user.id.slice(0, 8)}`

    // 3. Ensure slug uniqueness with automatic suffix resolution
    let slug = baseSlug
    let attempts = 0
    const MAX_ATTEMPTS = 50

    while (attempts < MAX_ATTEMPTS) {
      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!existing) break

      attempts++
      slug = `${baseSlug}-${attempts + 1}`
    }

    if (attempts >= MAX_ATTEMPTS) {
      slug = `${baseSlug}-${user.id.slice(0, 8)}`
    }

    // 4. Create tenant in database
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        slug,
        phone,
        address,
        plan: 'standard', // Plan standard por defecto
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Error creating tenant:', tenantError)
      setError('No pudimos crear tu clínica. Por favor intentá de nuevo.')
      setLoading(false)
      return
    }

    // 5. Create membership as admin
    const { error: memberError } = await supabase.from('tenant_members').insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: 'admin',
    })

    if (memberError) {
      console.error('Error creating membership:', memberError)
      setError(memberError.message)
      setLoading(false)
      return
    }

    // 6. Direct navigation to dashboard
    router.refresh()
    router.push(`/${tenant.slug}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
              <Tooth className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Configurá tu Clínica
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Completá estos datos para crear tu espacio de trabajo en DentiApp Online
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            {/* Nombre de la clínica */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gray-400" />
                Nombre del Consultorio o Clínica
              </label>
              <input
                type="text"
                name="name"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Ej. Clínica Dental Sonrisa"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
                required
                autoFocus
              />

              {/* Preview amigable autogenerado del enlace */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 mt-2">
                <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-medium text-gray-600">Enlace asignado:</span>
                <span className="font-mono text-blue-600 font-semibold truncate">
                  dentiapp.online/{previewSlug}
                </span>
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                Teléfono de Contacto (Opcional)
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+593 99 999 9999"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                Dirección del Consultorio (Opcional)
              </label>
              <input
                type="text"
                name="address"
                placeholder="Av. Principal 123 y Calle Secundaria"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tu clínica...</span>
                </>
              ) : (
                <span>Crear mi clínica</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            DentiApp Online v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
