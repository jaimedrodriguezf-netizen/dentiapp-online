'use server'

import { createClient } from '@/lib/supabase/server'

export async function bookAppointment(slug: string, _prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) return { error: 'Clínica no encontrada' }

  const { data, error } = await supabase.rpc('book_appointment', {
    p_tenant_id: tenant.id,
    p_name: formData.get('name') as string,
    p_phone: formData.get('phone') as string,
    p_email: formData.get('email') as string || null,
    p_date: formData.get('date') as string,
    p_time: formData.get('time') as string,
    p_reason: formData.get('reason') as string || null,
  })

  if (error) return { error: error.message }

  return { success: true, data }
}

export async function getBusySlots(slug: string, date: string) {
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) return { busy: [] }

  const { data: appointments } = await supabase
    .from('appointments')
    .select('time')
    .eq('tenant_id', tenant.id)
    .eq('date', date)
    .not('status', 'in', '("cancelled","no_show")')

  const busy = appointments?.map((a) => a.time.slice(0, 5)) ?? []

  return { busy }
}
