'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  HeartPulse,
  Settings,
  LogOut,
  QrCode,
  Shield,
  LucideIcon,
  Crown,
  ClipboardList,
} from 'lucide-react'
import { Tooth as ToothIcon } from '@/components/ui/ToothIcon'
import { APP_VERSION } from '@/lib/version'
import { logout } from '@/app/(auth)/actions'

interface Tenant {
  name: string
  slug: string
}

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  permissionKey: string
  roles?: string[]
  planRequired?: 'business' | 'standard'
}

interface DashboardSidebarProps {
  role: string
  tenant: Tenant
  permissions?: Record<string, boolean>
  plan?: string
}

const menuItems: MenuItem[] = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    permissionKey: 'view_dashboard' 
  },
  { 
    href: '/admission/patients', 
    label: 'Pacientes', 
    icon: Users, 
    permissionKey: 'view_patients' 
  },
  { 
    href: '/admission/appointments', 
    label: 'Turnos', 
    icon: CalendarDays, 
    permissionKey: 'view_appointments' 
  },
  { 
    href: '/odontology', 
    label: 'Odontología', 
    icon: ToothIcon, 
    permissionKey: 'view_odontology' 
  },
  { 
    href: '/odontology/periodontogram', 
    label: 'Periodontograma', 
    icon: ClipboardList, 
    permissionKey: 'view_odontology' 
  },
  { 
    href: '/nursing/vital-signs', 
    label: 'Enfermería', 
    icon: HeartPulse, 
    permissionKey: 'view_nursing',
    planRequired: 'business'
  },
  { 
    href: '/settings/landing-page', 
    label: 'Mis Clínicas', 
    icon: QrCode, 
    permissionKey: 'manage_clinic',
    roles: ['admin', 'supervisor', 'doctor']
  },
  { 
    href: '/settings/team', 
    label: 'Equipo', 
    icon: Users, 
    permissionKey: 'manage_team',
    roles: ['admin', 'supervisor'],
    planRequired: 'business'
  },
  { 
    href: '/settings/permissions', 
    label: 'Permisos', 
    icon: Shield, 
    permissionKey: 'manage_team',
    roles: ['admin', 'supervisor'],
    planRequired: 'business'
  },
  { 
    href: '/settings/subscription', 
    label: 'Suscripción', 
    icon: Crown, 
    permissionKey: 'view_settings',
    roles: ['admin']
  },
  { 
    href: '/settings/profile', 
    label: 'Configuración', 
    icon: Settings, 
    permissionKey: 'view_settings' 
  },
]

export default function DashboardSidebar({ role, tenant, permissions = {}, plan = 'standard' }: DashboardSidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const slug = (params.slug as string) || ''

  const closeDrawer = () => {
    const drawer = document.getElementById('dashboard-drawer') as HTMLInputElement
    if (drawer) drawer.checked = false
  }

  const hasPermission = (item: MenuItem): boolean => {
    if (role === 'admin') return true
    if (item.planRequired === 'business' && plan !== 'business') return false
    if (item.roles && !item.roles.includes(role)) return false
    if (role === 'supervisor') return true
    return permissions[item.permissionKey] === true
  }

  return (
    <aside className="w-64 bg-base-100 h-full shadow-xl flex flex-col border-r border-base-200">
      <div className="p-4 border-b border-base-200">
        <Link href={`/${slug}/dashboard`} onClick={closeDrawer} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ToothIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base-content text-sm truncate w-32">{tenant.name}</h2>
            <p className="text-xs text-base-content/50 capitalize font-semibold">{role}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => hasPermission(item))
          .map((item) => {
            const fullPath = `/${slug}${item.href}`
            const isActive = pathname === fullPath || pathname.startsWith(fullPath + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={fullPath}
                onClick={closeDrawer}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
      </nav>

      <div className="p-4 border-t border-base-200 bg-base-100/50">
        <form action={logout}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-error hover:bg-error/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </form>
        <div className="mt-3 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
          v{APP_VERSION}
        </div>
      </div>
    </aside>
  )
}
