'use client'

import { User } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

interface Tenant {
  name: string
}

interface DashboardHeaderProps {
  user: User
  tenant: Tenant
  children?: React.ReactNode
}

export default function DashboardHeader({ user, tenant, children }: DashboardHeaderProps) {
  const params = useParams()
  const slug = (params.slug as string) || ''
  const userName = (user.user_metadata?.name as string) || user.email || 'Usuario'

  return (
    <header className="bg-base-100 shadow-sm border-b border-base-200 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Espacio para el botón del drawer inyectado desde el layout */}
        {children}
        
        <div className="min-w-0">
          <h1 className="text-sm md:text-lg font-black text-base-content truncate max-w-[150px] md:max-w-none">
            {tenant.name}
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-base-content/40 uppercase tracking-widest">
            DentiApp Online
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs md:text-sm font-black text-base-content truncate max-w-[120px] md:max-w-none">
            {userName}
          </p>
          <p className="text-[10px] font-medium text-base-content/50 truncate max-w-[120px]">
            {user.email}
          </p>
        </div>

        <div className="avatar placeholder">
          <div className="bg-primary/10 text-primary rounded-xl w-8 h-8 md:w-10 md:h-10 border border-primary/20">
            <span className="text-xs md:text-lg font-black">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
