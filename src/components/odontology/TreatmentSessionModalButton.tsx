'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Calendar, ClipboardList, Stethoscope, Pill, Save } from 'lucide-react'
import { addTreatmentSession } from '@/app/(tenant)/[slug]/odontology/actions'
import CIESearch from './CIESearch'
import VademecumSearch from './VademecumSearch'
import InteractiveToothSelector from './InteractiveToothSelector'

interface TreatmentSessionModalButtonProps {
  slug: string
  recordId: string
  nextSessionNumber: number
}

export default function TreatmentSessionModalButton({
  slug,
  recordId,
  nextSessionNumber,
}: TreatmentSessionModalButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form states
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [procedures, setProcedures] = useState('')
  const [cieSelection, setCieSelection] = useState<{ code: string; desc: string } | null>(null)
  const [diagTooth, setDiagTooth] = useState<number | number[] | null>(null)
  const [diagSurfaces, setDiagSurfaces] = useState<string[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [vademecumSelection, setVademecumSelection] = useState<string | null>(null)
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('')
  const [signature, setSignature] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleOpen = () => {
    setSessionDate(new Date().toISOString().split('T')[0])
    setProcedures('')
    setCieSelection(null)
    setDiagTooth(null)
    setDiagSurfaces([])
    setAdditionalNotes('')
    setVademecumSelection(null)
    setPrescriptionInstructions('')
    setSignature('')
    setErrorMessage('')
    setIsOpen(true)
  }

  const handleClose = () => {
    if (isPending) return
    setIsOpen(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!procedures.trim()) {
      setErrorMessage(
        'El campo "Tratamientos / Procedimientos Realizados" es estrictamente obligatorio para registrar la evolución.'
      )
      return
    }

    const toothInfo = diagTooth
      ? `[Pieza ${Array.isArray(diagTooth) ? diagTooth.join(', ') : diagTooth}${diagSurfaces.length > 0 ? ` - Caras: ${diagSurfaces.join(', ')}` : ''}]`
      : ''

    const finalDiagnosis = cieSelection
      ? `${cieSelection.code} - ${cieSelection.desc}${toothInfo ? ` ${toothInfo}` : ''}${additionalNotes.trim() ? `. Notas: ${additionalNotes.trim()}` : ''}`
      : `${toothInfo ? `Diagnóstico en ${toothInfo}. ` : ''}${additionalNotes.trim()}`

    const finalPrescription = vademecumSelection
      ? `${vademecumSelection}${prescriptionInstructions.trim() ? `. Indicaciones: ${prescriptionInstructions.trim()}` : ''}`
      : prescriptionInstructions.trim()

    startTransition(async () => {
      const res = await addTreatmentSession(slug, recordId, {
        session_number: nextSessionNumber,
        session_date: sessionDate,
        procedures: procedures.trim(),
        diagnoses_complications: finalDiagnosis,
        prescriptions: finalPrescription,
        signature: signature.trim(),
      })

      if (res && 'error' in res) {
        setErrorMessage(res.error)
      } else {
        router.refresh()
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer select-none active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Registrar Evolución
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="bg-white rounded-[32px] border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Nueva Sesión de Evolución
                  </h3>
                  <span className="inline-block mt-0.5 text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100">
                    Sesión Nº {nextSessionNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Fecha de la Sesión <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                  disabled={isPending}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Treatment / Procedures (REQUIRED) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                  Tratamientos / Procedimientos Realizados <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={procedures}
                  onChange={(e) => setProcedures(e.target.value)}
                  placeholder="Ej: Restauración con resina compuesta fotocurable en pieza 46. Pulido y control..."
                  rows={3}
                  disabled={isPending}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Diagnósticos y Complicaciones (CIE-10) */}
              <div className="space-y-2 bg-gray-50/40 p-4 rounded-[20px] border border-gray-100 shadow-sm">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                  Diagnóstico Clínico (CIE-10)
                </label>
                <CIESearch
                  onSelect={(code, desc) => setCieSelection({ code, desc })}
                  onClear={() => setCieSelection(null)}
                />
                {cieSelection && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] font-black text-blue-600 block uppercase">Código Seleccionado:</span>
                      <span className="text-xs font-bold text-blue-950 block truncate">{cieSelection.code} - {cieSelection.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCieSelection(null)}
                      className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {/* Anatomía interactiva en el modal */}
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
                    Pieza y Caras Afectadas (Opcional)
                  </label>
                  <InteractiveToothSelector
                    initialTooth={diagTooth}
                    initialSurfaces={diagSurfaces}
                    onChange={(teeth, surfaces) => {
                      setDiagTooth(teeth)
                      setDiagSurfaces(surfaces)
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                    Complicaciones / Notas adicionales
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Ej: Paciente presenta ligera sensibilidad al frío..."
                    rows={2}
                    disabled={isPending}
                    className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-2 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Recetas / Medicación (Vademécum) */}
              <div className="space-y-2 bg-gray-50/40 p-4 rounded-[20px] border border-gray-100 shadow-sm">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                  <Pill className="w-3.5 h-3.5 text-purple-500" />
                  Prescripciones / Vademécum
                </label>
                <VademecumSearch
                  onSelect={(_, name) => setVademecumSelection(name)}
                  defaultValue={vademecumSelection || undefined}
                />
                {vademecumSelection && (
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] font-black text-purple-600 block uppercase">Medicación Seleccionada:</span>
                      <span className="text-xs font-bold text-purple-950 block truncate">{vademecumSelection}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVademecumSelection(null)}
                      className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block ml-1">
                    Indicaciones de Dosificación
                  </label>
                  <input
                    type="text"
                    value={prescriptionInstructions}
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    placeholder="Ej: Ibuprofeno 600mg cada 8 horas por 3 días."
                    disabled={isPending}
                    className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Signature / Doctor Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nombre del Odontólogo Firmante (Opcional)
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Ej: Dra. Valentina Rivas"
                  disabled={isPending}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isPending ? 'Guardando...' : 'Guardar Evolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
