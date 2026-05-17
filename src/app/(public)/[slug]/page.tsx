import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import QRCode from 'qrcode'
import TenantLandingClient from './TenantLandingClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function TenantPublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    notFound()
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const clinicUrl = `${protocol}://${host}/${slug}`

  const qrSvg = await QRCode.toString(clinicUrl, {
    type: 'svg',
    width: 200,
    margin: 1,
    color: { dark: '#1e40af', light: '#ffffff' },
  })

  return <TenantLandingClient tenant={tenant} clinicUrl={clinicUrl} qrSvg={qrSvg} />
}
