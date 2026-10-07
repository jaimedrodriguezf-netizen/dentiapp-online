'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tooth } from '@/components/ui/ToothIcon'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { APP_VERSION } from '@/lib/version'
import { ShieldCheck, Sparkles, ArrowRight, User, X } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)

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
              Empezá tu <br />
              <span className="text-blue-200">clínica hoy.</span>
            </h2>
            <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
              Unite a la comunidad de profesionales que están transformando la odontología digital con <strong>DentiApp Online</strong>.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-md">
            {[
              { label: '30 Días Gratis', icon: Sparkles },
              { label: 'Sin Tarjeta', icon: ShieldCheck },
              { label: 'Soporte 24/7', icon: User },
              { label: 'Todo Incluido', icon: ArrowRight },
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

      {/* Right side - Register */}
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
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Crear Cuenta</h1>
              <p className="text-gray-500 font-medium mt-2">Empezá tu prueba gratuita de 30 días</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 border-2 border-red-100 px-5 py-4 text-red-700 mb-8 animate-shake">
                <X className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <GoogleSignInButton
                text="Registrarse con Google"
                onError={(err) => setError(err)}
              />

              <p className="text-center text-xs text-gray-400">
                Al registrarte con Google creás tu consultorio de forma instantánea y segura.
              </p>
            </div>

            <div className="border-t border-gray-100 mt-10 pt-8 text-center text-gray-500 font-medium text-sm">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-blue-600 font-black uppercase tracking-tight hover:text-blue-800 transition-colors ml-1">
                Iniciar Sesión
              </Link>
            </div>
          </div>
          
          <p className="text-center mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            DentiApp Online v{APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  )
}
