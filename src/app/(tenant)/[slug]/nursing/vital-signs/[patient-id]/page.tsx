import { getPatient, saveVitalSigns, getVitalSigns } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Save, X, Activity, History, User } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; 'patient-id': string }>
}

interface VitalSignRecord {
  record_date?: string
  blood_pressure: string | null
  heart_rate: string | null
  temperature: string | null
  oxygen_saturation: string | null
}

export default async function VitalSignsFormPage({ params }: Props) {
  const { slug, 'patient-id': patientId } = await params
  const patient = await getPatient(slug, patientId)
  const historyRaw = await getVitalSigns(slug, patientId)
  const history = (historyRaw as unknown as VitalSignRecord[]) || []

  if (!patient) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-black text-gray-900 uppercase">Paciente no encontrado</h2>
        <Link href={`/${slug}/nursing/vital-signs`} className="btn btn-ghost mt-4 rounded-xl font-bold">
          Volver a la lista
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link
          href={`/${slug}/nursing/vital-signs`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Signos Vitales</h2>
          <p className="text-gray-500 font-medium">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

      <form action={async (fd: FormData) => {
        'use server'
        const data = {
          blood_pressure: fd.get('blood_pressure') as string,
          heart_rate: fd.get('heart_rate') as string,
          temperature: fd.get('temperature') as string,
          respiratory_rate: fd.get('respiratory_rate') as string,
          oxygen_saturation: fd.get('oxygen_saturation') as string,
          weight: fd.get('weight') as string,
          height: fd.get('height') as string,
        }
        await saveVitalSigns(slug, patientId, data)
      }} className="space-y-6">
        
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Registro Actual</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Presión Arterial" name="blood_pressure" placeholder="120/80" />
              <FormField label="Frec. Cardíaca" name="heart_rate" placeholder="80 lpm" />
              <FormField label="Temperatura" name="temperature" placeholder="36.5 °C" />
              <FormField label="Frec. Respiratoria" name="respiratory_rate" placeholder="16 rpm" />
              <FormField label="Sat. Oxígeno" name="oxygen_saturation" placeholder="98 %" />
              <FormField label="Peso (kg)" name="weight" placeholder="70 kg" />
            </div>

            <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto btn btn-primary rounded-2xl font-black px-12 h-14 shadow-xl shadow-primary/20"
              >
                <Save className="w-5 h-5 mr-2" />
                GUARDAR SIGNOS
              </button>
              <Link
                href={`/${slug}/nursing/vital-signs`}
                className="w-full sm:w-auto btn btn-ghost border-gray-200 rounded-2xl h-14 font-black"
              >
                <X className="w-5 h-5 mr-2" />
                CANCELAR
              </Link>
            </div>
          </div>
        </div>
      </form>

      {history.length > 0 && (
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 rounded-[32px] overflow-hidden">
          <div className="card-body p-6 md:p-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-gray-400" />
              Historial Reciente
            </h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50/50 border border-gray-100 rounded-2xl group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400">
                        <User className="w-4 h-4" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Fecha de Registro</p>
                        <p className="text-sm font-bold text-gray-700">
                           {h.record_date ? new Date(h.record_date).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hoy'}
                        </p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-2xl">
                    <HistoryItem label="PA" value={h.blood_pressure} />
                    <HistoryItem label="FC" value={h.heart_rate} />
                    <HistoryItem label="T°" value={h.temperature} />
                    <HistoryItem label="SpO2" value={h.oxygen_saturation} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, name, placeholder }: { label: string, name: string, placeholder: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/30 px-5 py-3.5 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
      />
    </div>
  )
}

function HistoryItem({ label, value }: { label: string, value: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-gray-600">{value || '—'}</span>
    </div>
  )
}
