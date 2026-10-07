import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect')

  const origin = requestUrl.origin

  // Sanitize redirect URL against open-redirect attacks (Zero-Trust)
  const safeRedirect =
    redirectParam &&
    redirectParam.startsWith('/') &&
    !redirectParam.startsWith('//') &&
    !redirectParam.includes('\\')
      ? redirectParam
      : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Query existing tenant membership
        const { data: membership } = await supabase
          .from('tenant_members')
          .select('tenants(slug)')
          .eq('user_id', user.id)
          .maybeSingle()

        if (membership && membership.tenants) {
          const rawTenants = membership.tenants
          const tenantObj = Array.isArray(rawTenants) ? rawTenants[0] : rawTenants
          const slug = (tenantObj as { slug?: string })?.slug

          if (slug) {
            const destination = safeRedirect || `/${slug}/dashboard`
            return NextResponse.redirect(`${origin}${destination}`)
          }
        }

        // New or invited authenticated user without tenant -> onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    } else {
      console.error('OAuth callback exchangeCodeForSession error:', error.message)
    }
  }

  // Redirect to login with error query param on failure
  const errorMsg = encodeURIComponent(
    'No pudimos iniciar sesión con Google. Por favor intentá de nuevo.'
  )
  return NextResponse.redirect(`${origin}/login?error=${errorMsg}`)
}
