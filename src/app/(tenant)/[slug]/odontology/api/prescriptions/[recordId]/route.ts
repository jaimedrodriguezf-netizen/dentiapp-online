import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('dental_record_id', recordId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  const { recordId } = await params
  const supabase = await createClient()
  const { items } = await request.json() as { items: PrescriptionItem[] }

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
  }

  // Delete existing ones for this record (simple sync for now)
  const { error: deleteError } = await supabase
    .from('prescriptions')
    .delete()
    .eq('dental_record_id', recordId)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  // Insert new ones
  const { error: insertError } = await supabase
    .from('prescriptions')
    .insert(
      items.map((item) => ({
        dental_record_id: recordId,
        medication_id: item.medication_id,
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
