import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import SubscriptionClient from './SubscriptionClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SubscriptionPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    redirect('/login')
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, plan')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    return (
      <div className="w-full p-8 text-center text-red-500 font-bold">
        Clínica no encontrada
      </div>
    )
  }

  // Check role in tenant_members
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('tenant_id', tenant.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
        <Shield className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-gray-900">Acceso Restringido</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Sólo los administradores de la clínica tienen permisos para ver o modificar la suscripción y los planes.
        </p>
        <Link href={`/${slug}/settings/profile`} className="btn btn-primary rounded-2xl font-black px-6 h-12 mt-6">
          Volver a Configuración
        </Link>
      </div>
    )
  }

  return (
    <SubscriptionClient
      slug={slug}
      clinicName={tenant.name}
      currentPlan={tenant.plan as 'free' | 'standard' | 'business'}
      role={membership.role}
    />
  )
}
