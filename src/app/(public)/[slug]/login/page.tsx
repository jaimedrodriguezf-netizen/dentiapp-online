'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Tooth } from '@/components/ui/ToothIcon'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { X } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

export default function TenantLoginPage() {
  const params = useParams()
  const slug = (params.slug as string) || ''
  const [error, setError] = useState<string | null>(null)

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

          <div className="space-y-6">
            <GoogleSignInButton
              text="Continuar con Google"
              redirectTo={`/${slug}/dashboard`}
              onError={(err) => setError(err)}
            />

            <p className="text-center text-xs text-gray-400">
              Iniciá sesión con tu cuenta de Google asociada al equipo de esta clínica.
            </p>
          </div>

          <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            DentiApp Online v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
