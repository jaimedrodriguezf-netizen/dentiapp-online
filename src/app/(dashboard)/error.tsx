'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Algo salió mal</h2>
          <p className="text-base-content/60">
            Hubo un error al cargar el dashboard. Intentá de nuevo.
          </p>
          <button className="btn btn-primary mt-4" onClick={reset}>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  )
}
