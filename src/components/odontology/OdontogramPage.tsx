'use client'

import { useState } from 'react'
import { saveOdontogramTeeth } from '@/app/(tenant)/[slug]/odontology/actions'
import OdontogramEditor from '@/components/odontology/OdontogramEditor'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react'

interface ToothData {
  tooth_number: number
  status: string
  surfaces?: Record<string, string>
}

interface Props {
  recordId: string
  slug: string
  initialTeeth: ToothData[]
  recordPatientName: string
}

export default function OdontogramPage({ recordId, slug, initialTeeth, recordPatientName }: Props) {
  const [teeth, setTeeth] = useState<ToothData[]>(initialTeeth)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    setSaveError('')

    const result = await saveOdontogramTeeth(slug, recordId, teeth)

    if (result?.error) {
      setSaveError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header adaptable */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/odontology/form-033/${recordId}`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate max-w-[150px] md:max-w-none">Odontograma</h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{recordPatientName}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
            success ? 'bg-success text-white shadow-success/20' : 'bg-blue-600 text-white shadow-blue-500/20'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {success ? 'LISTO' : 'GUARDAR'}
        </button>
      </div>

      {saveError && (
        <div className="alert alert-error shadow-sm rounded-xl py-3 mx-4 md:mx-0">
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold">{saveError}</span>
        </div>
      )}

      {/* Odontogram Editor */}
      <OdontogramEditor initialTeeth={teeth} onTeethChange={setTeeth} />

      {/* Save button */}
      <div className="flex justify-center mx-4 md:mx-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
            success ? 'bg-success text-white shadow-success/20' : 'bg-blue-600 text-white shadow-blue-500/20'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {success ? 'LISTO' : 'GUARDAR'}
        </button>
      </div>
    </div>
  )
}
