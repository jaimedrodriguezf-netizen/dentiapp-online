'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getTenantId(slug: string) {
  const supabase = await createClient()
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single()
  return tenant?.id
}

async function requireAuth(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const tenantId = await getTenantId(slug)
  if (!tenantId) return null

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  return membership
}

export async function updateClinic(slug: string, formData: FormData) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'ceo' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const tenantId = await getTenantId(slug)
  if (!tenantId) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('tenants')
    .update({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
    })
    .eq('id', tenantId)

  if (error) return { error: error.message }
  redirect(`/${slug}/settings/profile`)
}

export async function getTeamMembers(slug: string) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  if (!membership) return []

  const tenantId = await getTenantId(slug)
  if (!tenantId) return []

  const { data: members } = await supabase
    .from('tenant_members')
    .select('id, role, users:user_id(id, email)')
    .eq('tenant_id', tenantId)

  return members ?? []
}

export async function removeMember(slug: string, memberId: string) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'ceo' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase.from('tenant_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateMemberRole(slug: string, memberId: string, formData: FormData) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  if (!membership || (membership.role !== 'ceo' && membership.role !== 'admin')) {
    return { error: 'No autorizado' }
  }

  const role = formData.get('role') as string
  const { error } = await supabase.from('tenant_members').update({ role }).eq('id', memberId)
  if (error) return { error: error.message }
  redirect(`/${slug}/settings/team`)
}
