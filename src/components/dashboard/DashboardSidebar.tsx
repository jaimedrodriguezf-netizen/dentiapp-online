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
    roles: ['admin', 'supervisor', 'doctor'] // DOCTOR AGREGADO
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

  const hasPermission = (item: MenuItem): boolean => {
    // 1. El Admin es DIOS, pasa siempre
    if (role === 'admin') return true

    // 2. Si el item requiere roles específicos y el usuario no lo tiene, REBOTA
    if (item.roles && !item.roles.includes(role)) return false

    // 3. Si el item requiere plan Business y el tenant es Standard, REBOTA
    if (item.planRequired === 'business' && plan !== 'business') return false
    
    // 4. Jerarquía de Supervisor
    if (role === 'supervisor') return true
    
    // 5. Para el resto de roles (Doctor, Nurse, etc.), verificar mapa de permisos
    return permissions[item.permissionKey] === true
  }

  return (
    <aside className="w-64 bg-base-100 shadow-xl flex flex-col">
      <div className="p-4 border-b border-base-200">
        <Link href={`/${slug}/dashboard`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ToothIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base-content text-sm truncate w-32">{tenant.name}</h2>
            <p className="text-xs text-base-content/50 capitalize font-semibold">{role}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
      </nav>

      <div className="p-4 border-t border-base-200">
        <form action={logout}>
          <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </form>
        <div className="mt-3 text-center text-xs text-gray-400">
          v{APP_VERSION}
        </div>
      </div>
    </aside>
  )
}
