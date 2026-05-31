'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { FeedbackType, FeedbackContext, SupportFeedback } from '@/types/support'

// Auxiliar para verificar membresía y obtener tenant_id
async function getTenantMembership(supabase: SupabaseClient) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) throw new Error('Usuario no autenticado')

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership) throw new Error('No tenés membresía para este tenant')
  return { tenantId: membership.tenant_id, role: membership.role }
}

// Crear un reporte de soporte
export async function createSupportFeedback(
  slug: string,
  type: FeedbackType,
  message: string,
  context: FeedbackContext,
  screenshotBase64: string | null
) {
  const supabase = await createClient()
  const { tenantId } = await getTenantMembership(supabase)

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  const userEmail = user?.email || 'anonimo@dentiapp.online'
  const userId = user?.id || null

  let screenshotPath: string | null = null

  // Si se adjunta una captura en Base64, la decodificamos y subimos al bucket
  if (screenshotBase64) {
    try {
      const base64Data = screenshotBase64.split(',')[1] || screenshotBase64
      const buffer = Buffer.from(base64Data, 'base64')
      
      const fileName = `${tenantId}/${Date.now()}_screenshot.png`
      const { error: uploadError } = await supabase.storage
        .from('support_screenshots')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        console.error('Error uploading screenshot to Supabase Storage:', uploadError)
      } else {
        screenshotPath = fileName
      }
    } catch (err) {
      console.error('Failed to parse or upload screenshot buffer:', err)
    }
  }

  const { data, error } = await supabase
    .from('support_feedbacks')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      user_email: userEmail,
      type,
      message,
      context: context as unknown as Record<string, unknown>,
      screenshot_path: screenshotPath,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting support feedback:', error)
    throw new Error(`Error al registrar el reporte de soporte: ${error.message}`)
  }

  revalidatePath(`/${slug}/settings/support`)
  return data as unknown as SupportFeedback
}

// Resolver un reporte de soporte (Eliminando captura del Storage para ahorrar espacio)
export async function resolveSupportFeedback(slug: string, feedbackId: string) {
  const supabase = await createClient()
  const { tenantId } = await getTenantMembership(supabase)

  // 1. Consultar el feedback actual para obtener la ruta de la captura
  const { data: feedback, error: fetchError } = await supabase
    .from('support_feedbacks')
    .select('id, screenshot_path')
    .eq('id', feedbackId)
    .eq('tenant_id', tenantId)
    .single()

  if (fetchError || !feedback) {
    throw new Error('Reporte de soporte no encontrado')
  }

  const rawFeedback = feedback as unknown as SupportFeedback

  // 2. Si hay captura de pantalla en el Storage, la eliminamos físicamente de inmediato
  if (rawFeedback.screenshot_path) {
    const { error: deleteStorageError } = await supabase.storage
      .from('support_screenshots')
      .remove([rawFeedback.screenshot_path])

    if (deleteStorageError) {
      console.error('Error deleting screenshot from storage:', deleteStorageError)
    }
  }

  // 3. Actualizamos el registro de base de datos a 'resolved' y limpiamos el path
  const { error: updateError } = await supabase
    .from('support_feedbacks')
    .update({
      status: 'resolved',
      screenshot_path: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', feedbackId)
    .eq('tenant_id', tenantId)

  if (updateError) {
    console.error('Error updating feedback to resolved:', updateError)
    throw new Error(`Error al resolver el reporte: ${updateError.message}`)
  }

  revalidatePath(`/${slug}/settings/support`)
  return true
}

// Obtener feedbacks pendientes para diagnóstico por IA
export async function getFeedbacksForAI() {
  const supabase = await createClient()
  const { tenantId } = await getTenantMembership(supabase)

  const { data, error } = await supabase
    .from('support_feedbacks')
    .select('id, type, message, context, status, ai_diagnosis, created_at')
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'diagnosed'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedbacks for AI:', error)
    return []
  }

  return (data || []) as unknown as Partial<SupportFeedback>[]
}

// Guardar diagnóstico técnico de la IA en la base de datos
export async function saveAIDiagnosis(feedbackId: string, diagnosisText: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('support_feedbacks')
    .update({
      ai_diagnosis: diagnosisText,
      status: 'diagnosed',
      updated_at: new Date().toISOString()
    })
    .eq('id', feedbackId)

  if (error) {
    console.error('Error saving AI diagnosis:', error)
    throw new Error(`Error al guardar el diagnóstico de IA: ${error.message}`)
  }

  return true
}
