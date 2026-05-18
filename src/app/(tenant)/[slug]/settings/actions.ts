'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface TenantInfo {
  id: string
  plan: 'standard' | 'business'
}

interface UserMembership {
  id: string
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_plan: 'standard' | 'business'
}

interface TeamMember {
  id: string
  role: string
  users: {
    id: string
    email: string
    raw_user_meta_data: {
      name?: string
    }
  } | {
    id: string
    email: string
    raw_user_meta_data: {
      name?: string
    }
  }[]
}

async function getTenantInfo(slug: string): Promise<TenantInfo | null> {
  const supabase = await createClient()
  const { data: tenant } = await supabase.from('tenants').select('id, plan').eq('slug', slug).single()
  if (!tenant) return null
  return {
    id: tenant.id,
    plan: tenant.plan as 'standard' | 'business'
  }
}

async function requireAuth(slug: string): Promise<UserMembership | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const tenant = await getTenantInfo(slug)
  if (!tenant) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .single()

  if (!membership) return null

  return { 
    id: membership.id, 
    role: membership.role as UserMembership['role'], 
    tenant_plan: tenant.plan 
  }
}

export async function updateClinic(slug: string, formData: FormData) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  
  // AHORA EL DOCTOR TAMBIÉN PUEDE EDITAR SU CLÍNICA
  const allowedRoles: string[] = ['admin', 'supervisor', 'doctor']
  if (!membership || !allowedRoles.includes(membership.role)) {
    return { error: 'No autorizado' }
  }

  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('tenants')
    .update({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
    })
    .eq('id', tenant.id)

  if (error) return { error: error.message }
  redirect(`/${slug}/settings/profile`)
}

export async function getTeamMembers(slug: string): Promise<TeamMember[]> {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  if (!membership) return []

  const tenant = await getTenantInfo(slug)
  if (!tenant) return []

  const { data: members } = await supabase
    .from('tenant_members')
    .select('id, role, users(id, email, raw_user_meta_data)')
    .eq('tenant_id', tenant.id)

  return (members as unknown as TeamMember[]) ?? []
}

export async function updateMemberRole(slug: string, memberId: string, formData: FormData) {
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'supervisor' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  if (membership.tenant_plan === 'standard') {
    return { error: 'El plan Standard no permite gestionar equipo. Mejore al plan Business.' }
  }

  const supabase = await createClient()
  const role = formData.get('role') as string
  const { error } = await supabase.from('tenant_members').update({ role }).eq('id', memberId)
  if (error) return { error: error.message }
  redirect(`/${slug}/settings/team`)
}

export async function removeMember(slug: string, memberId: string) {
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'supervisor' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  if (membership.tenant_plan === 'standard') {
    return { error: 'El plan Standard no permite gestionar equipo. Mejore al plan Business.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenant_members')
    .delete()
    .eq('id', memberId)

  if (error) return { error: error.message }
  redirect(`/${slug}/settings/team`)
}

export async function getRolePermissions(slug: string) {
  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return []

  const { data: permissions } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('tenant_id', tenant.id)

  return permissions || []
}

export async function togglePermission(slug: string, role: string, permissionKey: string, isAllowed: boolean) {
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'supervisor' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  if (membership.tenant_plan === 'standard') {
    return { error: 'El plan Standard no permite gestionar permisos. Mejore al plan Business.' }
  }

  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'Clínica no encontrada' }

  const { error } = await supabase
    .from('role_permissions')
    .upsert({
      tenant_id: tenant.id,
      role,
      permission_key: permissionKey,
      is_allowed: isAllowed,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'tenant_id,role,permission_key'
    })

  if (error) return { error: error.message }
  return { success: true }
}
