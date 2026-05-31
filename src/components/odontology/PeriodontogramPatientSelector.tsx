'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ClipboardList, ArrowRight } from 'lucide-react'

interface PatientItem {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

interface Props {
  patients: PatientItem[]
  slug: string
}

export default function PeriodontogramPatientSelector({ patients, slug }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = patients.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase()
    const cedula = (p.cedula || '').toLowerCase()
    const query = searchTerm.toLowerCase()
    return name.includes(query) || cedula.includes(query)
  })

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Periodontogramas</h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Seleccioná un paciente para cargar o crear su periodontograma</p>
      </div>

      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Buscador de Pacientes</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Filtrá por nombre, apellido o cédula de identidad</p>
          </div>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 pl-11 pr-5 py-2.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-50">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-wider text-left border-b border-gray-100">
                  <th className="p-4 pl-6">Nombre del Paciente</th>
                  <th className="p-4">Identificación</th>
                  <th className="p-4 pr-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50 font-medium text-xs text-gray-700">
                    <td className="p-4 pl-6">
                      <strong className="text-gray-900 font-black text-sm uppercase tracking-tight block">
                        {p.last_name} {p.first_name}
                      </strong>
                    </td>
                    <td className="p-4 font-bold text-gray-500">{p.cedula || '—'}</td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/${slug}/odontology/periodontogram?patientId=${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-650 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10 active:scale-97"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-white" />
                        Ver Periodontograma
                        <ArrowRight className="w-3 h-3 text-white" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 shadow-inner">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight">No se encontraron pacientes</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-sm mx-auto mt-1">
              Modificá la búsqueda o asegurate de registrar al paciente previamente en el panel de admisión.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
