import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupportFeedbackContainerClient from './SupportFeedbackContainerClient'
import { SupportFeedback } from '@/types/support'

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
        No tenés membresía activa en este consultorio para ver la configuración de soporte.
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

  // Inyectar URL pública para las capturas en Storage
  const feedbacksWithUrls: FeedbackWithUrl[] = rawList.map((f) => {
    let url: string | null = null
    if (f.screenshot_path) {
      url = supabase.storage
        .from('support_screenshots')
        .getPublicUrl(f.screenshot_path).data.publicUrl
    }
    return {
      ...f,
      screenshotUrl: url,
    }
  })

  return (
    <SupportFeedbackContainerClient
      initialFeedbacks={feedbacksWithUrls}
      slug={slug}
      userRole={membership.role}
    />
  )
}
