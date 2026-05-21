import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import QRCodeDisplay from '@/components/ui/QRCodeDisplay'
import { QrCode, ExternalLink, Info, MapPin, Phone, Globe, ArrowLeft } from 'lucide-react'
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
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-500 font-black uppercase tracking-widest">Clínica no encontrada</p>
      </div>
    )
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const clinicUrl = `${protocol}://${host}/${slug}`

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link href={`/${slug}/settings/profile`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Mi Clínica</h2>
          <p className="text-gray-500 font-medium">Presencia digital y acceso para pacientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* QR Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white border-2 border-gray-100 shadow-sm rounded-[32px] overflow-hidden">
            <div className="card-body p-8 items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Código QR</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-sm">
                Tus pacientes pueden escanear este código para agendar turnos al instante desde sus teléfonos.
              </p>
              
              <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 mb-8">
                <QRCodeDisplay url={clinicUrl} size={220} />
              </div>

              <div className="w-full space-y-3">
                <Link 
                  href={`/${slug}`} 
                  target="_blank" 
                  className="w-full btn btn-primary rounded-2xl font-black shadow-lg shadow-blue-500/20 h-14"
                >
                  VER PÁGINA PÚBLICA
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                  {clinicUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="card bg-blue-600 text-white shadow-xl shadow-blue-500/20 rounded-[32px]">
            <div className="card-body p-8">
              <Info className="w-8 h-8 mb-4 opacity-50" />
              <h4 className="text-xl font-black uppercase leading-tight mb-4">¿Cómo usar el QR?</h4>
              <p className="text-blue-100 text-sm leading-relaxed font-medium">
                Imprimí este código y colócalo en la recepción de tu clínica o en tus tarjetas personales. Facilita el flujo de atención evitando llamadas telefónicas.
              </p>
            </div>
          </div>

          <div className="card bg-white border-2 border-gray-100 shadow-sm rounded-[32px]">
            <div className="card-body p-8 space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Vista Previa de Datos</h4>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Público</p>
                    <p className="text-sm font-bold text-gray-900">{tenant?.name}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono</p>
                    <p className="text-sm font-bold text-gray-900">{tenant?.phone || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{tenant?.address || 'No registrado'}</p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/${slug}/settings/profile`}
                className="btn btn-ghost btn-sm w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-gray-100"
              >
                Editar Datos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
