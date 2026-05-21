'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

interface TenantInfo {
  id: string
  plan: 'free' | 'standard' | 'business'
}

interface UserMembership {
  id: string
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_plan: 'free' | 'standard' | 'business'
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
    plan: tenant.plan as 'free' | 'standard' | 'business'
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

// ============================================================
// CLINIC PROFILE
// ============================================================

export async function updateClinic(slug: string, formData: FormData) {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  
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
      whatsapp_number: formData.get('whatsapp_number') as string || null,
    })
    .eq('id', tenant.id)

  if (error) return { error: error.message }
  redirect(`/${slug}/settings/profile`)
}

// ============================================================
// TEAM MANAGEMENT
// ============================================================

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

  if (membership.tenant_plan !== 'business') {
    return { error: 'El plan actual no permite gestionar equipo. Mejore al plan Business.' }
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

  if (membership.tenant_plan !== 'business') {
    return { error: 'El plan actual no permite gestionar equipo. Mejore al plan Business.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenant_members')
    .delete()
    .eq('id', memberId)

  if (error) return { error: error.message }
  redirect(`/${slug}/settings/team`)
}

// ============================================================
// PERMISSIONS
// ============================================================

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

  if (membership.tenant_plan !== 'business') {
    return { error: 'El plan actual no permite gestionar permisos. Mejore al plan Business.' }
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

// ============================================================
// OPERATING HOURS
// ============================================================

export interface OperatingHour {
  id?: string
  tenant_id?: string
  day_of_week: number
  is_open: boolean
  open_time: string | null
  close_time: string | null
}

export async function getOperatingHours(slug: string): Promise<OperatingHour[]> {
  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return []

  const { data } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('day_of_week', { ascending: true })

  if (!data || data.length === 0) {
    return Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_open: i > 0 && i < 6,
      open_time: '08:00',
      close_time: '18:00',
      tenant_id: tenant.id,
    }))
  }

  return data as OperatingHour[]
}

export async function updateOperatingHours(slug: string, formData: FormData) {
  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'No tienes una clínica activa' }

  await supabase.from('operating_hours').delete().eq('tenant_id', tenant.id)

  const hours: OperatingHour[] = []
  for (let day = 0; day < 7; day++) {
    const isOpen = formData.get(`day_${day}_open`) === 'true'
    hours.push({
      tenant_id: tenant.id,
      day_of_week: day,
      is_open: isOpen,
      open_time: isOpen ? (formData.get(`day_${day}_open_time`) as string) : null,
      close_time: isOpen ? (formData.get(`day_${day}_close_time`) as string) : null,
    })
  }

  const { error } = await supabase.from('operating_hours').insert(hours)
  if (error) return { error: error.message }

  revalidatePath(`/${slug}/settings/profile`)
  return { success: true }
}

// ============================================================
// CONSENTS
// ============================================================

export async function createConsent(
  slug: string,
  patientId: string | null,
  type: string = 'data_treatment',
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase.from('consents').insert({
    tenant_id: tenant.id,
    patient_id: patientId,
    type,
    metadata: metadata || {},
  })

  if (error) return { error: error.message }
  return { success: true }
}

// ============================================================
// APPOINTMENT RESCHEDULE
// ============================================================

export async function rescheduleAppointment(
  slug: string,
  appointmentId: string,
  newDate: string,
  newTime: string
) {
  const supabase = await createClient()
  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('appointments')
    .update({ date: newDate, time: newTime, status: 'scheduled' })
    .eq('id', appointmentId)
    .eq('tenant_id', tenant.id)

  if (error) return { error: error.message }

  revalidatePath(`/${slug}/admission/appointments`)
  return { success: true }
}

// ============================================================
// SUBSCRIPTION
// ============================================================

export async function updateSubscriptionPlan(slug: string, newPlan: 'free' | 'standard' | 'business') {
  const supabase = await createClient()
  const membership = await requireAuth(slug)
  
  if (!membership || membership.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  const tenant = await getTenantInfo(slug)
  if (!tenant) return { error: 'No tienes una clínica activa' }

  const { error } = await supabase
    .from('tenants')
    .update({ plan: newPlan })
    .eq('id', tenant.id)

  if (error) return { error: error.message }

  revalidatePath(`/${slug}/settings/subscription`)
  revalidatePath(`/${slug}/dashboard`)
  return { success: true }
}
