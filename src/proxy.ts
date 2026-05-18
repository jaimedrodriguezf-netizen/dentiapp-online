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
  plan: 'standard' | 'business'
}

interface MembershipProxyInfo {
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_id: string
  tenants: TenantProxyInfo
}

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

  // 1. Verificar Sesión
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  
  const url = request.nextUrl.clone()
  const path = url.pathname
  const pathSegments = path.split('/').filter(Boolean)

  if (path === '/' || path.startsWith('/api/') || path.startsWith('/_next/')) {
    return supabaseResponse
  }

  // 2. Redirecciones Inteligentes para Auth
  if (user && (path === '/login' || path === '/register')) {
    const { data: membershipRaw } = await supabase
      .from('tenant_members')
      .select('tenants(slug)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    
    if (membershipRaw && membershipRaw.tenants) {
      const tenants = membershipRaw.tenants as unknown as { slug: string }
      return NextResponse.redirect(new URL(`/${tenants.slug}/dashboard`, request.url))
    }
  }

  // 3. PROTECCIÓN DE RUTAS DEL TENANT (/[slug]/...)
  if (pathSegments.length >= 2) {
    const slug = pathSegments[0]
    const tenantModule = pathSegments[1]
    const subPage = pathSegments[2]

    const tenantModules = ['dashboard', 'admission', 'nursing', 'odontology', 'settings']
    
    if (tenantModules.includes(tenantModule) || path.includes('/settings/')) {
      if (!user) {
        return NextResponse.redirect(new URL(`/${slug}/login`, request.url))
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

      // Mapping seguro sin any
      const membership: MembershipProxyInfo = {
        role: membershipRaw.role as MembershipProxyInfo['role'],
        tenant_id: membershipRaw.tenant_id,
        tenants: membershipRaw.tenants as unknown as TenantProxyInfo
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
        if (role !== 'supervisor') {
          return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url))
        }

        if (subPage === 'team' && plan === 'standard') {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
