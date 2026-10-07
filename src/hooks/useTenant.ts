'use client'

import { useTenantContext } from '@/contexts/tenant-context'

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'free' | 'standard' | 'business'
  logo_url?: string | null
  phone?: string | null
  address?: string | null
}

/**
 * Hook para acceder a la info del tenant actual.
 *
 * Lee del TenantContext (provisto por TenantLayoutClient) en lugar de hacer
 * un fetch extra desde el browser. El contexto se hidrata con los datos que
 * el server component (layout) ya leyó del header seteado por proxy.ts.
 *
 * Si el hook se usa fuera del árbol TenantLayoutClient, retorna null
 * (caso: la landing pública /(public)/[slug] que no usa este layout).
 */
export function useTenant() {
  return { tenant: useTenantContext(), loading: false }
}
