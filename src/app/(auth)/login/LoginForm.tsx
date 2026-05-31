'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '../actions'
import { Tooth } from '@/components/ui/ToothIcon'
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const redirectUrl = searchParams.get('redirect')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (redirectUrl) {
      router.push(redirectUrl)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-20 text-white w-full">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] mb-12 shadow-2xl border border-white/30">
            <Tooth className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-6xl font-black tracking-tight leading-tight uppercase">
              Tu clínica <br />
              <span className="text-blue-200">en la nube.</span>
            </h2>
            <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
              DentiApp Online es la herramienta definitiva para profesionales que buscan eficiencia, seguridad y modernidad.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-md">
            {[
              { label: 'Historias Clínicas', icon: ShieldCheck },
              { label: 'Turnos Online', icon: Sparkles },
              { label: 'Odontograma Pro', icon: Tooth },
              { label: 'Gestión Total', icon: ArrowRight },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <item.icon className="w-5 h-5 text-blue-200" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-blue-100">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
              <Tooth className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">DentiApp Online</h2>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Bienvenido</h1>
              <p className="text-gray-500 font-medium mt-2">Accedé a tu panel administrativo</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 border-2 border-red-100 px-5 py-4 text-red-700 mb-8 animate-shake">
                <X className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email del Profesional
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@clínica.com"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-4 pr-14 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-[24px] bg-blue-600 px-8 py-5 text-lg font-black text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    ACCEDIENDO...
                  </>
                ) : (
                  <>
                    INICIAR SESIÓN
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-10">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">o bien</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            <p className="text-center text-gray-500 font-medium text-sm">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-blue-600 font-black uppercase tracking-tight hover:text-blue-800 transition-colors ml-1">
                Registrate Gratis
              </Link>
            </p>
          </div>
          
          <p className="text-center mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            DentiApp Online v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
