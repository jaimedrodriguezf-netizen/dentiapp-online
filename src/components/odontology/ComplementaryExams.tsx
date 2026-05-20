'use client'

import { useRef, useState } from 'react'

interface ComplementaryExamsProps {
  defaults?: {
    hematology?: string
    blood_chemistry?: string
    xray?: string
    other?: string
  }
}

export default function ComplementaryExams({ defaults }: ComplementaryExamsProps) {
  const [hematology, setHematology] = useState(defaults?.hematology || '')
  const [bloodChemistry, setBloodChemistry] = useState(defaults?.blood_chemistry || '')
  const [xray, setXray] = useState(defaults?.xray || '')
  const [other, setOther] = useState(defaults?.other || '')
  const hiddenRef = useRef<HTMLInputElement>(null)

  function updateHidden(hem: string, bc: string, xr: string, oth: string) {
    if (hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify({
        hematology: hem,
        blood_chemistry: bc,
        xray: xr,
        other: oth,
      })
    }
  }

  return (
    <div>
      <input type="hidden" ref={hiddenRef} name="complementary_exams" defaultValue={JSON.stringify({
        hematology: defaults?.hematology || '',
        blood_chemistry: defaults?.blood_chemistry || '',
        xray: defaults?.xray || '',
        other: defaults?.other || '',
      })} />
      <h3 className="text-sm font-black text-gray-900 mb-3">Exámenes complementarios</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Biometría hemática
          </label>
          <textarea
            value={hematology}
            onChange={(e) => {
              setHematology(e.target.value)
              updateHidden(e.target.value, bloodChemistry, xray, other)
            }}
            rows={3}
            placeholder="Resultados de biometría hemática..."
            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Química sanguínea
          </label>
          <textarea
            value={bloodChemistry}
            onChange={(e) => {
              setBloodChemistry(e.target.value)
              updateHidden(hematology, e.target.value, xray, other)
            }}
            rows={3}
            placeholder="Resultados de química sanguínea..."
            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Rayos X
          </label>
          <textarea
            value={xray}
            onChange={(e) => {
              setXray(e.target.value)
              updateHidden(hematology, bloodChemistry, e.target.value, other)
            }}
            rows={3}
            placeholder="Hallazgos en rayos X..."
            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Otros exámenes
          </label>
          <textarea
            value={other}
            onChange={(e) => {
              setOther(e.target.value)
              updateHidden(hematology, bloodChemistry, xray, e.target.value)
            }}
            rows={3}
            placeholder="Otros exámenes realizados..."
            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}
