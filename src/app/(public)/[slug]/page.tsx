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

  // Build WhatsApp link
  const whatsappNumber = tenant.whatsapp_number || tenant.phone
  let whatsappLink: string | null = null
  if (whatsappNumber) {
    const clean = whatsappNumber.replace(/[\s\-\+\(\)]/g, '')
    const message = encodeURIComponent(`¡Hola! Quisiera agendar un turno. Vi su página: ${clinicUrl}`)
    whatsappLink = `https://wa.me/${clean}?text=${message}`
  }

  // Fetch operating hours
  const { data: operatingHours } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('day_of_week', { ascending: true })

  return <TenantLandingClient tenant={tenant} clinicUrl={clinicUrl} qrSvg={qrSvg} whatsappLink={whatsappLink} operatingHours={operatingHours || []} />
}
