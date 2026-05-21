import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import QRCode from 'qrcode'
import TenantLandingClient from './TenantLandingClient'

interface Props {
  params: Promise<{ slug: string }>
}

interface OperatingHour {
  id: string
  tenant_id: string
  day_of_week: number
  is_open: boolean
  open_time: string | null
  close_time: string | null
  created_at: string
  updated_at: string
}

export default async function TenantPublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Consolidamos ambas consultas en una sola para evitar la latencia de dos llamadas secuenciales
  const { data: tenantRaw } = await supabase
    .from('tenants')
    .select('*, operating_hours(*)')
    .eq('slug', slug)
    .single()

  if (!tenantRaw) {
    notFound()
  }

  const { operating_hours, ...tenant } = tenantRaw
  const sortedOperatingHours = ((operating_hours as unknown as OperatingHour[]) || []).sort(
    (a, b) => a.day_of_week - b.day_of_week
  )

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

  return (
    <TenantLandingClient
      tenant={tenant}
      clinicUrl={clinicUrl}
      qrSvg={qrSvg}
      whatsappLink={whatsappLink}
      operatingHours={sortedOperatingHours}
    />
  )
}
