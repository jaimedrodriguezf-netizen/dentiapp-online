'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { getLocalDateString } from '@/lib/utils/date'

interface Appointment {
  id: string
  date?: string
  time: string
  status: string
  reason: string | null
  patients: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
  } | null
}

interface Props {
  slug: string
  appointments: Appointment[]
  currentDate: string
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getWeekStart(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  return d
}

function formatDate(date: Date): string {
  return getLocalDateString(date)
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 line-through',
  no_show: 'bg-orange-50 text-orange-800 border-orange-200',
}

const statusBadgeLabels: Record<string, string> = {
  scheduled: 'Pendiente',
  confirmed: 'Confirmado',
  in_progress: 'En atención',
  completed: 'Atendido',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
}

export default function WeeklyCalendar({ slug, appointments, currentDate }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(currentDate))

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const today = getLocalDateString()

  return (
    <div className="space-y-4">
      {/* Controles de semana */}
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all cursor-pointer"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider px-2">
            {days[0].toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} —{' '}
            {days[6].toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all cursor-pointer"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <Link
          href={`/${slug}/admission/appointments/new`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Agendar en Semana
        </Link>
      </div>

      {/* Grid semanal clínico */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden mx-4 md:mx-0">
        {/* Cabecera de días */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {days.map((date, i) => {
            const dateStr = formatDate(date)
            const isToday = dateStr === today
            return (
              <div
                key={dateStr}
                className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${
                  isToday ? 'bg-blue-50/60' : ''
                }`}
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {DAY_NAMES[i]}
                </p>
                <p
                  className={`text-base font-bold mt-0.5 ${
                    isToday
                      ? 'text-white bg-blue-600 w-7 h-7 rounded-full flex items-center justify-center mx-auto shadow-xs'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Columnas con turnos asignados por día */}
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[300px]">
          {days.map((date) => {
            const dateStr = formatDate(date)
            const dayAppointments = appointments.filter((a) => a.date === dateStr)
            const isToday = dateStr === today

            return (
              <div
                key={dateStr}
                className={`p-2.5 space-y-2 flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/10' : 'bg-white'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {dayAppointments.length} citas
                    </span>
                  </div>

                  {dayAppointments.length === 0 ? (
                    <div className="py-8 text-center text-gray-300">
                      <p className="text-[11px] font-medium italic">Sin citas</p>
                    </div>
                  ) : (
                    dayAppointments.map((apt) => {
                      const statusColor = statusColors[apt.status] || statusColors.scheduled
                      const statusLabel = statusBadgeLabels[apt.status] || apt.status

                      return (
                        <Link
                          key={apt.id}
                          href={`/${slug}/admission/appointments?date=${dateStr}`}
                          className={`block p-2 rounded-lg border text-xs transition-all hover:shadow-xs group ${statusColor}`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-0.5">
                            <span>{apt.time?.slice(0, 5)}</span>
                            <span className="text-[9px] uppercase font-semibold opacity-85">
                              {statusLabel}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 truncate">
                            {apt.patients?.first_name} {apt.patients?.last_name}
                          </p>
                          {apt.reason && (
                            <p className="text-[10px] text-gray-600 truncate mt-0.5">
                              {apt.reason}
                            </p>
                          )}
                        </Link>
                      )
                    })
                  )}
                </div>

                <Link
                  href={`/${slug}/admission/appointments?date=${dateStr}`}
                  className="mt-2 block text-center py-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-gray-50 hover:bg-blue-50/50 rounded border border-gray-100 transition-colors"
                >
                  Abrir agenda diaria →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
