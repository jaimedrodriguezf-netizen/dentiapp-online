import { getDentalRecord, getPatient } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Edit, Printer, Activity } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function Form033DetailPage({ params }: Props) {
  const { slug, id } = await params
  const record = await getDentalRecord(slug, id)

  if (!record) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Historia clínica no encontrada</h2>
        <Link href={`/${slug}/admission/patients`} className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  const patient = record.patients as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}/admission/patients/${record.patient_id}`}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Formulario 033</h2>
            <p className="text-gray-500 mt-1">
              Historia Clínica Odontológica
            </p>
          </div>
        </div>
      </div>

      {/* Patient and record info */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Historia Clínica Odontológica
            </h1>
            <p className="text-sm text-gray-500 mt-1">Formulario 033 — MSP Ecuador</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-200 pb-4 mb-6">
            <div>
              <span className="font-semibold text-gray-700">Paciente:</span>{' '}
              {patient?.first_name} {patient?.last_name}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Cédula:</span>{' '}
              {patient?.cedula || '—'}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Fecha de apertura:</span>{' '}
              {record.opening_date ? new Date(record.opening_date).toLocaleDateString('es-EC') : '—'}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Fecha de control:</span>{' '}
              {record.control_date ? new Date(record.control_date).toLocaleDateString('es-EC') : '—'}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-6">
            <Section title="1. Motivo de consulta" content={record.consultation_reason} />
            <Section title="2. Problema actual" content={record.current_problem} />
            <Section title="3. Antecedentes personales y familiares" content={record.personal_family_history} />
            <Section title="4. Plan diagnóstico" content={record.diagnostic_plan} />
            <Section title="5. Diagnóstico" content={record.diagnosis} />
            <Section title="6. Plan terapéutico" content={record.therapeutic_plan} />
            <Section title="7. Plan educativo" content={record.educational_plan} />
            <Section title="8. Tratamiento realizado" content={record.treatment} />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Link
          href={`/${slug}/odontology/odontogram/${id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Odontograma
        </Link>
        <Link
          href={`/${slug}/odontology/form-033/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: any }) {
  const text = typeof content === 'object' && content !== null ? content.text : content
  if (!text) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{text}</p>
    </div>
  )
}
