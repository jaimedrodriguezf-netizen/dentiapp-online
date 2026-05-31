'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, X, Edit2, Pill } from 'lucide-react'
import PrescriptionManager from './PrescriptionManager'

interface Props {
  slug: string
  recordId: string
  hasPrescriptions: boolean
  variant?: 'default' | 'cta' | 'icon-only' | 'mobile'
}

export default function PrescriptionModalButton({ slug, recordId, hasPrescriptions, variant = 'default' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleOpen() {
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
    router.refresh() // Refresh the parent server component to pull down updated prescriptions
  }

  return (
    <>
      {/* TRIGGER BUTTONS BY VARIANT */}
      {variant === 'default' && (
        <button
          onClick={handleOpen}
          className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
        >
          {hasPrescriptions ? (
            <>
              <Edit2 className="w-4 h-4 text-blue-600" />
              Modificar Receta
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-blue-600" />
              Crear Recetario
            </>
          )}
        </button>
      )}

      {variant === 'cta' && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black uppercase text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Crear Receta Médica
        </button>
      )}

      {variant === 'icon-only' && (
        <button
          onClick={handleOpen}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
          title="Editar Receta"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleOpen}
          className="flex-1 btn btn-neutral rounded-2xl h-14 font-black shadow-xl"
        >
          <Pill className="w-5 h-5 text-blue-400" />
          CREAR RECETA
        </button>
      )}

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-[32px] shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 z-10">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Administrar Receta Médica
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Agregá medicamentos, dosis e indicaciones de consumo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prescription Manager */}
              <div className="pb-2">
                <PrescriptionManager
                  slug={slug}
                  recordId={recordId}
                  onSaveSuccess={() => {
                    // We don't automatically close so they see the success banner,
                    // but we can refresh background state.
                    router.refresh()
                  }}
                />
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-black rounded-2xl transition-all active:scale-95 uppercase tracking-wider"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
