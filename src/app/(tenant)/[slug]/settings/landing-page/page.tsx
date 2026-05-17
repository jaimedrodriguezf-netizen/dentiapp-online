import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import QRCodeDisplay from '@/components/ui/QRCodeDisplay'
import { QrCode, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function LandingPageSettings({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (tenantError || !tenant) {
    return <div className="text-center py-16"><p className="text-gray-500">Clínica no encontrada</p></div>
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const clinicUrl = `${protocol}://${host}/${slug}`

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Landing Page</h2>
        <p className="text-gray-500 mt-1">Tu página pública para que los pacientes te encuentren</p>
      </div>

      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Código QR de tu clínica</h3>
          <p className="text-sm text-gray-500 mb-4">
            Escaneá este código o compartilo con tus pacientes para que saquen turno rápido
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <QRCodeDisplay url={clinicUrl} size={200} />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link href={`/${slug}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                  {clinicUrl}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Imprimí este QR y ponelo en la recepción de tu clínica para que los pacientes saquen su turno desde el celular.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Datos de la clínica</h3>
          <p className="text-sm text-gray-500 mb-4">Estos datos se muestran en tu página pública</p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-24">Nombre:</span>
              <span className="text-gray-600">{tenant?.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-24">Teléfono:</span>
              <span className="text-gray-600">{tenant?.phone || '—'}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-gray-700 w-24">Dirección:</span>
              <span className="text-gray-600">{tenant?.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
