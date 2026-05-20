'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
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
  return date.toISOString().split('T')[0]
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200 line-through',
  cancelled: 'bg-red-100 text-red-500 border-red-200 line-through',
  no_show: 'bg-orange-100 text-orange-700 border-orange-200',
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

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 md:px-0">
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-blue-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-gray-600 uppercase tracking-widest">
            {days[0].toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} —{' '}
            {days[6].toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 hover:text-blue-600 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7">
          {days.map((date, i) => {
            const dateStr = formatDate(date)
            const isToday = dateStr === today
            const appointmentsOnDay = appointments.filter(a => {
              // In weekly view, we'd need appointments with dates.
              // For now, show count if the appointment date matches.
              return true // placeholder — will filter by actual date in real data
            })
            return (
              <div
                key={i}
                className={`p-4 text-center border-r border-gray-50 last:border-r-0 ${
                  isToday ? 'bg-blue-50/50' : ''
                }`}
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {DAY_NAMES[i]}
                </p>
                <p
                  className={`text-xl font-black mt-1 ${
                    isToday
                      ? 'text-white bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Appointments grid */}
        <div className="border-t border-gray-100 p-4 md:p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Sin turnos esta semana</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 10).map((appointment) => {
                const status = statusColors[appointment.status] || statusColors.scheduled
                return (
                  <Link
                    key={appointment.id}
                    href={`/${slug}/odontology?patientId=${appointment.patients?.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xs font-black text-gray-400 w-12 shrink-0">
                      {appointment.time?.slice(0, 5)}
                    </span>
                    <span className="flex-1 text-sm font-bold text-gray-900 truncate">
                      {appointment.patients?.first_name} {appointment.patients?.last_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${status}`}>
                      {appointment.status === 'scheduled' ? 'Pendiente' :
                       appointment.status === 'confirmed' ? 'Confirmado' :
                       appointment.status === 'in_progress' ? 'En curso' :
                       appointment.status === 'completed' ? 'Hecho' :
                       appointment.status === 'cancelled' ? 'Cancelado' : 'No asistió'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
