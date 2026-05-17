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
} from 'lucide-react'
import { Tooth as ToothIcon } from '@/components/ui/ToothIcon'
import { APP_VERSION } from '@/lib/version'
import { logout } from '@/app/(auth)/actions'

interface Tenant {
  name: string
  slug: string
}

interface DashboardSidebarProps {
  role: string
  tenant: Tenant
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ceo', 'admin', 'doctor', 'nurse', 'receptionist'] },
  { href: '/admission/patients', label: 'Pacientes', icon: Users, roles: ['ceo', 'admin', 'receptionist', 'doctor', 'nurse'] },
  { href: '/admission/appointments', label: 'Turnos', icon: CalendarDays, roles: ['ceo', 'admin', 'receptionist', 'doctor', 'nurse'] },
  { href: '/odontology', label: 'Odontología', icon: ToothIcon, roles: ['ceo', 'admin', 'doctor'] },
  { href: '/nursing/vital-signs', label: 'Enfermería', icon: HeartPulse, roles: ['ceo', 'admin', 'nurse', 'doctor'] },
  { href: '/settings/landing-page', label: 'Mis Clínicas', icon: QrCode, roles: ['ceo', 'admin'] },
  { href: '/settings/team', label: 'Equipo', icon: Users, roles: ['ceo', 'admin'] },
  { href: '/settings/permissions', label: 'Permisos', icon: Shield, roles: ['ceo', 'admin'] },
  { href: '/settings/profile', label: 'Configuración', icon: Settings, roles: ['ceo', 'admin'] },
]

export default function DashboardSidebar({ role, tenant }: DashboardSidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params.slug as string

  return (
    <aside className="w-64 bg-base-100 shadow-xl flex flex-col">
      <div className="p-4 border-b border-base-200">
        <Link href={`/${slug}/dashboard`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ToothIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base-content text-sm">{tenant.name}</h2>
            <p className="text-xs text-base-content/50 capitalize">{role}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const fullPath = `/${slug}${item.href}`
            const isActive = pathname === fullPath || pathname.startsWith(fullPath + '/')
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
                <item.icon className="w-5 h-5" />
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
