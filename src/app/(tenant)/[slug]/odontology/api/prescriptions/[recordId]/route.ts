import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTenantId } from '../../../actions'

interface PrescriptionItem {
  id?: string
  medication_id?: string | null
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: number | null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; recordId: string }> }
) {
  const { slug, recordId } = await params
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)

  if (!tenantId) {
    return NextResponse.json({ error: 'No tienes una clínica activa' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; recordId: string }> }
) {
  const { slug, recordId } = await params
  const supabase = await createClient()
  const tenantId = await getTenantId(slug)

  if (!tenantId) {
    return NextResponse.json({ error: 'No tienes una clínica activa' }, { status: 400 })
  }

  const { items } = await request.json() as { items: PrescriptionItem[] }

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
  }

  // Delete existing ones for this record
  const { error: deleteError } = await supabase
    .from('prescriptions')
    .delete()
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenantId)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  if (items.length === 0) {
    return NextResponse.json({ success: true })
  }

  // Insert new ones with tenant_id
  const { error: insertError } = await supabase
    .from('prescriptions')
    .insert(
      items.map((item) => ({
        dental_record_id: recordId,
        tenant_id: tenantId,
        medication_id: item.medication_id || null,
        medication_name: item.medication_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
        quantity: item.quantity,
      }))
    )

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
