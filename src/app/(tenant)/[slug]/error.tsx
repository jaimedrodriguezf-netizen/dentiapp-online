'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const slug = (params?.slug as string) || ''

  useEffect(() => {
    console.error('Tenant runtime error captured by boundary:', error)
  }, [error])

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        <div className="card-body items-center text-center p-8 md:p-10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-base-content tracking-tight">
              Algo no salió como esperábamos
            </h2>
            <p className="text-sm font-medium text-base-content/60 max-w-sm mx-auto">
              Ocurrió un inconveniente temporal al cargar esta sección. Podés reintentar o volver al inicio.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-base-content/40 mt-1">
                Código de error: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
            <button
              onClick={reset}
              className="btn btn-primary flex-1 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar
            </button>
            <Link
              href={`/${slug}/dashboard`}
              className="btn btn-ghost border border-base-300 flex-1 rounded-2xl font-black flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
