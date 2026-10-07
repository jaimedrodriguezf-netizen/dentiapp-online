'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

interface GoogleSignInButtonProps {
  text?: string
  redirectTo?: string | null
  onError?: (error: string) => void
}

export default function GoogleSignInButton({
  text = 'Continuar con Google',
  redirectTo,
  onError,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const callbackUrl = new URL('/auth/callback', origin)
      if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') && !redirectTo.includes('\\')) {
        callbackUrl.searchParams.set('redirect', redirectTo)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setLoading(false)
        onError?.(error.message)
      }
    } catch (err) {
      setLoading(false)
      const message = err instanceof Error ? err.message : 'Error al conectar con Google'
      onError?.(message)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : (
        <GoogleIcon className="w-5 h-5" />
      )}
      <span>{loading ? 'Conectando con Google...' : text}</span>
    </button>
  )
}
