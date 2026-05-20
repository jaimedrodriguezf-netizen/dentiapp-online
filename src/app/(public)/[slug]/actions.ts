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

  // Record consent if checkbox was checked
  if (formData.get('consent') === 'on') {
    const patientId = (data as { patient_id?: string })?.patient_id
    await supabase.from('consents').insert({
      tenant_id: tenant.id,
      patient_id: patientId || null,
      type: 'data_treatment',
      metadata: {
        source: 'booking_form',
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
      }
    }).select('id').single()
    // Ignore consent insert errors — don't block the booking
  }

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
