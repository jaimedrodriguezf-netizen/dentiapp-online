'use client'

import { createContext, useContext } from 'react'
import type { Clinic } from '@/types/clinic'

export type TenantContextValue = Clinic

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
