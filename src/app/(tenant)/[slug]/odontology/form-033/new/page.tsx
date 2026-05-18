import { getPatient } from '../../actions'
import { createDentalRecord } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CIESearch from '@/components/odontology/CIESearch'
import VitalSignsSection from '@/components/odontology/VitalSignsSection'
import { OralHygieneFields, FluorosisField, MalocclusionFields, StomatognathicFields, IndiceField } from '@/components/odontology/OralExamSection'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ patient?: string }>
}

export default async function NewForm033Page({ params, searchParams }: Props) {
  const { slug } = await params
  const { patient: patientId } = await searchParams
  const patient = patientId ? await getPatient(slug, patientId) : null

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Seleccioná un paciente</h2>
        <p className="text-gray-500 mt-2">Primero elegí un paciente desde la lista para crear su historia clínica</p>
        <Link
          href={`/${slug}/admission/patients`}
          className="inline-block mt-4 text-blue-600 hover:underline font-medium"
        >
          Ir a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/admission/patients/${patientId}`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formulario 033</h2>
          <p className="text-gray-500 mt-1">
            Historia Clínica Odontológica — {patient.first_name} {patient.last_name}
          </p>
        </div>
      </div>

      {/* Patient info summary */}
      <div className="card bg-gray-50 border border-gray-200">
        <div className="card-body p-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><span className="font-medium text-gray-900">Paciente:</span> {patient.first_name} {patient.last_name}</div>
            <div><span className="font-medium text-gray-900">Cédula:</span> {patient.cedula || '—'}</div>
            <div><span className="font-medium text-gray-900">Edad:</span> {patient.birth_date ? `${new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} años` : '—'}</div>
            <div><span className="font-medium text-gray-900">Género:</span> {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : '—'}</div>
          </div>
        </div>
      </div>

      <form action={createDentalRecord.bind(null, slug, patientId!) as unknown as (fd: FormData) => Promise<void>} className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body space-y-6">
          {/* Sección 1: Motivo y problema */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              1. Motivo de consulta y problema actual
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta</label>
                <textarea
                  name="consultation_reason"
                  placeholder="¿Por qué consulta el paciente?"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problema actual</label>
                <textarea
                  name="current_problem"
                  placeholder="Descripción del problema actual"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Antecedentes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              2. Antecedentes personales y familiares
            </h3>
            <div>
              <textarea
                name="personal_family_history"
                placeholder="Antecedentes médicos, alergias, enfermedades sistémicas, antecedentes familiares..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Sección 3: Plan diagnóstico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              3. Plan diagnóstico
            </h3>
            <div>
              <textarea
                name="diagnostic_plan"
                placeholder="Exámenes complementarios, estudios solicitados..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Sección 4: Diagnóstico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              4. Diagnóstico <span className="text-xs font-normal text-gray-400">(CIE-10)</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código CIE-10</label>
                <CIESearch />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas clínicas</label>
                <textarea
                  name="diagnosis_notes"
                  placeholder="Descripción adicional del diagnóstico, hallazgos clínicos..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sección 5: Signos vitales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              5. Signos vitales
            </h3>
            <VitalSignsSection />
          </div>

          {/* Sección 6: Examen clínico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              6. Examen clínico
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Examen estomatognático</h4>
                <StomatognathicFields />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Higiene oral</h4>
                <OralHygieneFields />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fluorosis</h4>
                  <FluorosisField />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Maloclusión</h4>
                  <MalocclusionFields />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 7: Índices CPO-D / CEO-D */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              7. Índices CPO-D / CEO-D
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">CPO-D (Dentición permanente)</h4>
                <IndiceField prefix="cpod" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">CEO-D (Dentición decidua)</h4>
                <IndiceField prefix="ceod" />
              </div>
            </div>
          </div>

          {/* Sección 8: Plan terapéutico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              8. Plan terapéutico
            </h3>
            <div>
              <textarea
                name="therapeutic_plan"
                placeholder="Tratamiento propuesto, procedimientos, medicación..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Sección 9: Plan educativo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              9. Plan educativo
            </h3>
            <div>
              <textarea
                name="educational_plan"
                placeholder="Educación al paciente sobre higiene oral, dieta, hábitos..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Sección 10: Tratamiento realizado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              10. Tratamiento realizado
            </h3>
            <div>
              <textarea
                name="treatment"
                placeholder="Procedimientos realizados, evolución, resultados..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Guardar Historia Clínica
            </button>
            <Link
              href={`/${slug}/admission/patients/${patientId}`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
