import { getDentalRecord, getPatient, getPrescriptions } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Edit, Printer, Activity, FileText, Pill } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function Form033DetailPage({ params }: Props) {
  const { slug, id } = await params
  const record = await getDentalRecord(slug, id)
  const prescriptions = await getPrescriptions(slug, id)

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
            <DiagnosisSection content={record.diagnosis} />
            <VitalSignsView content={record.vital_signs} />
            <ClinicalExamView
              stomatognathic={record.stomatognathic_exam}
              oralHygiene={record.oral_hygiene}
              fluorosis={record.fluorosis}
              malocclusion={record.malocclusion}
            />
            <IndicesView cpod={record.cpod_index} ceod={record.ceod_index} />
            <Section title="8. Plan terapéutico" content={record.therapeutic_plan} />
            <Section title="9. Plan educativo" content={record.educational_plan} />
            <Section title="10. Tratamiento realizado" content={record.treatment} />
          </div>
        </div>
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="card bg-white border border-gray-200 shadow-sm">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-400" />
              Receta médica
            </h3>
            <div className="space-y-3">
              {prescriptions.map((rx: any) => (
                <div key={rx.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Pill className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{rx.medication_name}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                        {rx.dosage && (
                          <div><span className="text-gray-400">Dosis:</span> {rx.dosage}</div>
                        )}
                        {rx.frequency && (
                          <div><span className="text-gray-400">Frecuencia:</span> {rx.frequency}</div>
                        )}
                        {rx.duration && (
                          <div><span className="text-gray-400">Duración:</span> {rx.duration}</div>
                        )}
                        {rx.quantity && (
                          <div><span className="text-gray-400">Cantidad:</span> {rx.quantity} unidades</div>
                        )}
                      </div>
                      {rx.instructions && (
                        <p className="text-sm text-gray-500 mt-1 italic">{rx.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

function DiagnosisSection({ content }: { content: any }) {
  if (!content) return null

  const code = content.code
  const description = content.description
  const notes = content.text

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">5. Diagnóstico (CIE-10)</h3>
      {code && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-mono font-medium text-blue-700 border border-blue-200">
            {code}
          </span>
          {description && <span className="text-sm text-gray-700">{description}</span>}
        </div>
      )}
      {notes && <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>}
      {!code && !notes && (
        <p className="text-sm text-gray-400 italic">Sin diagnóstico registrado</p>
      )}
    </div>
  )
}

function VitalSignsView({ content }: { content: any }) {
  if (!content) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">6. Signos vitales</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
        {content.blood_pressure && <div><span className="text-gray-400">TA:</span> {content.blood_pressure}</div>}
        {content.heart_rate && <div><span className="text-gray-400">FC:</span> {content.heart_rate} lpm</div>}
        {content.respiratory_rate && <div><span className="text-gray-400">FR:</span> {content.respiratory_rate} rpm</div>}
        {content.temperature && <div><span className="text-gray-400">Temp:</span> {content.temperature} °C</div>}
        {content.spo2 && <div><span className="text-gray-400">SpO2:</span> {content.spo2}%</div>}
        {content.weight && <div><span className="text-gray-400">Peso:</span> {content.weight} kg</div>}
        {content.height && <div><span className="text-gray-400">Talla:</span> {content.height} cm</div>}
        {content.bmi && <div><span className="text-gray-400">IMC:</span> {content.bmi}</div>}
      </div>
    </div>
  )
}

const stomatognathicLabels: Record<string, string> = {
  labios: 'Labios', mejillas: 'Mejillas', atm: 'ATM',
  musculos: 'Músculos masticatorios', piso_boca: 'Piso de boca',
  lengua: 'Lengua', paladar_duro: 'Paladar duro', paladar_blando: 'Paladar blando',
  gingival: 'Encía', periodontal: 'Periodontal',
}

function ClinicalExamView({ stomatognathic, oralHygiene, fluorosis, malocclusion }: any) {
  const hasAny = stomatognathic || oralHygiene || fluorosis || malocclusion
  if (!hasAny) return null

  const mal = (() => {
    if (!malocclusion) return {}
    try { return JSON.parse(malocclusion) } catch { return {} }
  })()

  const malClassLabels: Record<string, string> = {
    clase_i: 'Clase I', clase_ii: 'Clase II', clase_iii: 'Clase III',
  }

  const hygieneLabels: Record<string, string> = {
    buena: 'Buena', regular: 'Regular', mala: 'Mala',
  }

  const fluorosisLabels: Record<string, string> = {
    dudosa: 'Dudosa', muy_leve: 'Muy leve', leve: 'Leve',
    moderada: 'Moderada', severa: 'Severa',
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">7. Examen clínico</h3>
      <div className="space-y-2 text-sm text-gray-600">
        {stomatognathic && (
          <div>
            <span className="text-gray-400">Estomatognático:</span>{' '}
            {stomatognathic.split(',').filter(Boolean).map((s: string) => stomatognathicLabels[s] || s).join(', ')}
          </div>
        )}
        {oralHygiene?.rating && (
          <div>
            <span className="text-gray-400">Higiene oral:</span> {hygieneLabels[oralHygiene.rating] || oralHygiene.rating}
            {oralHygiene.plaque_index != null && ` (Índice de placa: ${oralHygiene.plaque_index}%)`}
          </div>
        )}
        {fluorosis && (
          <div>
            <span className="text-gray-400">Fluorosis:</span> {fluorosisLabels[fluorosis] || fluorosis}
          </div>
        )}
        {mal?.class && (
          <div>
            <span className="text-gray-400">Maloclusión:</span> {malClassLabels[mal.class] || mal.class}
            {mal.overjet != null && ` | Overjet: ${mal.overjet}mm`}
            {mal.overbite != null && ` | Overbite: ${mal.overbite}mm`}
          </div>
        )}
      </div>
    </div>
  )
}

function IndicesView({ cpod, ceod }: { cpod: any; ceod: any }) {
  if (!cpod && !ceod) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">7. Índices CPO-D / CEO-D</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
        {cpod && (
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-medium text-gray-800">CPO-D</span>
            <div className="mt-1">C: {cpod.caries} | P: {cpod.missing} | O: {cpod.filled} | Total: {cpod.total}</div>
          </div>
        )}
        {ceod && (
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-medium text-gray-800">CEO-D</span>
            <div className="mt-1">C: {ceod.caries} | E: {ceod.extraction} | O: {ceod.filled} | Total: {ceod.total}</div>
          </div>
        )}
      </div>
    </div>
  )
}
