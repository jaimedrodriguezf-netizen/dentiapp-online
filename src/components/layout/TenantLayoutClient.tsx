'use client'

import { useState, useEffect } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlobalSearch from '@/components/ui/GlobalSearch'
import { TenantProvider } from '@/contexts/tenant-context'
import type { ClinicMembership } from '@/types/clinic'

type Membership = ClinicMembership

interface Props {
  children: React.ReactNode
  user: User
  membership: Membership
  permissionsMap: Record<string, boolean>
}

export default function TenantLayoutClient({ children, user, membership, permissionsMap }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Initialize from localStorage in a way that avoids SSR issues.
  // Safely read and update without throwing in private/iframe modes.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-open')
      if (saved !== null) {
        const isOpen = saved === 'true'
        setIsSidebarOpen((prev) => (prev !== isOpen ? isOpen : prev)) // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }, [])

  const toggleSidebar = () => {
    const nextState = !isSidebarOpen
    setIsSidebarOpen(nextState)
    try {
      localStorage.setItem('sidebar-open', nextState.toString())
    } catch {
      // Storage access blocked or unavailable
    }
  }

  const closeMobileDrawer = () => {
    const drawer = document.getElementById('dashboard-drawer') as HTMLInputElement | null
    if (drawer) {
      drawer.checked = false
    }
  }

  return (
    <TenantProvider value={membership.tenants}>
    <div className={`drawer ${isSidebarOpen ? 'lg:drawer-open' : ''} min-h-screen bg-base-200 transition-colors duration-200`}>
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col h-screen overflow-hidden transition-[padding,margin] duration-200 ease-in-out">
        <GlobalSearch />

        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader user={user} tenant={membership.tenants}>
            <div className="flex items-center gap-1">
              <label htmlFor="dashboard-drawer" className="btn btn-ghost btn-sm btn-circle lg:hidden">
                <Menu className="w-5 h-5" />
              </label>
              <button 
                onClick={toggleSidebar} 
                className="hidden lg:flex btn btn-ghost btn-sm btn-circle text-gray-500"
                title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            </div>
          </DashboardHeader>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <DashboardSidebar
          role={membership.role}
          tenant={membership.tenants}
          permissions={permissionsMap}
          plan={membership.tenants.plan}
          onNavigate={closeMobileDrawer}
        />
      </div>
    </div>
    </TenantProvider>
  )
}
