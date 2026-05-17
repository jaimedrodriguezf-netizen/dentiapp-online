import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Props {
  params: Promise<{ slug: string; recordId: string }>
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { slug, recordId } = await params
  const supabase = await createClient()

  // Get tenant_id
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Clínica no encontrada' }, { status: 404 })
  }

  const { data } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenant.id)
    .order('created_at')

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest, { params }: Props) {
  const { slug, recordId } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Clínica no encontrada' }, { status: 404 })
  }

  const body = await req.json()
  const items: any[] = body.items ?? []

  // Delete existing and re-insert
  await supabase
    .from('prescriptions')
    .delete()
    .eq('dental_record_id', recordId)
    .eq('tenant_id', tenant.id)

  if (items.length === 0) {
    return NextResponse.json({ success: true })
  }

  const { error } = await supabase.from('prescriptions').insert(
    items.map((item: any) => ({
      dental_record_id: recordId,
      tenant_id: tenant.id,
      medication_id: item.medication_id || null,
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
      quantity: item.quantity,
    }))
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
