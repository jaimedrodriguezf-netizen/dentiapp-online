'use client'

import { Activity, ShieldAlert, Sparkles } from 'lucide-react'
import { Tooth } from '@/components/ui/ToothIcon'

interface Props {
  plaqueIndex: number
  bleedingIndex: number
  totalEvaluatedPoints: number
  teethCount: number
}

export default function PeriodontalSummaryCards({
  plaqueIndex,
  bleedingIndex,
  totalEvaluatedPoints,
  teethCount
}: Props) {
  // Estados clínicos en base a los índices
  const getPlaqueStatus = (idx: number) => {
    if (idx <= 15) return { label: 'Excelente', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' }
    if (idx <= 30) return { label: 'Aceptable', color: 'text-blue-500 bg-blue-50 border-blue-100' }
    return { label: 'Deficiente', color: 'text-rose-500 bg-rose-50 border-rose-100' }
  }

  const getBleedingStatus = (idx: number) => {
    if (idx <= 10) return { label: 'Bajo Riesgo', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' }
    if (idx <= 25) return { label: 'Riesgo Moderado', color: 'text-amber-500 bg-amber-50 border-amber-100' }
    return { label: 'Riesgo Alto', color: 'text-rose-500 bg-rose-50 border-rose-100' }
  }

  const plaqueStatus = getPlaqueStatus(plaqueIndex)
  const bleedingStatus = getBleedingStatus(bleedingIndex)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {/* Tarjeta 1: Índice de Placa */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Índice de Placa (IP)</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900">{plaqueIndex}%</h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${plaqueStatus.color}`}>
              {plaqueStatus.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Porcentaje de superficies con placa bacteriana
          </p>
        </div>
      </div>

      {/* Tarjeta 2: Índice de Sangrado */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Índice de Sangrado (IS)</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900">{bleedingIndex}%</h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${bleedingStatus.color}`}>
              {bleedingStatus.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Superficies con sangrado activo al sondaje
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Dientes Evaluados */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dientes Evaluados</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Tooth className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-4xl font-black text-gray-900">{teethCount} <span className="text-lg text-gray-400">/ 32</span></h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Piezas dentales presentes en boca
          </p>
        </div>
      </div>

      {/* Tarjeta 4: Puntos de Sondaje */}
      <div className="card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntos Totales</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-4xl font-black text-gray-900">{totalEvaluatedPoints}</h3>
          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
            Sitios clínicos evaluados (6 por pieza)
          </p>
        </div>
      </div>
    </div>
  )
}
