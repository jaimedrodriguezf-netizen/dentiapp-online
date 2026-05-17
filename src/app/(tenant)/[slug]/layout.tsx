import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export default async function TenantDashboardLayout({ params, children }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${slug}/login`)
  }

  // Get user's tenant membership
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('*, tenants(*)')
    .eq('user_id', user.id)
    .eq('tenants.slug', slug)
    .single()

  if (!membership) {
    notFound()
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
