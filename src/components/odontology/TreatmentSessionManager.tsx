"use client"

import { useState } from 'react'
import { Plus, Trash2, Calendar, ClipboardList } from 'lucide-react'

interface Session {
  id?: string
  session_number: number
  date: string
  diagnosis: string
  procedure: string
  notes: string
}

interface TreatmentSessionManagerProps {
  defaultSessions?: Session[]
}

export default function TreatmentSessionManager({
  defaultSessions = [],
}: TreatmentSessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>(defaultSessions)

  const addSession = () => {
    const nextNum = sessions.length + 1
    const newSession: Session = {
      session_number: nextNum,
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      procedure: '',
      notes: '',
    }
    setSessions([...sessions, newSession])
  }

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }

  const updateSession = (index: number, field: keyof Session, value: string) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setSessions(newSessions)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Sesiones de Tratamiento</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Historial de evolución clínica</p>
        </div>
        <button
          type="button"
          onClick={addSession}
          className="btn btn-sm btn-primary rounded-xl font-black bg-blue-600 hover:bg-blue-700 border-none text-white shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sessions.map((session, index) => (
          <div
            key={session.id || `temp-${index}-${session.session_number}`}
            className="group relative bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  <span className="text-sm font-black text-gray-900">{session.session_number}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sesión</span>
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) => updateSession(index, 'date', e.target.value)}
                    className="text-xs font-bold text-gray-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSession(index)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <Calendar className="w-3 h-3" />
                  Diagnóstico / Complicaciones
                </label>
                <textarea
                  value={session.diagnosis}
                  onChange={(e) => updateSession(index, 'diagnosis', e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  rows={2}
                  placeholder="Detallar hallazgos..."
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  <ClipboardList className="w-3 h-3" />
                  Procedimientos / Recetas
                </label>
                <textarea
                  value={session.procedure}
                  onChange={(e) => updateSession(index, 'procedure', e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/30 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  rows={2}
                  placeholder="Detallar tratamiento..."
                />
              </div>
            </div>

            {/* Hidden inputs to be captured by the parent form's FormData */}
            <input type="hidden" name="session_numbers[]" value={session.session_number} readOnly />
            <input type="hidden" name="session_dates[]" value={session.date} readOnly />
            <input type="hidden" name="session_diagnoses[]" value={session.diagnosis} readOnly />
            <input type="hidden" name="session_procedures[]" value={session.procedure} readOnly />
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay sesiones registradas</p>
            <button
              type="button"
              onClick={addSession}
              className="mt-4 text-xs font-black text-blue-600 hover:text-blue-700 uppercase"
            >
              + Agregar la primera sesión
            </button>
          </div>
        )}
      </div>

      <input type="hidden" name="treatment_sessions_json" value={JSON.stringify(sessions)} readOnly />
    </div>
  )
}
