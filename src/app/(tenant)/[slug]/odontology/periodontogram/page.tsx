import Link from 'next/link'
import { ArrowLeft, Clock, Activity, FileText, CheckCircle2, ChevronRight } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PeriodontogramPlaceholder({ params }: Props) {
  const { slug } = await params

  const features = [
    {
      title: 'Profundidad de Sondaje (PS)',
      desc: 'Registro interactivo de 6 puntos por pieza dental con alertas visuales de bolsas periodontales.',
      icon: Activity,
    },
    {
      title: 'Margen Gingival y Recesión',
      desc: 'Cálculo automatizado del Nivel de Inserción Clínica (NIC) en tiempo real.',
      icon: FileText,
    },
    {
      title: 'Sangrado, Placa y Supuración',
      desc: 'Mapeo rápido con atajos de teclado para un registro clínico ultra veloz.',
      icon: CheckCircle2,
    },
    {
      title: 'Ficha Periodontal Exportable',
      desc: 'Generación nativa de informes PDF de alta calidad listos para impresión y auditoría.',
      icon: ChevronRight,
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6">
      {/* Navegación de retroceso */}
      <div>
        <Link
          href={`/${slug}/odontology`}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Odontología
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-[32px] text-white p-8 md:p-12 shadow-xl shadow-blue-500/10">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Próximamente
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase">
            Periodontograma <br />
            <span className="text-blue-200">Clínico Digital</span>
          </h1>
          
          <p className="text-base md:text-lg text-blue-100 font-medium leading-relaxed opacity-95">
            Estamos diseñando una herramienta interactiva premium para el registro periodontal completo del paciente, completamente integrada al expediente dental y estadísticas del consultorio.
          </p>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="space-y-6">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">¿Qué incluirá este módulo?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div 
                key={feat.title} 
                className="card bg-white border border-gray-100 shadow-xl shadow-gray-900/5 rounded-3xl p-6 hover:shadow-2xl hover:shadow-gray-900/10 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight">{feat.title}</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Beta Notice & Footer Info */}
      <div className="card bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">¿Querés ser parte del desarrollo?</h4>
        <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          Si tenés requerimientos odontológicos específicos para el periodontograma o querés participar del programa de pruebas Beta, ponete en contacto con nuestro equipo de soporte técnico.
        </p>
      </div>
    </div>
  )
}
