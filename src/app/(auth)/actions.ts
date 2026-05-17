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
    return { error: error.message }
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
      redirect(`/${membership.tenants.slug}/dashboard`)
    }
  }

  redirect('/onboarding')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create tenant automatically
  if (data.user) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || `user-${data.user.id.slice(0, 8)}`

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: `${name}'s Clínica`,
        slug,
      })
      .select()
      .single()

    if (tenantError && tenantError.code !== '23505') {
      // Ignore unique constraint errors, tenant might already exist
      console.error('Tenant creation error:', tenantError)
    }

    if (tenant) {
      await supabase
        .from('tenant_members')
        .insert({
          tenant_id: tenant.id,
          user_id: data.user.id,
          role: 'ceo',
        })

      redirect(`/${tenant.slug}/dashboard`)
    } else {
      redirect('/onboarding')
    }
  }

  redirect('/onboarding')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
