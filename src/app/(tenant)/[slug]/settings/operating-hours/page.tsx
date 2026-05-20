import { getOperatingHours, updateOperatingHours } from '../actions'
import Link from 'next/link'
import { ArrowLeft, Clock, Save } from 'lucide-react'

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function getDayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] || 'Desconocido'
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OperatingHoursPage({ params }: Props) {
  const { slug } = await params
  const hours = await getOperatingHours(slug)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link href={`/${slug}/settings/profile`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Horarios de Atención</h2>
          <p className="text-gray-500 font-medium">Configurá los días y horas en que atiende tu clínica</p>
        </div>
      </div>

      <form action={updateOperatingHours.bind(null, slug) as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
        <div className="card bg-white border border-gray-200 shadow-sm rounded-[32px] overflow-hidden">
          <div className="card-body p-6 md:p-8 space-y-4">
            {hours.map((hour) => (
              <div
                key={hour.day_of_week}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  hour.is_open
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-gray-500">
                    {getDayLabel(hour.day_of_week).slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900">{getDayLabel(hour.day_of_week)}</p>
                  {hour.is_open && hour.open_time && hour.close_time && (
                    <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {hour.open_time.slice(0, 5)} — {hour.close_time.slice(0, 5)} hs
                    </p>
                  )}
                  {!hour.is_open && (
                    <p className="text-xs font-medium text-gray-400">Cerrado</p>
                  )}
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name={`day_${hour.day_of_week}_open`}
                    value="true"
                    defaultChecked={hour.is_open}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Time inputs for each day */}
        <div className="card bg-white border border-gray-200 shadow-sm rounded-[32px] overflow-hidden">
          <div className="card-body p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Definir Horarios
            </h3>

            {hours.map((hour) => (
              <div key={`time_${hour.day_of_week}`} className="grid grid-cols-3 gap-3 items-center">
                <span className="text-sm font-bold text-gray-600">
                  {getDayLabel(hour.day_of_week)}
                </span>
                <input
                  type="time"
                  name={`day_${hour.day_of_week}_open_time`}
                  defaultValue={hour.open_time?.slice(0, 5) || '08:00'}
                  disabled={!hour.is_open}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-40"
                />
                <input
                  type="time"
                  name={`day_${hour.day_of_week}_close_time`}
                  defaultValue={hour.close_time?.slice(0, 5) || '18:00'}
                  disabled={!hour.is_open}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 disabled:opacity-40"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-4 md:px-0">
          <button
            type="submit"
            className="btn btn-primary rounded-2xl font-black px-8 h-14 shadow-xl shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            GUARDAR HORARIOS
          </button>
          <Link
            href={`/${slug}/settings/profile`}
            className="btn btn-ghost rounded-2xl font-black h-14 border border-gray-200"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
