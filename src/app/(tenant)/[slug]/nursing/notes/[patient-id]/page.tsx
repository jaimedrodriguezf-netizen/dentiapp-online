import { getPatient, saveNursingNote, getNursingNotes } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; 'patient-id': string }>
}

export default async function NursingNotesPage({ params }: Props) {
  const { slug, 'patient-id': patientId } = await params
  const patient = await getPatient(slug, patientId)
  const notes = await getNursingNotes(slug, patientId)

  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/nursing/vital-signs`} className="text-blue-600 hover:underline mt-2 inline-block">Volver</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${slug}/nursing/vital-signs`} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notas de Enfermería</h2>
            <p className="text-gray-500 mt-1">{patient.first_name} {patient.last_name}</p>
          </div>
        </div>
      </div>

      <form action={(fd) => { saveNursingNote(slug, patientId, fd); }} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-4">
          <textarea name="content" required rows={3}
            placeholder="Escribí la nota de enfermería..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end mt-3">
            <button type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Nota
            </button>
          </div>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body items-center text-center py-12">
            <p className="text-gray-500">No hay notas de enfermería para este paciente</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="card bg-white border border-gray-200 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleString('es-EC')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
