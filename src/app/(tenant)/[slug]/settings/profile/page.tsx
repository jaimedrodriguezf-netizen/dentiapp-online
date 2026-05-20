import { createClient } from '@/lib/supabase/server'
import { updateClinic } from '../actions'
import { APP_VERSION } from '@/lib/version'
import Link from 'next/link'
import { Users, Shield, QrCode, Crown, Info, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface TenantData {
  id: string
  name: string
  slug: string
  plan: 'standard' | 'business'
  phone: string | null
  email: string | null
  address: string | null
  whatsapp_number?: string | null
}

interface MembershipData {
  role: 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'
  tenant_id: string
}

export default async function ProfileSettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  const { data: tenantRaw } = await supabase
    .from('tenants')
    .select('id, name, slug, plan, phone, email, address, whatsapp_number')
    .eq('slug', slug)
    .single()

  if (!tenantRaw) return <div>Clínica no encontrada</div>

  const tenant: TenantData = {
    id: tenantRaw.id,
    name: tenantRaw.name,
    slug: tenantRaw.slug,
    plan: (tenantRaw.plan as 'standard' | 'business') || 'standard',
    phone: tenantRaw.phone,
    email: tenantRaw.email,
    address: tenantRaw.address,
    whatsapp_number: (tenantRaw as { whatsapp_number?: string }).whatsapp_number
  }

  // Obtener membresía para saber el rol
  const { data: membershipRaw } = await supabase
    .from('tenant_members')
    .select('role, tenant_id')
    .eq('user_id', user?.id)
    .eq('tenant_id', tenant.id)
    .single()
  
  const role = (membershipRaw?.role as MembershipData['role']) || 'doctor'
  const plan = tenant.plan
  const isBusiness = plan === 'business'
  
  // El Doctor SI puede editar sus datos y los de la clínica
  const canEditClinic = role === 'admin' || role === 'supervisor' || role === 'doctor'
  // Pero solo Admin/Supervisor ven herramientas de EQUIPO/PERMISOS
  const isBoss = role === 'admin' || role === 'supervisor'

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-500 mt-1">Administrá tu cuenta y los datos de tu clínica</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${
          isBusiness 
            ? 'bg-purple-50 border-purple-100 text-purple-700' 
            : 'bg-blue-50 border-blue-100 text-blue-700'
        }`}>
          {isBusiness ? <Crown className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          <span className="text-sm font-bold uppercase tracking-wider">Plan {plan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Clinic info */}
          <div className="card bg-white border border-gray-200 shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Datos de la Clínica</h3>
                  <p className="text-xs text-gray-500">Información pública y de contacto</p>
                </div>
              </div>

              <form action={async (fd: FormData) => {
                'use server'
                await updateClinic(slug, fd)
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nombre Comercial</label>
                  <input
                    type="text" name="name" required
                    defaultValue={tenant.name}
                    disabled={!canEditClinic}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Teléfono</label>
                    <input
                      type="tel" name="phone"
                      defaultValue={tenant.phone || ''}
                      disabled={!canEditClinic}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Público</label>
                    <input
                      type="email" name="email"
                      defaultValue={tenant.email || ''}
                      disabled={!canEditClinic}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">WhatsApp (para landing page)</label>
                  <input
                    type="tel" name="whatsapp_number"
                    defaultValue={tenant.whatsapp_number || ''}
                    disabled={!canEditClinic}
                    placeholder="+593 9..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Dirección Física</label>
                  <textarea
                    name="address" rows={2}
                    defaultValue={tenant.address || ''}
                    disabled={!canEditClinic}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-60"
                  />
                </div>

                {canEditClinic && (
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    Guardar Cambios
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* User info */}
          <div className="card bg-white border border-gray-200 shadow-sm">
            <div className="card-body p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tu Perfil</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{(user?.user_metadata as { name?: string } | null)?.name || 'Usuario DentiApp'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="badge badge-outline border-gray-200 text-gray-500 px-4 py-3 rounded-xl font-medium">
                Rol: <span className="text-gray-900 ml-1 capitalize">{role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Clinic Management - Visible for Doctor, Supervisor and Admin */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Gestión de Clínica</h4>
            
            <Link
              href={`/${slug}/settings/landing-page`}
              className="group block p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Landing Page</p>
                  <p className="text-xs text-gray-500">QR y página pública</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/${slug}/settings/operating-hours`}
              className="group block p-4 bg-white border border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Horarios</p>
                  <p className="text-xs text-gray-500">Días y horas de atención</p>
                </div>
              </div>
            </Link>

            {isBoss ? (
              <>
                {isBusiness ? (
                  <>
                    <Link
                      href={`/${slug}/settings/team`}
                      className="group block p-4 bg-white border border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Equipo</p>
                          <p className="text-xs text-gray-500">Gestioná tus especialistas</p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      href={`/${slug}/settings/permissions`}
                      className="group block p-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Permisos</p>
                          <p className="text-xs text-gray-500">Control de acceso avanzado</p>
                        </div>
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
                    <Crown className="w-8 h-8 mb-4 text-yellow-400 fill-yellow-400" />
                    <h5 className="text-lg font-black mb-2 leading-tight">¿Necesitás trabajar en equipo?</h5>
                    <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
                      Pasate al <strong>Plan Business</strong> para invitar a otros especialistas.
                    </p>
                    <button className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors active:scale-95">
                      Mejorar Plan
                    </button>
                  </div>
                )}
              </>
            ) : (
               <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl">
                 <Info className="w-6 h-6 text-blue-500 mb-3" />
                 <p className="text-sm text-blue-800 leading-relaxed font-medium">
                   Como <strong>{role}</strong>, tenés acceso a tu perfil y landing page, pero no podés gestionar el equipo médico.
                 </p>
               </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold">DentiApp Online v{APP_VERSION}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
