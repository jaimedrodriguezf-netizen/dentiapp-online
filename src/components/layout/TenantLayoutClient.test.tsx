import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TenantLayoutClient from './TenantLayoutClient'
import { User } from '@supabase/supabase-js'

vi.mock('next/navigation', () => ({
  usePathname: () => '/test-clinic/dashboard',
  useParams: () => ({ slug: 'test-clinic' }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('TenantLayoutClient', () => {
  const mockUser = {
    id: 'user-1',
    email: 'doc@example.com',
    user_metadata: { name: 'Dr. John' },
  } as unknown as User

  const mockMembership = {
    role: 'doctor' as const,
    tenant_id: 'tenant-1',
    tenants: {
      id: 'tenant-1',
      name: 'Test Clinic',
      slug: 'test-clinic',
      plan: 'standard' as const,
      logo_url: null,
      phone: null,
      address: null,
    },
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders dashboard layout and sidebar', () => {
    render(
      <TenantLayoutClient
        user={mockUser}
        membership={mockMembership}
        permissionsMap={{ view_dashboard: true }}
      >
        <div>Content Child</div>
      </TenantLayoutClient>
    )

    expect(screen.getByText('Content Child')).toBeInTheDocument()
    expect(screen.getAllByText('Test Clinic').length).toBe(2)
  })

  it('toggles sidebar on desktop toggle button click and saves to localStorage', () => {
    render(
      <TenantLayoutClient
        user={mockUser}
        membership={mockMembership}
        permissionsMap={{ view_dashboard: true }}
      >
        <div>Content Child</div>
      </TenantLayoutClient>
    )

    const toggleBtn = screen.getByTitle('Ocultar menú')
    fireEvent.click(toggleBtn)

    expect(localStorage.getItem('sidebar-open')).toBe('false')
  })
})
