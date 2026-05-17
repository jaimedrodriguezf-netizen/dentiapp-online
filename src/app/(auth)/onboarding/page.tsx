'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tooth } from '@/components/ui/ToothIcon'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Debés iniciar sesión primero')
      setLoading(false)
      return
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        phone,
        address,
      })
      .select()
      .single()

    if (tenantError) {
      if (tenantError.code === '23505') {
        setError('Ese nombre de clínica ya está en uso. Probá con otro.')
      } else {
        setError(tenantError.message)
      }
      setLoading(false)
      return
    }

    // Create tenant membership (owner role)
    const { error: memberError } = await supabase
      .from('tenant_members')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'ceo',
      })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    // Redirect to dashboard
    router.push(`/${tenant.slug}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="card w-full max-w-lg shadow-2xl bg-base-100">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Tooth className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-base-content">Configurá tu clínica</h1>
            <p className="text-base-content/60 mt-2">
              Completá estos datos para crear tu espacio en DentiApp
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Nombre de la clínica</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Clínica Dental Sonrisa"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">URL de tu clínica</span>
              </label>
              <div className="join w-full">
                <span className="join-item btn btn-disabled">dentiapp.com/</span>
                <input
                  type="text"
                  name="slug"
                  placeholder="mi-clinica"
                  className="input input-bordered join-item flex-1"
                  required
                  pattern="[\-a-z0-9]+"
                  title="Solo letras minúsculas, números y guiones"
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Esta será la URL de tu clínica
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Teléfono</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+593 99 999 9999"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Dirección</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Av. Principal 123, Ciudad"
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Crear mi clínica'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
