import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's tenant membership and redirect to tenant dashboard
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('*, tenants(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership || !membership.tenants) {
    redirect('/onboarding')
  }

  const rawTenant = membership.tenants as unknown
  const firstTenant = Array.isArray(rawTenant) ? rawTenant[0] : rawTenant
  const slug = (firstTenant as { slug?: string })?.slug

  if (slug) {
    redirect(`/${slug}/dashboard`)
  }

  return (
    <div className="flex h-screen bg-base-200">
      <DashboardSidebar role={membership.role} tenant={membership.tenants} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} tenant={membership.tenants} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
