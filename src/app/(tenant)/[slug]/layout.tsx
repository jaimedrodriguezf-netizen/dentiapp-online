import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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

interface SupabaseMembershipResponse {
  role: string
  tenant_id: string
  tenants: {
    id: string
    name: string
    slug: string
    plan: string
  } | {
    id: string
    name: string
    slug: string
    plan: string
  }[] | null
}

export default async function TenantLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    redirect(`/${slug}/login`)
  }

  // Get user's tenant membership
  const { data: membershipRaw } = await supabase
    .from('tenant_members')
    .select('role, tenant_id, tenants(id, name, slug, plan)')
    .eq('user_id', user.id)
    .eq('tenants.slug', slug)
    .single()

  if (!membershipRaw) {
    notFound()
  }

  const raw = membershipRaw as unknown as SupabaseMembershipResponse
  const tenantsRaw = Array.isArray(raw.tenants) ? raw.tenants[0] : raw.tenants

  if (!tenantsRaw) notFound()

  const membership: MembershipLayoutData = {
    role: raw.role as MembershipLayoutData['role'],
    tenant_id: raw.tenant_id,
    tenants: {
      id: tenantsRaw.id,
      name: tenantsRaw.name,
      slug: tenantsRaw.slug,
      plan: (tenantsRaw.plan as 'standard' | 'business') || 'standard'
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
