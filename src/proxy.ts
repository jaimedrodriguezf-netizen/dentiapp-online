import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('tenants(slug)')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      const tenantSlug = (membership.tenants as unknown as { slug: string }).slug
      const dashboardUrl = new URL(`/${tenantSlug}/dashboard`, request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // If user is NOT logged in and tries to access tenant dashboard, redirect to login
  if (!user && request.nextUrl.pathname.match(/^\/[^/]+\/dashboard/)) {
    const slug = request.nextUrl.pathname.split('/')[1]
    const loginUrl = new URL(`/${slug}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
