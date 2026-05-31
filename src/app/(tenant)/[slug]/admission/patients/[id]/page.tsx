import { getPatient } from '../../actions'
import { getDentalRecords } from '@/app/(tenant)/[slug]/odontology/actions'
import Link from 'next/link'
import { ArrowLeft, Plus, FileText, CalendarDays, Phone, Mail, MapPin, Edit, ClipboardList } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function PatientDetailPage({ params }: Props) {
  const { slug, id } = await params
  const patient = await getPatient(slug, id)
  const records = await getDentalRecords(slug, id)

  if (!patient) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-2xl font-black text-gray-900">Paciente no encontrado</h2>
        <Link href={`/${slug}/admission/patients`} className="btn btn-primary mt-6 rounded-2xl font-black shadow-lg shadow-primary/20">
          Volver a pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header adaptado a mobile */}
      <div className="flex items-center justify-between bg-base-100 p-4 md:p-0 rounded-2xl md:bg-transparent shadow-sm md:shadow-none sticky top-0 md:relative z-20 mx-4 md:mx-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href={`/${slug}/admission/patients`}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-gray-900 truncate">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest truncate">
              Ficha del paciente
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          <Link
            href={`/${slug}/admission/patients/${id}/edit`}
            className="btn btn-ghost btn-sm rounded-xl font-bold border-gray-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
          <Link
            href={`/${slug}/odontology/periodontogram?patientId=${id}`}
            className="btn btn-outline btn-sm rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-700"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Periodontograma
          </Link>
          <Link
            href={`/${slug}/odontology/form-033/new?patient=${id}`}
            className="btn btn-primary btn-sm rounded-xl font-black shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Historia
          </Link>
        </div>
      </div>

      {/* Patient info card */}
      <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-3xl">
        <div className="card-body p-5 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <span className="text-xl font-black text-blue-600">
                  {patient.first_name[0]}{patient.last_name[0]}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </h2>
                  <StatusBadge status={patient.status || 'active'} />
                </div>
                <p className="text-sm text-gray-500 mt-1">{patient.cedula ? `C.I. ${patient.cedula}` : 'Sin cédula'}</p>
              </div>
            </div>
          </div>

          {patient.observations && (
            <>
              <div className="divider my-4" />
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed">{patient.observations}</p>
              </div>
            </>
          )}

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
      <div className="space-y-4 mx-4 md:mx-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">Historias Clínicas</h3>
          <Link
            href={`/${slug}/odontology/form-033/new?patient=${id}`}
            className="text-sm font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="card bg-white border border-dashed border-gray-200 shadow-sm rounded-3xl">
            <div className="card-body items-center text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="font-black text-gray-900">Sin historias clínicas</h4>
              <p className="text-gray-500 text-sm mt-1">Creá la primera historia clínica para este paciente</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/${slug}/odontology/form-033/${record.id}`}
                className="card bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl active:scale-[0.98] block"
              >
                <div className="card-body p-5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-black text-gray-900">
                        {record.opening_date ? new Date(record.opening_date).toLocaleDateString('es-EC') : 'Sin fecha'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {record.consultation_reason || 'Sin motivo registrado'}
                      </p>
                    </div>
                    <div className="text-gray-400 ml-3 shrink-0 flex items-center gap-2">
                      <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-purple-50 text-[10px] font-black uppercase text-purple-700 border border-purple-100">
                        Ver Ficha & Odontograma
                      </span>
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-6 left-4 right-4 md:hidden z-30 flex gap-2">
        <Link
          href={`/${slug}/admission/patients/${id}/edit`}
          className="flex-1 btn bg-white border-gray-200 rounded-2xl h-14 font-black shadow-xl"
        >
          <Edit className="w-5 h-5 mr-2" />
          EDITAR
        </Link>
        <Link
          href={`/${slug}/odontology/periodontogram?patientId=${id}`}
          className="flex-1 btn bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-2xl h-14 font-black shadow-xl"
        >
          <ClipboardList className="w-5 h-5 mr-2" />
          PERIODONTO.
        </Link>
        <Link
          href={`/${slug}/odontology/form-033/new?patient=${id}`}
          className="flex-[2] btn btn-primary rounded-2xl h-14 font-black shadow-xl shadow-primary/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          NUEVA HISTORIA
        </Link>
      </div>
    </div>
  )
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  in_treatment: { label: 'En Tratamiento', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  inactive: { label: 'Inactivo', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  discharged: { label: 'Alta', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.active
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  )
}
