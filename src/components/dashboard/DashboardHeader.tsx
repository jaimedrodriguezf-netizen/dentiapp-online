'use client'

import { User } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

interface Tenant {
  name: string
}

interface DashboardHeaderProps {
  user: User
  tenant: Tenant
}

export default function DashboardHeader({ user, tenant }: DashboardHeaderProps) {
  const params = useParams()
  const slug = params.slug as string
  const userName = user.user_metadata?.name || user.email || 'Usuario'

  return (
    <header className="bg-base-100 shadow-sm px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-base-content">DentiApp Online</h1>
        <p className="text-sm text-base-content/60">{tenant.name}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-10">
            <span className="text-lg">
              {(userName as string).charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-base-content">{userName}</p>
          <p className="text-xs text-base-content/50">{user.email}</p>
        </div>
      </div>
    </header>
  )
}
