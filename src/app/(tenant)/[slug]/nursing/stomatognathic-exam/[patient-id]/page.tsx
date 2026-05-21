import { getPatient, saveStomatognathicExam, getStomatognathicExam } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Save, X, Activity, User, Info } from 'lucide-react'
import { StomatognathicFields } from '@/components/odontology/OralExamSection'

interface Props {
  params: Promise<{ slug: string; 'patient-id': string }>
}

interface StomatognathicData {
  id: string
  lips?: string
  cheeks?: string
  maxilla?: string
  mandible?: string
  tongue?: string
  palate?: string
  floor_of_mouth?: string
  salivary_glands?: string
  tmj?: string
  lymph_nodes?: string
}

export default async function StomatognathicExamPage({ params }: Props) {
  const { slug, 'patient-id': patientId } = await params
  const patient = await getPatient(slug, patientId)
  const existingExamRaw = await getStomatognathicExam(slug, patientId)
  const existingExam = existingExamRaw as unknown as StomatognathicData | null

  if (!patient) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-black text-gray-900 uppercase">Paciente no encontrado</h2>
        <Link href={`/${slug}/nursing/stomatognathic-exam`} className="btn btn-ghost mt-4 rounded-xl font-bold">
          Volver a la lista
        </Link>
      </div>
    )
  }

  const defaultValue = existingExam
    ? {
        regions: [
          { id: 'labios', finding: existingExam.lips || '' },
          { id: 'mejillas', finding: existingExam.cheeks || '' },
          { id: 'maxilar_superior', finding: existingExam.maxilla || '' },
          { id: 'maxilar_inferior', finding: existingExam.mandible || '' },
          { id: 'lengua', finding: existingExam.tongue || '' },
          { id: 'paladar', finding: existingExam.palate || '' },
          { id: 'piso_boca', finding: existingExam.floor_of_mouth || '' },
          { id: 'glandulas_salivales', finding: existingExam.salivary_glands || '' },
          { id: 'atm', finding: existingExam.tmj || '' },
          { id: 'ganglios', finding: existingExam.lymph_nodes || '' },
        ].filter((r) => r.finding),
      }
    : undefined

  return (
    <div className="w-full space-y-6 pb-24 md:pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link
          href={`/${slug}/nursing/stomatognathic-exam`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Examen Estomatognático</h2>
          <p className="text-gray-500 font-medium">{patient.first_name} {patient.last_name}</p>
        </div>
      </div>

       <form action={async (fd: FormData) => {
         'use server'
         const raw = fd.get('stomatognathic_exam') as string | null
         const parsed = raw ? JSON.parse(raw) : { regions: [] }
         const regionMap: Record<string, keyof StomatognathicData> = {
           labios: 'lips', mejillas: 'cheeks', maxilar_superior: 'maxilla',
           maxilar_inferior: 'mandible', lengua: 'tongue', paladar: 'palate',
           piso_boca: 'floor_of_mouth', glandulas_salivales: 'salivary_glands',
           atm: 'tmj', ganglios: 'lymph_nodes',
         }
         const data: Partial<StomatognathicData> = {}
         for (const r of parsed.regions || []) {
           const key = regionMap[r.id]
           if (key && r.finding) data[key] = r.finding
         }
         await saveStomatognathicExam(slug, patientId, data as any)
       }} className="space-y-6">
        
        <div className="card bg-white border border-gray-100 shadow-sm mx-4 md:mx-0 overflow-hidden rounded-[32px]">
          <div className="card-body p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Hallazgos Clínicos</h3>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
               <StomatognathicFields defaultValue={defaultValue} />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
               <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                   Describí las patologías o anomalías encontradas en cada región del sistema estomatognático.
                </p>
            </div>

            <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto btn btn-primary rounded-2xl font-black px-12 h-14 shadow-xl shadow-primary/20"
              >
                <Save className="w-5 h-5 mr-2" />
                GUARDAR EXAMEN
              </button>
              <Link
                href={`/${slug}/nursing/stomatognathic-exam`}
                className="w-full sm:w-auto btn btn-ghost border-gray-200 rounded-2xl h-14 font-black"
              >
                <X className="w-5 h-5 mr-2" />
                CANCELAR
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
