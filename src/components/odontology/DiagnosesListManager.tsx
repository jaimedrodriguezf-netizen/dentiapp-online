'use client'

import { useState, useEffect } from 'react'
import CIESearch from './CIESearch'
import InteractiveToothSelector from './InteractiveToothSelector'
import { Plus, Trash2, Stethoscope, AlertCircle } from 'lucide-react'

export interface DiagnosisData {
  code?: string
  description?: string
  text?: string
  type?: string
  pieza_dental?: number | number[] | null
  caras_afectadas?: string[]
}

interface DiagnosesListManagerProps {
  initialDiagnoses?: DiagnosisData | DiagnosisData[] | null
  onChange?: (list: DiagnosisData[]) => void
}

export default function DiagnosesListManager({
  initialDiagnoses = null,
  onChange,
}: DiagnosesListManagerProps) {
  // Parse initial state
  const getParsedInitial = (): DiagnosisData[] => {
    if (!initialDiagnoses) return []
    if (Array.isArray(initialDiagnoses)) return initialDiagnoses
    return [initialDiagnoses]
  }

  const [diagnoses, setDiagnoses] = useState<DiagnosisData[]>(getParsedInitial())

  // Current entry states
  const [cieSelection, setCieSelection] = useState<{ code: string; desc: string }>({ code: '', desc: '' })
  const [diagType, setDiagType] = useState<string>('')
  const [diagTooth, setDiagTooth] = useState<number | number[] | null>(null)
  const [diagSurfaces, setDiagSurfaces] = useState<string[]>([])
  const [diagNotes, setDiagNotes] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false)

  // Sincronizar cambios iniciales si cambian por carga asíncrona
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDiagnoses(getParsedInitial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDiagnoses])

  // Clear validation error on any input change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValidationError('')
  }, [cieSelection, diagType, diagTooth, diagSurfaces, diagNotes])

  // Interceptar el envío del formulario padre para obligar a agregar el diagnóstico y no dejar campos a medias
  useEffect(() => {
    const inputEl = document.querySelector('input[name="diagnoses_json"]')
    const form = inputEl?.closest('form')
    if (!form) return

    const handleFormSubmit = (event: SubmitEvent) => {
      const hasSomeInput = !!(
        cieSelection.code ||
        diagType ||
        diagTooth !== null ||
        diagSurfaces.length > 0 ||
        diagNotes.trim()
      )

      if (hasSomeInput) {
        event.preventDefault()
        event.stopPropagation()
        setValidationError(
          '¡Tenés un diagnóstico a medio completar en el panel! Hacé clic en "Añadir Diagnóstico a la Lista" o limpiá los campos antes de guardar la ficha.'
        )
        setShowValidationErrors(true)
        const managerEl = inputEl?.closest('.space-y-8')
        managerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }

      if (diagnoses.length === 0) {
        event.preventDefault()
        event.stopPropagation()
        setValidationError(
          '¡Debés agregar al menos un diagnóstico completo a la lista antes de poder guardar la ficha clínica!'
        )
        setShowValidationErrors(true)
        const managerEl = inputEl?.closest('.space-y-8')
        managerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }

    form.addEventListener('submit', handleFormSubmit)
    return () => {
      form.removeEventListener('submit', handleFormSubmit)
    }
  }, [diagnoses, cieSelection, diagType, diagTooth, diagSurfaces, diagNotes])

  const handleAddDiagnosis = () => {
    setValidationError('')
    setShowValidationErrors(false)

    const hasTeeth = diagTooth !== null && (Array.isArray(diagTooth) ? diagTooth.length > 0 : true)
    const hasSurfaces = diagSurfaces.length > 0

    if (!cieSelection.code) {
      setValidationError('Falta el código CIE-10. Buscá y seleccioná un diagnóstico válido en la barra superior.')
      setShowValidationErrors(true)
      return
    }

    if (!diagType) {
      setValidationError('Falta el Tipo de Diagnóstico. Elegí entre Presuntivo o Definitivo.')
      setShowValidationErrors(true)
      return
    }

    if (!hasTeeth) {
      setValidationError('Falta la Pieza Dental. Hacé clic en al menos una pieza en el odontograma superior.')
      setShowValidationErrors(true)
      return
    }

    if (!hasSurfaces) {
      setValidationError('Faltan las Caras Afectadas. Hacé clic en al menos una cara del diente interactivo en pantalla.')
      setShowValidationErrors(true)
      return
    }

    if (!diagNotes.trim()) {
      setValidationError('Falta el Comentario Clínico. Escribí una nota u observación obligatoria sobre la pieza.')
      setShowValidationErrors(true)
      return
    }

    const newDiagnosis: DiagnosisData = {
      code: cieSelection.code,
      description: cieSelection.desc,
      type: diagType,
      pieza_dental: diagTooth,
      caras_afectadas: diagSurfaces,
      text: diagNotes.trim(),
    }

    const nextList = [...diagnoses, newDiagnosis]
    setDiagnoses(nextList)
    if (onChange) onChange(nextList)

    // Reset current input fields for the next entry
    setCieSelection({ code: '', desc: '' })
    setDiagType('')
    setDiagTooth(null)
    setDiagSurfaces([])
    setDiagNotes('')
    setValidationError('')
    setShowValidationErrors(false)
  }

  const handleRemoveDiagnosis = (index: number) => {
    const nextList = diagnoses.filter((_, i) => i !== index)
    setDiagnoses(nextList)
    if (onChange) onChange(nextList)
  }

  const hasTeeth = diagTooth !== null && (Array.isArray(diagTooth) ? diagTooth.length > 0 : true)
  const hasSurfaces = diagSurfaces.length > 0

  return (
    <div className="space-y-8">
      {/* Hidden serialization input for FormData submission */}
      <input type="hidden" name="diagnoses_json" value={JSON.stringify(diagnoses)} />

      {/* Legacy single-entry fallbacks for absolute database safety */}
      {diagnoses.length > 0 ? (
        <>
          <input type="hidden" name="diagnosis_code" value={diagnoses[0].code || ''} />
          <input type="hidden" name="diagnosis_description" value={diagnoses[0].description || ''} />
          <input type="hidden" name="diagnosis_type" value={diagnoses[0].type || ''} />
          <input type="hidden" name="diagnosis_notes" value={diagnoses[0].text || ''} />
          {Array.isArray(diagnoses[0].pieza_dental) ? (
            (diagnoses[0].pieza_dental as number[]).map((t) => (
              <input type="hidden" name="diagnosis_teeth" key={t} value={t} />
            ))
          ) : (
            diagnoses[0].pieza_dental && (
              <input type="hidden" name="diagnosis_tooth" value={diagnoses[0].pieza_dental} />
            )
          )}
          {diagnoses[0].caras_afectadas?.map((s) => (
            <input type="hidden" name="diagnosis_surfaces" key={s} value={s} />
          ))}
        </>
      ) : (
        <>
          <input type="hidden" name="diagnosis_code" value="" />
          <input type="hidden" name="diagnosis_description" value="" />
        </>
      )}

      {/* INPUT PANEL FOR ADDING DIAGNOSIS */}
      <div className="bg-gray-50/40 border border-gray-100 p-5 md:p-6 rounded-[28px] space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Stethoscope className="w-5 h-5 text-blue-500" />
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
            Agregar Diagnóstico Individual
          </h4>
        </div>

        {/* CIESearch Selector */}
        <div className={`p-4 rounded-2xl border transition-all shadow-sm space-y-4 ${
          showValidationErrors && !cieSelection.code ? 'border-red-400 bg-red-50/10' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
              Buscar código o descripción CIE-10 <span className="text-red-500">*</span>
            </label>
            {showValidationErrors && !cieSelection.code && (
              <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">¡Requerido!</span>
            )}
          </div>
          <CIESearch
            onSelect={(code, desc) => setCieSelection({ code, desc })}
          />
          {cieSelection.code && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <div>
                <span className="text-[9px] font-black text-blue-600 block uppercase">Código Seleccionado:</span>
                <span className="text-xs font-bold text-blue-950">{cieSelection.code} - {cieSelection.desc}</span>
              </div>
              <button
                type="button"
                onClick={() => setCieSelection({ code: '', desc: '' })}
                className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer transition-colors"
              >
                Remover
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de diagnóstico */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm space-y-2 ${
            showValidationErrors && !diagType ? 'border-red-400 bg-red-50/10' : 'border-gray-100 bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                Tipo de Diagnóstico <span className="text-red-500">*</span>
              </label>
              {showValidationErrors && !diagType && (
                <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">¡Requerido!</span>
              )}
            </div>
            <select
              value={diagType}
              onChange={(e) => setDiagType(e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none transition-all ${
                showValidationErrors && !diagType ? 'border-red-300 bg-red-50/20 focus:border-red-500' : 'border-gray-100 bg-gray-50/30 focus:border-blue-500'
              }`}
            >
              <option value="">Seleccioná...</option>
              <option value="presuntivo">Presuntivo</option>
              <option value="definitivo">Definitivo</option>
            </select>
          </div>

          {/* Comment input */}
          <div className={`p-4 rounded-2xl border transition-all shadow-sm space-y-2 ${
            showValidationErrors && !diagNotes.trim() ? 'border-red-400 bg-red-50/10' : 'border-gray-100 bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                Comentario clínico / Nota adicional <span className="text-red-500">*</span>
              </label>
              {showValidationErrors && !diagNotes.trim() && (
                <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">¡Requerido!</span>
              )}
            </div>
            <input
              type="text"
              value={diagNotes}
              onChange={(e) => setDiagNotes(e.target.value)}
              placeholder="Ej: Afecta profundamente el esmalte, dolor al frío..."
              className={`w-full rounded-xl border-2 px-4 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none transition-all ${
                showValidationErrors && !diagNotes.trim() ? 'border-red-300 bg-red-50/20 focus:border-red-500' : 'border-gray-100 bg-gray-50/30 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Anatomía interactiva */}
        <div className={`p-4 md:p-6 rounded-[24px] border transition-all shadow-sm space-y-4 ${
          showValidationErrors && (!hasTeeth || !hasSurfaces) ? 'border-red-400 bg-red-50/10' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
              Anatomía Dental (Pieza y Caras Afectadas) <span className="text-red-500">*</span>
            </label>
            {showValidationErrors && (!hasTeeth || !hasSurfaces) && (
              <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
                {!hasTeeth && !hasSurfaces ? '¡Falta pieza y caras!' : !hasTeeth ? '¡Falta pieza!' : '¡Falta seleccionar caras!'}
              </span>
            )}
          </div>
          <InteractiveToothSelector
            initialTooth={diagTooth}
            initialSurfaces={diagSurfaces}
            onChange={(teeth, surfaces) => {
              setDiagTooth(teeth)
              setDiagSurfaces(surfaces)
            }}
          />
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* BUTTON: ADD DIAGNOSIS */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAddDiagnosis}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer select-none active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Añadir Diagnóstico a la Lista
          </button>
        </div>
      </div>

      {/* DYNAMIC LIST OF ADDED DIAGNOSES */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
          Lista de Diagnósticos Agregados ({diagnoses.length})
        </label>

        {diagnoses.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {diagnoses.map((item, index) => {
              const toothInfo = item.pieza_dental
              const isArrayTooth = Array.isArray(toothInfo)
              const hasTooth = toothInfo !== null && toothInfo !== undefined

              return (
                <div
                  key={index}
                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex-1 space-y-2">
                    {/* Tags block */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.code && (
                        <span className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-blue-200">
                          {item.code}
                        </span>
                      )}
                      {item.type && (
                        <span className="inline-flex items-center rounded-lg bg-gray-150 px-2 py-0.5 text-[9px] font-black text-gray-600 uppercase tracking-wider">
                          {item.type}
                        </span>
                      )}
                      {item.description && (
                        <span className="text-xs font-black text-gray-800">
                          {item.description}
                        </span>
                      )}
                      {hasTooth && (
                        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 uppercase tracking-wider border border-blue-100">
                          {isArrayTooth
                            ? `Piezas: ${(toothInfo as number[]).join(', ')}`
                            : `Pieza ${toothInfo}`}
                        </span>
                      )}
                      {item.caras_afectadas && item.caras_afectadas.length > 0 && (
                        <span className="inline-flex items-center rounded-lg bg-purple-50 px-2 py-0.5 text-[9px] font-black text-purple-700 uppercase tracking-wider border border-purple-100">
                          Caras: {item.caras_afectadas.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* notes block */}
                    {item.text && (
                      <p className="text-xs text-gray-600 italic whitespace-pre-wrap pl-1 border-l-2 border-gray-200">
                        {item.text}
                      </p>
                    )}
                  </div>

                  {/* Remove action button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDiagnosis(index)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer transition-all active:scale-90"
                    title="Remover este diagnóstico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-[28px] text-center space-y-2 shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <h5 className="text-xs font-black text-gray-800 uppercase tracking-wider">
              No hay diagnósticos cargados
            </h5>
            <p className="text-[10px] text-gray-500 max-w-sm">
              Completá el buscador CIE-10, definí el tipo, seleccioná las piezas en el odontograma interactivo, colocá un comentario y hacé clic en **&quot;Añadir Diagnóstico&quot;** para agregarlo a la lista de la ficha.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
