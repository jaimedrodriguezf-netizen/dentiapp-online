import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import TenantLayoutClient from '@/components/layout/TenantLayoutClient'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

interface TenantLayoutData {
  id: string
  name: string
  slug: string
  plan: 'standard' | 'business'
}

interface MembershipLayoutData {
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_id: string
  tenants: TenantLayoutData
}

export default async function TenantLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // El proxy ya validó auth y membresía. Leemos del header para evitar
  // un round-trip extra a Supabase. La RLS protege contra manipulación
  // de headers porque filtra por auth.uid() en cada query.
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')
  const tenantSlug = headersList.get('x-tenant-slug')
  const tenantName = headersList.get('x-tenant-name')
  const tenantRole = headersList.get('x-tenant-role') as MembershipLayoutData['role'] | null
  const tenantPlan = headersList.get('x-tenant-plan') as 'standard' | 'business' | null

  // Si no tenemos headers, el proxy no pasó la validación
  if (!tenantId || !tenantSlug || !tenantName || !tenantRole || !tenantPlan) {
    redirect(`/${slug}/login`)
  }

  // getUser es necesario para refrescar la cookie de sesión
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    redirect(`/${slug}/login`)
  }

  const membership: MembershipLayoutData = {
    role: tenantRole,
    tenant_id: tenantId,
    tenants: {
      id: tenantId,
      name: tenantName,
      slug: tenantSlug,
      plan: tenantPlan
    }
  }

  // Get dynamic permissions for this role
  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permission_key, is_allowed')
    .eq('tenant_id', membership.tenant_id)
    .eq('role', membership.role)

  const permissionsMap: Record<string, boolean> = {}
  if (rolePermissions) {
    rolePermissions.forEach(p => {
      permissionsMap[p.permission_key] = p.is_allowed
    })
  }

  return (
    <TenantLayoutClient
      user={user}
      membership={membership}
      permissionsMap={permissionsMap}
    >
      {children}
    </TenantLayoutClient>
  )
}
