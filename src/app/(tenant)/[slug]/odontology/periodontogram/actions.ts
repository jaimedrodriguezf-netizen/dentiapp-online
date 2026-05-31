'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { PeriodontogramData, PeriodontogramRecord } from '@/types/periodontogram'

// Verificar membresía del tenant
async function getTenantMembership(supabase: SupabaseClient) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) throw new Error('Usuario no autenticado')

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) throw new Error('No tenés membresía para este tenant')
  return membership.tenant_id
}

// Guardar o actualizar un periodontograma
export async function savePeriodontogram(
  slug: string,
  patientId: string,
  dentalRecordId: string | null,
  examinationDate: string,
  notes: string | null,
  data: PeriodontogramData,
  periodontogramId?: string
) {
  const supabase = await createClient()
  const tenantId = await getTenantMembership(supabase)

  // Validaciones clínicas básicas en el servidor
  if (!patientId) throw new Error('El paciente es obligatorio')
  if (!examinationDate) throw new Error('La fecha de examen es obligatoria')

  // Validar rangos numéricos de los puntos periodontales para prevenir corrupción
  Object.values(data.teeth).forEach((tooth) => {
    if (tooth.isMissing) return
    const pointGroups = [tooth.vestibular, tooth.lingual]
    pointGroups.forEach((group) => {
      const points = [group.distal, group.middle, group.mesial]
      points.forEach((pt) => {
        if (pt.margin !== null && (pt.margin < -10 || pt.margin > 10)) {
          throw new Error('El margen gingival debe estar entre -10 y 10 mm')
        }
        if (pt.depth !== null && (pt.depth < 0 || pt.depth > 15)) {
          throw new Error('La profundidad de sondaje debe estar entre 0 y 15 mm')
        }
      })
    })
  })

  const payload = {
    tenant_id: tenantId,
    patient_id: patientId,
    dental_record_id: dentalRecordId || null,
    examination_date: examinationDate,
    notes: notes || '',
    data: data as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString()
  }

  let query
  if (periodontogramId) {
    query = supabase
      .from('periodontograms')
      .update(payload)
      .eq('id', periodontogramId)
      .eq('tenant_id', tenantId)
  } else {
    query = supabase
      .from('periodontograms')
      .insert({
        ...payload,
        created_at: new Date().toISOString()
      })
  }

  const { data: record, error } = await query.select().single()

  if (error) {
    console.error('Error saving periodontogram:', error)
    throw new Error(`Error al guardar el periodontograma: ${error.message}`)
  }

  revalidatePath(`/${slug}/odontology/periodontogram`)
  return record as unknown as PeriodontogramRecord
}

// Obtener periodontogramas de un paciente
export async function getPeriodontogramsByPatient(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('periodontograms')
    .select('*')
    .eq('patient_id', patientId)
    .order('examination_date', { ascending: false })

  if (error) {
    console.error('Error fetching periodontograms:', error)
    return []
  }

  return (data || []) as unknown as PeriodontogramRecord[]
}

// Eliminar un periodontograma
export async function deletePeriodontogram(slug: string, id: string) {
  const supabase = await createClient()
  const tenantId = await getTenantMembership(supabase)

  const { error } = await supabase
    .from('periodontograms')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Error deleting periodontogram:', error)
    throw new Error(`Error al eliminar el periodontograma: ${error.message}`)
  }

  revalidatePath(`/${slug}/odontology/periodontogram`)
  return true
}
