import { cache } from 'react'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Obtiene el ID del tenant optimizado con cache por request y bypass de BD
 * si ya fue inyectado por el proxy de seguridad en los request headers.
 */
export const getCachedTenantId = cache(async (slug: string): Promise<string | null> => {
  try {
    const headersList = await headers()
    const headerSlug = headersList.get('x-tenant-slug')
    const headerId = headersList.get('x-tenant-id')

    if (headerSlug === slug && headerId) {
      return headerId
    }
  } catch {
    // headers() puede fallar fuera del contexto de una petición HTTP
  }

  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  return tenant?.id ?? null
})
