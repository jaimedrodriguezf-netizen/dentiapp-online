import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'

// Mock de Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/demo/dashboard',
  useParams: () => ({ slug: 'demo' }),
}))

// Mock de las acciones
vi.mock('../app/(auth)/actions', () => ({
  logout: vi.fn(),
}))

describe('DashboardSidebar Permissions', () => {
  const mockTenant = { name: 'Test Clinic', slug: 'demo' }

  it('should show Odontology for Doctor when permission is true', () => {
    const permissions = { view_odontology: true, view_dashboard: true }
    render(<DashboardSidebar role="doctor" tenant={mockTenant} permissions={permissions} />)
    
    expect(screen.getByText('Odontología')).toBeDefined()
  })

  it('should NOT show Permissions for Doctor even if permission map says true', () => {
    const permissions = { manage_team: true, view_dashboard: true }
    render(<DashboardSidebar role="doctor" tenant={mockTenant} permissions={permissions} />)
    
    expect(screen.queryByText('Permisos')).toBeNull()
  })

  it('should show Permissions for Admin', () => {
    const permissions = { manage_team: true, view_dashboard: true }
    render(<DashboardSidebar role="admin" tenant={mockTenant} permissions={permissions} />)
    
    expect(screen.getByText('Permisos')).toBeDefined()
  })

  it('should always show everything for Admin regardless of permissions map', () => {
    const permissions = { view_odontology: false, manage_team: false }
    render(<DashboardSidebar role="admin" tenant={mockTenant} permissions={permissions} />)
    
    expect(screen.getByText('Odontología')).toBeDefined()
    expect(screen.getByText('Permisos')).toBeDefined()
  })

  it('should show Suscripción for Admin', () => {
    render(<DashboardSidebar role="admin" tenant={mockTenant} />)
    expect(screen.getByText('Suscripción')).toBeDefined()
  })

  it('should NOT show Suscripción for Doctor', () => {
    render(<DashboardSidebar role="doctor" tenant={mockTenant} />)
    expect(screen.queryByText('Suscripción')).toBeNull()
  })
})
