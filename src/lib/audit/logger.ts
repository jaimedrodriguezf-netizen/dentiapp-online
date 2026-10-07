import { createClient } from '@/lib/supabase/server'

export interface LogAuditParams {
  tenantId: string
  action: 'create' | 'update' | 'delete' | 'view'
  resourceType: 'dental_record' | 'patient' | 'appointment' | 'prescription' | 'support_feedback'
  resourceId: string
  details?: Record<string, unknown>
}

/**
 * Registra un evento inmutable de auditoría médica en public.audit_logs
 * para trazabilidad legal y cumplimiento normativo.
 */
export async function logAuditEvent({
  tenantId,
  action,
  resourceType,
  resourceId,
  details = {},
}: LogAuditParams): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    await supabase.from('audit_logs').insert({
      tenant_id: tenantId,
      user_id: user?.id || null,
      user_email: user?.email || 'sistema@dentiapp.online',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    })
  } catch (err) {
    // Falla de auditoría no bloquea la operación médica del usuario, pero se reporta
    console.error('Audit log write failure:', err)
  }
}
