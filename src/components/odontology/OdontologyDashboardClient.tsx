'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, ArrowRight, UserPlus, Sparkles, ClipboardList } from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'

interface Patient {
  id: string
  first_name: string
  last_name: string
  cedula: string | null
}

interface RecordItem {
  id: string
  opening_date: string | null
  patients: Patient | null
}

interface Props {
  initialRecords: RecordItem[]
  slug: string
}

export default function OdontologyDashboardClient({ initialRecords, slug }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecords = initialRecords.filter((record) => {
    if (!record.patients) return false
    const name = `${record.patients.first_name} ${record.patients.last_name}`.toLowerCase()
    const cedula = (record.patients.cedula || '').toLowerCase()
    const query = searchTerm.toLowerCase()
    return name.includes(query) || cedula.includes(query)
  })

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Bento Grid Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estadísticas */}
        <div className="card bg-white border border-gray-200 shadow-sm p-6 rounded-3xl flex flex-row items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Expedientes Totales</span>
            <h3 className="text-3xl font-black text-gray-900">{initialRecords.length}</h3>
            <p className="text-xs text-gray-400 font-medium">Historias clínicas creadas</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Tooth className="w-7 h-7" />
          </div>
        </div>

        {/* Acceso Rápido a Crear Ficha */}
        <Link
          href={`/${slug}/admission/patients`}
          className="card bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all text-white p-6 rounded-3xl flex flex-row items-center justify-between group"
        >
          <div className="space-y-1.5">
            <h3 className="text-lg font-black uppercase tracking-tight leading-tight">Crear Expediente</h3>
            <p className="text-xs text-blue-100 font-medium opacity-90 leading-snug">Registrá un paciente nuevo para iniciar el Formulario 033.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-white/20">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
        </Link>

        {/* Acceso Rápido al Periodontograma */}
        <Link
          href={`/${slug}/odontology/periodontogram`}
          className="card bg-white border border-gray-200 hover:border-indigo-200 hover:-translate-y-0.5 transition-all p-6 rounded-3xl flex flex-row items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" /> Novedad
            </span>
            <h3 className="text-md font-black text-gray-900 uppercase tracking-tight">Periodontograma</h3>
            <p className="text-xs text-gray-500 font-medium">Mapeo clínico digital periodontal.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Buscador Interactivo de Pacientes */}
      <div className="card bg-white border border-gray-200 shadow-sm rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Buscador Clínico</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Localizá el Odontograma de cualquier paciente al instante</p>
          </div>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 pl-11 pr-5 py-3 text-xs font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Listado de Pacientes */}
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-wider text-left border-b border-gray-100">
                  <th className="p-4 pl-6">Paciente</th>
                  <th className="p-4">Identificación</th>
                  <th className="p-4">Última Atención</th>
                  <th className="p-4 pr-6 text-right">Acciones Clínicas</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const patient = record.patients
                  if (!patient) return null
                  let dateStr = '—'
                  if (record.opening_date) {
                    const date = new Date(record.opening_date)
                    const day = String(date.getDate()).padStart(2, '0')
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const year = date.getFullYear()
                    dateStr = `${day}/${month}/${year}`
                  }

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50 font-medium text-xs text-gray-700">
                      <td className="p-4 pl-6">
                        <strong className="text-gray-900 font-black text-sm uppercase tracking-tight block">
                          {patient.last_name} {patient.first_name}
                        </strong>
                      </td>
                      <td className="p-4 font-bold text-gray-500">{patient.cedula || '—'}</td>
                      <td className="p-4 font-bold text-gray-450">{dateStr}</td>
                      <td className="p-4 pr-6">
                        <div className="flex gap-2.5 justify-end">
                          {/* Botón Ficha 033 */}
                          <Link
                            href={`/${slug}/odontology/form-033/${record.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-white text-[10px] font-black uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver Ficha 033
                          </Link>

                          {/* Botón Odontograma */}
                          <Link
                            href={`/${slug}/odontology/odontogram/${record.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md shadow-purple-500/10 active:scale-97"
                          >
                            <Tooth className="w-3.5 h-3.5 text-white" />
                            Odontograma
                            <ArrowRight className="w-3 h-3 text-white" />
                          </Link>

                          {/* Botón Periodontograma */}
                          <Link
                            href={`/${slug}/odontology/periodontogram?patientId=${patient.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10 active:scale-97"
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-white" />
                            Periodontograma
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 shadow-inner">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
            </div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">No se encontraron expedientes</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mt-1">
              Probá modificando la búsqueda o verificá si el paciente ya tiene una ficha clínica odontológica creada.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
