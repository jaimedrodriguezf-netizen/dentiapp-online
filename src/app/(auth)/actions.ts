'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const message = error.message === 'Invalid login credentials' 
      ? 'Correo o contraseña incorrectos' 
      : error.message;
    return { error: message }
  }

  // Get user's tenant and redirect to their dashboard
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('tenants(slug)')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      const tenantSlug = (membership.tenants as unknown as { slug: string }).slug
      redirect(`/${tenantSlug}/dashboard`)
    }
  }

  redirect('/onboarding')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create tenant automatically
  if (data.user) {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || `user-${data.user.id.slice(0, 8)}`

    // Validar unicidad del slug ANTES del INSERT para evitar el 23505 silencioso.
    // Si el slug base está tomado, agregar sufijo numérico: foo-clinica-2, foo-clinica-3, ...
    let slug = baseSlug
    let attempts = 0
    const MAX_ATTEMPTS = 50

    while (attempts < MAX_ATTEMPTS) {
      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!existing) break

      attempts++
      slug = `${baseSlug}-${attempts + 1}`
    }

    if (attempts >= MAX_ATTEMPTS) {
      // Fallback extremo: usar UUID corto
      slug = `${baseSlug}-${data.user.id.slice(0, 8)}`
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: `${name}'s Clínica`,
        slug: slug,
        plan: 'standard' // Por defecto plan Standard (individual)
      })
      .select()
      .single()

    if (tenantError) {
      // Solo llegamos acá por race condition (otro user creó el mismo slug
      // entre nuestro check y el INSERT). El trigger también podría haber
      // rechazado si plan != free|standard.
      console.error('Tenant creation error:', tenantError)
      return { error: 'No pudimos crear tu clínica. Por favor intentá de nuevo.' }
    }

    if (tenant) {
      await supabase.from('tenant_members').insert({
        tenant_id: tenant.id,
        user_id: data.user.id,
        role: 'doctor', // El creador en plan Standard es un Doctor
      })
      redirect(`/${tenant.slug}/dashboard`)
    }
  }

  redirect('/onboarding')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
