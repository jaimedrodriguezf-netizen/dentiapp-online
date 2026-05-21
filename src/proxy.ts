import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * PROXY DE SEGURIDAD PARA DENTIAPP ONLINE
 * --------------------------------------
 * Este archivo centraliza TODA la seguridad de rutas del proyecto.
 */

interface TenantProxyInfo {
  id: string
  name: string
  slug: string
  plan: 'free' | 'standard' | 'business'
}

interface MembershipProxyInfo {
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_id: string
  tenants: TenantProxyInfo
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname
  const pathSegments = path.split('/').filter(Boolean)

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Localized module list. Kept local because Next.js Edge runtime does not allow
  // importing components/modules from external routes files without bundle issues.
  const tenantModules = ['dashboard', 'admission', 'nursing', 'odontology', 'settings']
  const isAuthRoute = path === '/login' || path === '/register'
  const isProtectedTenantRoute =
    pathSegments.length >= 2 &&
    (tenantModules.includes(pathSegments[1]) || path.includes('/settings/'))
  const requiresAuth = isAuthRoute || isProtectedTenantRoute

  // Check if a Supabase auth cookie exists to determine if session refresh is needed
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.includes('auth-token') || cookie.name.startsWith('sb-')
  )

  // Early return for public routes to avoid slow Supabase API calls, unless there is an auth session to refresh
  if (!requiresAuth && !hasAuthCookie) {
    return supabaseResponse
  }

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

  // 1. Verificar Sesión
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  // 2. Redirecciones Inteligentes para Auth
  if (user && (path === '/login' || path === '/register')) {
    const { data: membershipRaw } = await supabase
      .from('tenant_members')
      .select('tenants(slug)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    
    if (membershipRaw && membershipRaw.tenants) {
      const tenantsVal = membershipRaw.tenants
      const firstTenant = Array.isArray(tenantsVal) ? tenantsVal[0] : tenantsVal
      if (firstTenant && typeof firstTenant === 'object' && 'slug' in firstTenant) {
        const slug = String((firstTenant as { slug: string }).slug || '')
        return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
      }
    }
  }

  // 3. PROTECCIÓN DE RUTAS DEL TENANT (/[slug]/...)
  if (pathSegments.length >= 2) {
    const slug = pathSegments[0]
    const tenantModule = pathSegments[1]
    const subPage = pathSegments[2]

    if (tenantModules.includes(tenantModule) || path.includes('/settings/')) {
      if (!user) {
        return NextResponse.redirect(new URL(`/login`, request.url))
      }

      // 4. Verificar Membresía, Rol y Plan
      const { data: membershipRaw } = await supabase
        .from('tenant_members')
        .select('role, tenant_id, tenants(id, name, slug, plan)')
        .eq('user_id', user.id)
        .eq('tenants.slug', slug)
        .maybeSingle()
      
      if (!membershipRaw) {
        return NextResponse.redirect(new URL(`/login`, request.url))
      }

      const rawTenants = membershipRaw.tenants
      const firstTenant = Array.isArray(rawTenants) ? rawTenants[0] : rawTenants
      if (!firstTenant || typeof firstTenant !== 'object') {
        return NextResponse.redirect(new URL(`/login`, request.url))
      }

      const tObj = firstTenant as { id?: string; name?: string; slug?: string; plan?: string }
      const tenants: TenantProxyInfo = {
        id: String(tObj.id || ''),
        name: String(tObj.name || ''),
        slug: String(tObj.slug || ''),
        plan: (tObj.plan as TenantProxyInfo['plan']) || 'free'
      }

      const membership: MembershipProxyInfo = {
        role: membershipRaw.role as MembershipProxyInfo['role'],
        tenant_id: membershipRaw.tenant_id,
        tenants
      }

      const role = membership.role
      const plan = membership.tenants.plan

      if (role === 'admin') return supabaseResponse

      // A. RESTRICCIÓN DE ENFERMERÍA (Exclusivo Plan Business)
      if (tenantModule === 'nursing' && plan !== 'business') {
        return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
      }

      // B. RESTRICCIÓN DE CONFIGURACIÓN SENSIBLE (Permisos y Equipo)
      if (tenantModule === 'settings' && (subPage === 'permissions' || subPage === 'team')) {
        if (plan !== 'business') {
          return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
        }
        if (role !== 'supervisor') {
          return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
        }
      }

      // C. RESTRICCIÓN DE PLAN STANDARD (Uso personal)
      if (plan === 'standard' && tenantModule === 'admission') {
         // El Doctor TAMBIÉN necesita entrar a admisión para ver sus pacientes y turnos
         if (role !== 'supervisor' && role !== 'doctor') {
            return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
         }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
