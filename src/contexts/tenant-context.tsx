'use client'

import { createContext, useContext } from 'react'

export interface TenantContextValue {
  id: string
  name: string
  slug: string
  plan: 'free' | 'standard' | 'business'
  logo_url: string | null
  phone: string | null
  address: string | null
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue
  children: React.ReactNode
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenantContext(): TenantContextValue | null {
  return useContext(TenantContext)
}
