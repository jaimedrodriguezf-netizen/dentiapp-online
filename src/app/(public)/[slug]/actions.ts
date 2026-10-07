'use server'

import { createClient } from '@/lib/supabase/server'

export async function bookAppointment(slug: string, _prevState: unknown, formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const emailRaw = formData.get('email') ? String(formData.get('email')).trim() : null
  const date = String(formData.get('date') || '').trim()
  const time = String(formData.get('time') || '').trim()
  const reasonRaw = formData.get('reason') ? String(formData.get('reason')).trim() : null

  if (!name) {
    return { error: 'El nombre es requerido' }
  }
  if (name.length > 100) {
    return { error: 'El nombre no puede superar los 100 caracteres' }
  }

  if (!phone) {
    return { error: 'El teléfono es requerido' }
  }
  if (phone.length > 30) {
    return { error: 'El teléfono no puede superar los 30 caracteres' }
  }

  if (emailRaw && (emailRaw.length > 100 || !emailRaw.includes('@'))) {
    return { error: 'El correo electrónico no es válido' }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Formato de fecha inválido' }
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { error: 'Formato de hora inválido' }
  }

  const email = emailRaw || null
  const reason = reasonRaw ? reasonRaw.slice(0, 500) : null

  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) return { error: 'Clínica no encontrada' }

  const { data, error } = await supabase.rpc('book_appointment', {
    p_tenant_id: tenant.id,
    p_name: name,
    p_phone: phone,
    p_email: email,
    p_date: date,
    p_time: time,
    p_reason: reason,
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
