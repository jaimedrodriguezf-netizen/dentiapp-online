import { getDentalRecord, updateDentalRecord } from '../../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CIESearch from '@/components/odontology/CIESearch'
import PrescriptionManager from '@/components/odontology/PrescriptionManager'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function EditForm033Page({ params }: Props) {
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

  const getText = (val: any) => (typeof val === 'object' && val !== null ? val.text : val) || ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/odontology/form-033/${id}`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Formulario 033</h2>
          <p className="text-gray-500 mt-1">
            Historia Clínica Odontológica
          </p>
        </div>
      </div>

      <form action={(fd) => { updateDentalRecord(slug, id, fd); }} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-6">
          <SectionEdit
            title="1. Motivo de consulta"
            name="consultation_reason"
            value={getText(record.consultation_reason)}
          />
          <SectionEdit
            title="2. Problema actual"
            name="current_problem"
            value={getText(record.current_problem)}
            rows={3}
          />
          <SectionEdit
            title="3. Antecedentes personales y familiares"
            name="personal_family_history"
            value={getText(record.personal_family_history)}
            rows={3}
          />
          <SectionEdit
            title="4. Plan diagnóstico"
            name="diagnostic_plan"
            value={getText(record.diagnostic_plan)}
            rows={3}
          />
          {/* Diagnóstico con CIE-10 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">
              5. Diagnóstico <span className="text-xs font-normal text-gray-400">(CIE-10)</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Código CIE-10</label>
                <CIESearch
                  defaultCode={record.diagnosis?.code || ''}
                  defaultDescription={record.diagnosis?.description || ''}
                  onSelect={() => {}}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Notas clínicas</label>
                <textarea
                  name="diagnosis_notes"
                  defaultValue={record.diagnosis?.text || getText(record.diagnosis) || ''}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <SectionEdit
            title="6. Plan terapéutico"
            name="therapeutic_plan"
            value={getText(record.therapeutic_plan)}
            rows={3}
          />
          <SectionEdit
            title="7. Plan educativo"
            name="educational_plan"
            value={getText(record.educational_plan)}
            rows={3}
          />
          <SectionEdit
            title="8. Tratamiento realizado"
            name="treatment"
            value={getText(record.treatment)}
            rows={3}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
            <Link
              href={`/${slug}/odontology/form-033/${id}`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>

      {/* Prescription section */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <PrescriptionManager slug={slug} recordId={id} />
        </div>
      </div>
    </div>
  )
}

function SectionEdit({ title, name, value, rows = 2 }: { title: string; name: string; value: string; rows?: number }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{title}</h3>
      <textarea
        name={name}
        defaultValue={value}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={rows}
      />
    </div>
  )
}
