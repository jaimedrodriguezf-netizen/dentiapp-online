import { getPatient } from '../../actions'
import { getDentalRecords } from '@/app/(tenant)/[slug]/odontology/actions'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, CalendarDays, Phone, Mail, MapPin, Edit } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { slug, id } = await params
  const patient = await getPatient(slug, id)
  const records = await getDentalRecords(slug, id)

  if (!patient) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/admission/patients`} className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${slug}/admission/patients`}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      {/* Patient info card */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {patient.first_name[0]}{patient.last_name[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h2>
                <p className="text-gray-500">{patient.cedula ? `C.I. ${patient.cedula}` : 'Sin cédula'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/${slug}/admission/patients/${id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <Link
                href={`/${slug}/odontology/form-033/new?patient=${id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Historia
              </Link>
            </div>
          </div>

          <div className="divider my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {patient.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {patient.phone}
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {patient.email}
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {patient.address}
              </div>
            )}
            {patient.birth_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                {new Date(patient.birth_date).toLocaleDateString('es-EC')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dental records */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Historias Clínicas</h3>
          <Link
            href={`/${slug}/odontology/form-033/new?patient=${id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Nueva
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="card bg-white border border-gray-200 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="font-semibold text-gray-900">Sin historias clínicas</h4>
              <p className="text-gray-500 text-sm mt-1">Creá la primera historia clínica para este paciente</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/${slug}/odontology/form-033/${record.id}`}
                className="card bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow block"
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {record.opening_date ? new Date(record.opening_date).toLocaleDateString('es-EC') : 'Sin fecha'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {record.consultation_reason || 'Sin motivo registrado'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
