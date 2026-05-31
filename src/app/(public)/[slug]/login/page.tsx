'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tooth } from '@/components/ui/ToothIcon'
import { Mail, Lock, Loader2, ArrowRight, X } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

export default function TenantLoginPage() {
  const router = useRouter()
  const params = useParams()
  const slug = (params.slug as string) || ''
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(`/${slug}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card w-full max-w-md bg-white border border-gray-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[40px] overflow-hidden">
        <div className="card-body p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[28px] mb-6 shadow-xl shadow-blue-500/20">
              <Tooth className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">Acceso Clínica</h1>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{slug}</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border-2 border-red-100 p-4 text-red-700 mb-8 animate-shake">
              <X className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="tu@email.com"
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-[24px] bg-blue-600 px-8 py-5 text-lg font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  INICIANDO...
                </>
              ) : (
                <>
                  ENTRAR
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            DentiApp Online v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
