import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportFeedbackListClient from './SupportFeedbackListClient'
import SupportFeedbackPageForm from './SupportFeedbackPageForm'
import { SupportFeedback } from '@/types/support'
import { HelpCircle } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface FeedbackWithUrl extends SupportFeedback {
  screenshotUrl: string | null
}

export default async function SupportSettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    redirect('/login')
  }

  // Obtener membresía para saber el rol y tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 font-bold">
        No tenés membresía activa en este tenant para ver la configuración de soporte.
      </div>
    )
  }

  // Solo admins, supervisors y doctors pueden acceder a la gestión de soporte
  const allowedRoles = ['admin', 'supervisor', 'doctor']
  if (!allowedRoles.includes(membership.role)) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8 pb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Soporte Clínico</h2>
          </div>
          <p className="text-gray-500 mt-1">
            Reportá cualquier error, bug o sugerencia sobre la aplicación.
          </p>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <SupportFeedbackPageForm slug={slug} userRole={membership.role} />
        </div>
      </div>
    )
  }

  // Consultar todos los feedbacks de este tenant
  const { data: feedbacksRaw, error } = await supabase
    .from('support_feedbacks')
    .select('*')
    .eq('tenant_id', membership.tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support feedbacks:', error)
  }

  const rawList = (feedbacksRaw || []) as SupportFeedback[]

  // Mapear feedbacks para inyectar la URL pública del storage si aplica
  const feedbacksWithUrls: FeedbackWithUrl[] = rawList.map(f => {
    let url: string | null = null
    if (f.screenshot_path) {
      url = supabase.storage
        .from('support_screenshots')
        .getPublicUrl(f.screenshot_path).data.publicUrl
    }
    return {
      ...f,
      screenshotUrl: url
    }
  })

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Soporte Clínico</h2>
          </div>
          <p className="text-gray-500 mt-1">
            Revisá y gestioná los reportes de bugs, mejoras y comentarios enviados por los usuarios.
          </p>
        </div>
      </div>

      <SupportFeedbackListClient initialFeedbacks={feedbacksWithUrls} slug={slug} />
    </div>
  )
}
