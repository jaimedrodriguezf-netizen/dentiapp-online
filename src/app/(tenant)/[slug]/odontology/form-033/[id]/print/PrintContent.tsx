'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { generatePrescriptionHTML, PrescriptionItem } from './printHelpers'
import OdontogramSVG, { ToothData } from '@/components/odontology/OdontogramSVG'
import { useTenant } from '@/hooks/useTenant'
import { TreatmentSessionData } from '../../../actions'
import { parseSessionFeedbacks } from '../../../sessionFeedbacksHelpers'

interface PatientData {
  first_name?: string | null
  last_name?: string | null
  cedula?: string | null
  birth_date?: string | null
  gender?: string | null
}

interface VitalSignsData {
  blood_pressure?: string | null
  heart_rate?: number | string | null
  respiratory_rate?: number | string | null
  temperature?: number | string | null
  spo2?: number | string | null
  weight?: number | string | null
  height?: number | string | null
  bmi?: number | string | null
}

interface OralHygieneData {
  rating?: string | null
  plaque_index?: number | null
}

interface DiagnosisData {
  code?: string
  description?: string
  text?: string
  type?: string
}

export interface DentalRecord {
  patients?: PatientData | null
  vital_signs?: VitalSignsData | null
  oral_hygiene?: OralHygieneData | null
  malocclusion?: string | { class?: string; overjet?: number; overbite?: number } | null
  opening_date?: string | null
  control_date?: string | null
  consultation_reason?: string | null
  current_problem?: { text?: string } | string | null
  personal_family_history?: string | null
  personal_history?: Record<string, boolean | string> | null
  family_history?: Record<string, boolean | string> | null
  stomatognathic_exam?: string | { regions?: Array<{ id: string; finding: string }>; free_text?: string } | null
  fluorosis?: string | null
  cpod_index?: { caries?: number; missing?: number; filled?: number; total?: number } | null
  ceod_index?: { caries?: number; extraction?: number; filled?: number; total?: number } | null
  complementary_exams?: string | Record<string, string> | null
  diagnostic_plan?: string | null
  educational_plan?: string | null
  therapeutic_plan?: string | null
  treatment?: { text?: string } | string | null
  pregnant?: boolean | null
  diagnosis?: DiagnosisData | null
}

interface PrintContentProps {
  record: DentalRecord
  teeth: ToothData[]
  prescriptions: PrescriptionItem[]
  sessions: TreatmentSessionData[]
  slug: string
  id: string
  type?: string
}

interface Html2PdfOptions {
  margin?: number | number[]
  filename?: string
  image?: { type: string; quality: number }
  html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean }
  jsPDF?: { unit: string; format: string; orientation: string }
}

interface Html2PdfWrapper {
  set: (options: Html2PdfOptions) => Html2PdfWrapper
  from: (element: HTMLElement) => Html2PdfWrapper
  save: () => Promise<void>
  output: (type: 'blob' | 'arraybuffer' | 'bloburl' | 'datauristring' | 'datauri' | 'dataurlstring') => Promise<Blob>
}

function calculateAgeAndCondition(birthDateStr: string | null | undefined) {
  if (!birthDateStr) return { value: '—', h: false, d: false, m: false, a: false }
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  
  const diffTime = today.getTime() - birthDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  
  if (diffHours < 24) {
    return { value: `${diffHours}`, h: true, d: false, m: false, a: false }
  }
  if (diffDays < 30) {
    return { value: `${diffDays}`, h: false, d: true, m: false, a: false }
  }
  
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
  if (today.getDate() < birthDate.getDate()) {
    months--
  }
  
  if (months < 12) {
    return { value: `${months}`, h: false, d: false, m: true, a: false }
  }
  
  const years = Math.floor(months / 12)
  return { value: `${years}`, h: false, d: false, m: false, a: true }
}

function splitName(name: string | null | undefined) {
  if (!name) return { first: '', second: '—' }
  const parts = name.trim().split(/\s+/)
  return {
    first: parts[0] || '',
    second: parts.slice(1).join(' ') || '—'
  }
}

export default function PrintContent({ record, teeth, prescriptions, sessions, slug, id, type }: PrintContentProps) {
  const { tenant } = useTenant()
  const printRef = useRef<HTMLDivElement>(null)
  const isPrescription = type === 'prescription'
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(!isPrescription)
  const [errorGenerating, setErrorGenerating] = useState(false)

  const handleDownloadPDF = () => {
    if (!pdfUrl) return
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `Formulario_033_${record.patients?.last_name || 'Paciente'}_${record.patients?.first_name || ''}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generación automática del PDF al montar la vista de impresión
  useEffect(() => {
    if (!isPrescription) {
      let active = true
      const timer = setTimeout(async () => {
        try {
          // Next.js 16 architectural requirement: 'use client' components are still pre-rendered 
          // on the server during Static Generation (SSG) and Server-Side Rendering (SSR). 
          // Because 'html2pdf.js' depends on browser-only globals (window, document, HTMLCanvasElement) 
          // at its module-level evaluation, it must be dynamically imported inside useEffect 
          // to completely bypass server-side execution and prevent build-time reference errors.
          const html2pdf = ((await import('html2pdf.js')).default) as unknown as () => Html2PdfWrapper
          const element = document.querySelector('.print-area') as HTMLElement | null

          if (!element) {
            if (active) setErrorGenerating(true)
            return
          }

          const opt: Html2PdfOptions = {
            margin: [10, 10, 10, 10],
            filename: `Formulario_033_${record.patients?.last_name || 'Paciente'}_${record.patients?.first_name || ''}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          }

          const pdfWorker = html2pdf().set(opt).from(element)
          const blob = await pdfWorker.output('blob')
          
          if (active) {
            const url = URL.createObjectURL(blob)
            setPdfUrl(url)
            setIsGenerating(false)
          }
        } catch (error) {
          console.error('Error generando vista previa PDF:', error)
          if (active) {
            setErrorGenerating(true)
            setIsGenerating(false)
          }
        }
      }, 1000)

      return () => {
        active = false
        clearTimeout(timer)
      }
    }
  }, [isPrescription, record])

  // Limpieza de URL en desmontaje
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  useEffect(() => {
    if (isPrescription && printRef.current) {
      printRef.current.innerHTML = generatePrescriptionHTML(
        record as unknown as Parameters<typeof generatePrescriptionHTML>[0],
        prescriptions,
        tenant
      )
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isPrescription, record, prescriptions, tenant])

  if (isPrescription) {
    return (
      <div>
        <style>{`
          @media print {
            .no-print, header, aside, .drawer-side, .drawer-toggle, [role="navigation"], .navbar {
              display: none !important;
            }
            .drawer, .drawer-content, main, .flex-1, .mx-auto, .print-container {
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              overflow: visible !important;
              position: static !important;
              display: block !important;
            }
            html, body {
              background: white !important;
              color: black !important;
              overflow: visible !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>
        <div className="w-full p-4 no-print border-b border-gray-200 bg-white mb-6">
          <div className="max-w-[190mm] mx-auto flex items-center justify-between">
            <Link
              href={`/${slug}/odontology/form-033/${id}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <Printer className="w-4 h-4" />
              Imprimir Receta
            </button>
          </div>
        </div>
        <div ref={printRef} className="print-container" />
      </div>
    )
  }

  // Parse complex columns
  const parsedCurrentProblem = (() => {
    if (!record.current_problem) return '—'
    if (typeof record.current_problem === 'object') return record.current_problem.text || '—'
    return record.current_problem
  })()

  const parsedMalocclusion = (() => {
    try {
      if (!record.malocclusion) return null
      return typeof record.malocclusion === 'string' ? JSON.parse(record.malocclusion) : record.malocclusion
    } catch {
      return null
    }
  })()

  const malocclusionText = (() => {
    if (!parsedMalocclusion) return '—'
    if (typeof parsedMalocclusion === 'object') {
      return (parsedMalocclusion as { class?: string }).class || '—'
    }
    return String(parsedMalocclusion)
  })()

  const parsedStomatognathic = (() => {
    let regions: Array<{ id: string; finding: string }> = []
    let freeText = ''
    try {
      if (record.stomatognathic_exam) {
        const p = typeof record.stomatognathic_exam === 'string' ? JSON.parse(record.stomatognathic_exam) : record.stomatognathic_exam
        regions = p.regions || []
        freeText = p.free_text || ''
      }
    } catch {}
    return { regions, freeText }
  })()

  const compExams = (() => {
    try {
      if (!record.complementary_exams) return { hematology: '', blood_chemistry: '', xray: '', other: '' }
      if (typeof record.complementary_exams === 'object') return record.complementary_exams as Record<string, string>
      return JSON.parse(record.complementary_exams) as Record<string, string>
    } catch {
      return { hematology: '', blood_chemistry: '', xray: '', other: '' }
    }
  })()

  const ageData = calculateAgeAndCondition(record.patients?.birth_date)
  const splittedFirstName = splitName(record.patients?.first_name)
  const splittedLastName = splitName(record.patients?.last_name)

  return (
    <div>
      {/* Loader de PDF */}
      {!isPrescription && isGenerating && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="card bg-white shadow-xl shadow-slate-100 rounded-3xl border border-slate-100 p-8 max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center animate-bounce">
                <Printer className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Generando Documento PDF</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Formulario 033 — MSP Ecuador</p>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Estamos compilando el historial dental, diagramas clínicos y evolución del paciente en un archivo PDF de alta definición...
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 rounded-full animate-pulse" style={{
                animation: 'loading 1.5s infinite ease-in-out'
              }} />
            </div>
          </div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(150%); }
            }
          `}</style>
        </div>
      )}

      {/* Pantalla de Error */}
      {!isPrescription && errorGenerating && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="card bg-white shadow-xl shadow-slate-100 rounded-3xl border border-slate-100 p-8 max-w-md w-full space-y-6">
            <div className="flex justify-center text-red-500">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <Printer className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Error al Generar PDF</h3>
              <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Lo sentimos mucho</p>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              No pudimos generar el archivo PDF interactivo en memoria. Pero podés volver a intentarlo o volver a la vista del paciente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setErrorGenerating(false)
                  setIsGenerating(true)
                }}
                className="btn btn-primary flex-1 rounded-2xl font-black"
              >
                Reintentar
              </button>
              <Link
                href={`/${slug}/odontology/form-033/${id}`}
                className="btn btn-ghost border border-gray-200 flex-1 rounded-2xl font-bold"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Visor de PDF cuando está listo */}
      {!isPrescription && pdfUrl && (
        <div className="min-h-screen bg-slate-100 flex flex-col no-print">
          {/* Barra superior de navegación y acciones */}
          <div className="w-full p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-[210mm] mx-auto flex items-center justify-between">
              <Link
                href={`/${slug}/odontology/form-033/${id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Expediente
              </Link>
              <div className="text-center hidden md:block">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Vista Previa Oficial PDF</span>
                <strong className="text-xs text-gray-800 font-bold uppercase tracking-wide">
                  {record.patients?.last_name || 'Paciente'} {record.patients?.first_name || ''}
                </strong>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                <Printer className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Visor de PDF responsivo */}
          <div className="flex-1 flex justify-center p-0 md:p-6 w-full max-w-[210mm] mx-auto">
            {/* Vista para PC: Iframe de PDF interactivo */}
            <div className="hidden md:block w-full h-[calc(100vh-120px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-none"
                title="Vista previa del Formulario 033"
              />
            </div>

            {/* Vista para Móviles: Tarjeta premium con enlace directo */}
            <div className="md:hidden w-full px-4 py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="card bg-white shadow-xl rounded-3xl border border-slate-100 p-8 w-full space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Printer className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">PDF Listo</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vista móvil adaptada</p>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  En dispositivos móviles se recomienda abrir el PDF en una ventana nueva o descargarlo para visualizarlo con el visor de PDF nativo de tu sistema.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary rounded-2xl font-black text-xs uppercase w-full flex items-center justify-center"
                  >
                    Abrir PDF en pantalla completa
                  </a>
                  <button
                    onClick={handleDownloadPDF}
                    className="btn btn-outline border-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase w-full"
                  >
                    Descargar archivo PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled Printable Page Replica of Formulario 033 */}
      {/* Se mantiene siempre en el DOM pero oculto si no es receta */}
      <div className={!isPrescription ? "absolute opacity-0 pointer-events-none -z-50 left-[-9999px] top-[-9999px]" : ""}>
        <div className="print-area">
        <style>{`
          /* SCREEN STYLES: Beautiful paper-like preview card on screen */
          .form-033-print {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
            padding: 20px;
            max-width: 190mm;
            margin: 0 auto 20px;
            color: black;
            font-family: 'Courier New', Courier, monospace;
            font-size: 8px;
            line-height: 1.2;
          }
          .form-033-print table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            font-size: 7px;
          }
          .form-033-print th, .form-033-print td {
            border: 1px solid black;
            padding: 2px 4px;
            text-align: left;
            vertical-align: middle;
          }
          .form-033-print .section-title {
            background-color: #f1f5f9;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 8px;
            padding: 3px 5px;
            border: 1.5px solid black;
          }
          .form-033-print .label-sub {
            font-size: 6.5px;
            color: #4b5563;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .form-033-print .field-val {
            font-weight: bold;
            font-size: 8px;
            color: black;
          }
          .page-break-before {
            page-break-before: always;
          }

          .clinic-letterhead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 4px;
            margin-bottom: 8px;
            border-bottom: 1.5px solid black;
          }
          .clinic-logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .clinic-logo-img {
            height: 40px;
            width: auto;
            max-width: 120px;
            object-fit: contain;
          }
          .clinic-logo-placeholder {
            height: 35px;
            width: 35px;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #6b7280;
            font-size: 10px;
          }
          .clinic-info-left h1 {
            margin: 0;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: black;
          }
          .clinic-info-left p {
            margin: 2px 0 0 0;
            font-size: 7px;
            color: #4b5563;
            text-transform: uppercase;
            font-weight: bold;
          }
          .clinic-info-right {
            text-align: right;
            font-size: 7px;
            color: #374151;
            line-height: 1.3;
          }
          .clinic-info-right p {
            margin: 1px 0;
          }

          /* PRINT STYLES: Strips all browser layout components and styles for clean A4 printing */
          @media print {
            .no-print, header, aside, .drawer-side, .drawer-toggle, [role="navigation"] {
              display: none !important;
            }
            .drawer, .drawer-content, main, .flex-1, .mx-auto, .print-area {
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
              overflow: visible !important;
              position: static !important;
              display: block !important;
            }
            html, body {
              background: white !important;
              color: black !important;
              overflow: visible !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-area {
              width: 100% !important;
              display: block !important;
            }
            .form-033-print {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 auto !important;
              max-width: 100% !important;
              border-radius: 0 !important;
              font-size: 8px !important;
            }
            .form-033-print table {
              font-size: 7.2px !important;
              margin-bottom: 6px !important;
            }
            @page {
              margin: 8mm;
              size: A4;
            }
          }
        `}</style>

        <div className="form-033-print">
          {tenant && (
            <div className="clinic-letterhead">
              <div className="clinic-logo-container">
                {tenant.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="clinic-logo-img"
                  />
                ) : (
                  <div className="clinic-logo-placeholder">
                    {tenant.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="clinic-info-left">
                  <h1>{tenant.name}</h1>
                  <p>Establecimiento Odontológico</p>
                </div>
              </div>
              <div className="clinic-info-right">
                {tenant.address && (
                  <p><strong>Dirección:</strong> {tenant.address}</p>
                )}
                {tenant.phone && (
                  <p><strong>Teléfono:</strong> {tenant.phone}</p>
                )}
                <p style={{ color: '#9ca3af', fontSize: '6px', marginTop: '2px' }}>FORMULARIO 033 MSP (2021)</p>
              </div>
            </div>
          )}
          {/* HEADER & SECTION A */}
          <table>
            <thead>
              <tr>
                <th colSpan={64} className="section-title">
                  A. Datos del Establecimiento y Usuario / Paciente
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={13} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Institución del Sistema</div>
                </td>
                <td colSpan={6} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Unicódigo</div>
                </td>
                <td colSpan={13} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Establecimiento de Salud</div>
                </td>
                <td colSpan={17} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Número de Historia Clínica Única</div>
                </td>
                <td colSpan={10} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Número de Archivo</div>
                </td>
                <td colSpan={5} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">No. Hoja</div>
                </td>
              </tr>
              <tr>
                <td colSpan={13} className="text-center font-bold text-[8px] py-1 border border-black">IESS-SSC</td>
                <td colSpan={6} className="text-center font-bold text-[8px] py-1 border border-black">—</td>
                <td colSpan={13} className="text-center font-bold text-[8px] py-1 border border-black">{tenant?.name || 'DentiApp Clinic'}</td>
                <td colSpan={17} className="text-center font-bold text-[8px] py-1 border border-black">{record.patients?.cedula || '—'}</td>
                <td colSpan={10} className="text-center font-bold text-[8px] py-1 border border-black">H.O. - Hoja 1</td>
                <td colSpan={5} className="text-center font-bold text-[8px] py-1 border border-black">1</td>
              </tr>
              <tr>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Primer Apellido</div>
                </td>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Segundo Apellido</div>
                </td>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Primer Nombre</div>
                </td>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black">
                  <div className="label-sub">Segundo Nombre</div>
                </td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center">
                  <div className="label-sub">Sexo</div>
                </td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center">
                  <div className="label-sub">Edad</div>
                </td>
                <td colSpan={8} className="text-center font-bold text-[6.5px] py-0.5 bg-[#f1f5f9] border border-black uppercase">
                  Condición Edad (Marcar)
                </td>
              </tr>
              <tr>
                {/* Row 5: Empty cells below the headers, and H, D, M, A */}
                <td colSpan={12} className="border border-black bg-white"></td>
                <td colSpan={12} className="border border-black bg-white"></td>
                <td colSpan={12} className="border border-black bg-white"></td>
                <td colSpan={12} className="border border-black bg-white"></td>
                <td colSpan={4} className="border border-black bg-white"></td>
                <td colSpan={4} className="border border-black bg-white"></td>
                <td colSpan={3} className="text-center font-bold text-[6.5px] py-0.5 bg-[#f1f5f9] border border-black">H</td>
                <td colSpan={1} className="text-center font-bold text-[6.5px] py-0.5 bg-[#f1f5f9] border border-black">D</td>
                <td colSpan={2} className="text-center font-bold text-[6.5px] py-0.5 bg-[#f1f5f9] border border-black">M</td>
                <td colSpan={2} className="text-center font-bold text-[6.5px] py-0.5 bg-[#f1f5f9] border border-black">A</td>
              </tr>
              <tr>
                {/* Values row matching row 6 of Excel */}
                <td colSpan={12} className="text-center font-bold text-[8.5px] py-1 border border-black">{splittedLastName.first}</td>
                <td colSpan={12} className="text-center font-bold text-[8.5px] py-1 border border-black">{splittedLastName.second}</td>
                <td colSpan={12} className="text-center font-bold text-[8.5px] py-1 border border-black">{splittedFirstName.first}</td>
                <td colSpan={12} className="text-center font-bold text-[8.5px] py-1 border border-black">{splittedFirstName.second}</td>
                <td colSpan={4} className="text-center font-bold text-[8.5px] py-1 border border-black uppercase">{record.patients?.gender || '—'}</td>
                <td colSpan={4} className="text-center font-bold text-[8.5px] py-1 border border-black">{ageData.value}</td>
                <td colSpan={3} className="text-center font-black text-[9.5px] py-0.5 border border-black">{ageData.h ? 'X' : ''}</td>
                <td colSpan={1} className="text-center font-black text-[9.5px] py-0.5 border border-black">{ageData.d ? 'X' : ''}</td>
                <td colSpan={2} className="text-center font-black text-[9.5px] py-0.5 border border-black">{ageData.m ? 'X' : ''}</td>
                <td colSpan={2} className="text-center font-black text-[9.5px] py-0.5 border border-black">{ageData.a ? 'X' : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* SECTION B: MOTIVO DE CONSULTA */}
          <table>
            <thead>
              <tr>
                <th colSpan={46} className="section-title">B. Motivo de Consulta</th>
                <th colSpan={10} className="text-center font-bold text-[7.2px] border border-black uppercase bg-[#f1f5f9]">Embarazada</th>
                <th colSpan={2} className="text-center font-bold text-[7.2px] border border-black bg-[#f1f5f9]">SÍ</th>
                <th colSpan={2} className="text-center font-black text-[9px] border border-black bg-white">{record.pregnant ? 'X' : ''}</th>
                <th colSpan={2} className="text-center font-bold text-[7.2px] border border-black bg-[#f1f5f9]">NO</th>
                <th colSpan={2} className="text-center font-black text-[9px] border border-black bg-white">{!record.pregnant ? 'X' : ''}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={64} className="min-h-[20px] font-bold p-2 align-top">
                  {record.consultation_reason || '—'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION C: ENFERMEDAD ACTUAL */}
          <table>
            <thead>
              <tr>
                <th className="section-title">C. Enfermedad o Problema Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="min-h-[30px] font-bold p-2 align-top whitespace-pre-wrap">
                  {parsedCurrentProblem}
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION D: ANTECEDENTES PERSONALES */}
          <table>
            <thead>
              <tr>
                <th colSpan={64} className="section-title">D. Antecedentes Patológicos Personales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">1. ALERGIA ANTIBIÓTICO</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.allergy_antibiotic ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">2. ALERGIA ANESTESIA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.allergy_anesthesia ? 'X' : ''}</td>
                <td colSpan={6} className="align-middle"><div className="text-[6.5px] font-bold">3. HEMORRAGIAS</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.hemorrhages ? 'X' : ''}</td>
                <td colSpan={3} className="align-middle"><div className="text-[6.5px] font-bold">4. VIH / SIDA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.hiv ? 'X' : ''}</td>
                <td colSpan={6} className="align-middle"><div className="text-[6.5px] font-bold">5. TUBERCULOSIS</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.tuberculosis ? 'X' : ''}</td>
                <td colSpan={3} className="align-middle"><div className="text-[6.5px] font-bold">6. ASMA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.asthma ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">7. DIABETES</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.diabetes ? 'X' : ''}</td>
                <td colSpan={6} className="align-middle"><div className="text-[6.5px] font-bold">8. HIPERTENSIÓN</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.hypertension ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">9. ENF. CARDÍACA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.heart_disease ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">10. OTRO: {record.personal_history?.other_text || ''}</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.personal_history?.other ? 'X' : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* SECTION E: ANTECEDENTES FAMILIARES */}
          <table>
            <thead>
              <tr>
                <th colSpan={64} className="section-title">E. Antecedentes Patológicos Familiares</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="align-middle"><div className="text-[6.5px] font-bold">1. CARDIOPATÍA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.cardiopathy ? 'X' : ''}</td>
                <td colSpan={5} className="align-middle"><div className="text-[6.5px] font-bold">2. HIPERTENSIÓN</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.hypertension ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">3. ENF. C. VASCULAR</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.vascular_disease ? 'X' : ''}</td>
                <td colSpan={5} className="align-middle"><div className="text-[6.5px] font-bold">4. ENDÓCRINO MET.</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.endocrine ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">5. CÁNCER</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.cancer ? 'X' : ''}</td>
                <td colSpan={6} className="align-middle"><div className="text-[6.5px] font-bold">6. TUBERCULOSIS</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.tuberculosis ? 'X' : ''}</td>
                <td colSpan={3} className="align-middle"><div className="text-[6.5px] font-bold">7. ENF. MENTAL</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.mental_illness ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">8. ENF. INFECCIOSA</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.infectious_disease ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">9. MAL FORMACIÓN</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.malformation ? 'X' : ''}</td>
                <td colSpan={4} className="align-middle"><div className="text-[6.5px] font-bold">10. OTRO: {record.family_history?.other_text || ''}</div></td>
                <td colSpan={2} className="text-center align-middle font-black text-[8.5px]">{record.family_history?.other ? 'X' : ''}</td>
              </tr>
            </tbody>
          </table>

          {/* SECTION F: CONSTANTES VITALES */}
          <table>
            <thead>
              <tr>
                <th colSpan={64} className="section-title">F. Constantes Vitales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="bg-[#f1f5f9]"><span className="label-sub">TEMPERATURA °C</span></td>
                <td colSpan={8} className="font-bold">{record.vital_signs?.temperature ? `${record.vital_signs.temperature} °C` : '—'}</td>
                <td colSpan={8} className="bg-[#f1f5f9]"><span className="label-sub">PULSO / min.</span></td>
                <td colSpan={9} className="font-bold">{record.vital_signs?.heart_rate ? `${record.vital_signs.heart_rate} lpm` : '—'}</td>
                <td colSpan={8} className="bg-[#f1f5f9]"><span className="label-sub">FREC. RESPIRATORIA</span></td>
                <td colSpan={6} className="font-bold">{record.vital_signs?.respiratory_rate ? `${record.vital_signs.respiratory_rate} rpm` : '—'}</td>
                <td colSpan={8} className="bg-[#f1f5f9]"><span className="label-sub">PRES. ARTERIAL (mmHg)</span></td>
                <td colSpan={9} className="font-bold">{record.vital_signs?.blood_pressure ? `${record.vital_signs.blood_pressure} mmHg` : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* SECTION G: EXAMEN DEL SISTEMA ESTOMATOGNÁTICO */}
          <table>
            <thead>
              <tr>
                <th colSpan={47} className="section-title">G. Examen del Sistema Estomatognático</th>
                <th colSpan={17} className="text-center font-bold text-[6px] border border-black uppercase bg-[#f1f5f9]">Describir la patología de la región afectada registrando el número</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Impares */}
              <tr>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">1</td>
                <td colSpan={5} className="font-bold text-[6.5px]">LABIOS</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '1')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">3</td>
                <td colSpan={7} className="font-bold text-[6.5px]">MAXILAR SUPERIOR</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '3')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">5</td>
                <td colSpan={5} className="font-bold text-[6.5px]">LENGUA</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '5')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">7</td>
                <td colSpan={7} className="font-bold text-[6.5px]">PISO DE LA BOCA</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '7')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">9</td>
                <td colSpan={1} className="bg-[#f1f5f9]"></td>
                <td colSpan={7} className="font-bold text-[6.5px]">GLÁNDULAS SALIV.</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '9')?.finding || ''}</td>
                <td colSpan={2} className="text-center font-bold bg-[#f1f5f9]">11</td>
                <td colSpan={5} className="font-bold text-[6.5px]">A. T. M.</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '11')?.finding || ''}</td>
                <td colSpan={2} className="text-center font-bold bg-[#f1f5f9]">13</td>
                <td colSpan={4} className="font-bold text-[6.5px]">OTROS</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '13')?.finding || ''}</td>
              </tr>
              {/* Row 2: Pares */}
              <tr>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">2</td>
                <td colSpan={5} className="font-bold text-[6.5px]">MEJILLAS</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '2')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">4</td>
                <td colSpan={7} className="font-bold text-[6.5px]">MAXILAR INFERIOR</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '4')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">6</td>
                <td colSpan={5} className="font-bold text-[6.5px]">PALADAR</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '6')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">8</td>
                <td colSpan={7} className="font-bold text-[6.5px]">CARRILLOS</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '8')?.finding || ''}</td>
                <td colSpan={1} className="text-center font-bold bg-[#f1f5f9]">10</td>
                <td colSpan={1} className="bg-[#f1f5f9]"></td>
                <td colSpan={7} className="font-bold text-[6.5px]">ORO FARINGE</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '10')?.finding || ''}</td>
                <td colSpan={2} className="text-center font-bold bg-[#f1f5f9]">12</td>
                <td colSpan={5} className="font-bold text-[6.5px]">GANGLIOS</td>
                <td colSpan={2} className="text-center font-black text-[7.5px] uppercase">{parsedStomatognathic.regions.find(r => r.id === '12')?.finding || ''}</td>
                <td colSpan={8} className="bg-white border border-black"></td>
              </tr>
            </tbody>
          </table>

          {parsedStomatognathic.freeText && (
            <div className="border border-black p-2 font-bold mb-2 text-[7px] uppercase">
              Descripción patologías examen clínico: <span className="text-gray-900 normal-case font-bold">{parsedStomatognathic.freeText}</span>
            </div>
          )}

          {/* SECTION H: ODONTOGRAMA */}
          <table>
            <thead>
              <tr>
                <th className="section-title">H. Odontograma</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 bg-white flex justify-center">
                  <div className="w-full max-w-[400px]">
                    <OdontogramSVG
                      teeth={teeth}
                      onToothClick={() => {}}
                      onSurfaceClick={() => {}}
                      selectedTooth={null}
                      variant="msp"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION I & J: INDICADORES DE SALUD BUCAL Y ÍNDICES CPO-ceo */}
          <table>
            <thead>
              <tr>
                <th colSpan={48} className="section-title">I. INDICADORES DE SALUD BUCAL</th>
                <th colSpan={16} className="section-title">J. ÍNDICES CPO-ceo</th>
              </tr>
            </thead>
            <tbody>
              {/* ── Row 0: sub-section title headers ── */}
              <tr>
                <td colSpan={24} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5 uppercase">Higiene Oral Simplificada</td>
                <td colSpan={8}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5 uppercase">Enfermedad Periodontal</td>
                <td colSpan={8}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5 uppercase">Tipos de Oclusión</td>
                <td colSpan={8}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5 uppercase">Nivel de Fluorosis</td>
                <td rowSpan={2} colSpan={3}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-1">D</td>
                <td colSpan={3}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">C</td>
                <td colSpan={3}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">P</td>
                <td colSpan={3}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">O</td>
                <td colSpan={4}  className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">TOTAL CPO-D</td>
              </tr>

              {/* ── Row 1: column sub-headers + LEVE + CPO-D values ── */}
              <tr>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">PIEZAS DENTALES EXAMINADAS</td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">PLACA<br/><span className="font-normal">0–1–2–3–9</span></td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">CÁLCULO<br/><span className="font-normal">0–1–2–3</span></td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">GINGIVITIS<br/><span className="font-normal">0–1</span></td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">LEVE</td>
                <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{(record as Record<string,unknown>).periodontal_disease === 'leve' ? '✓' : ''}</td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">ANGLE I</td>
                <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{malocclusionText === 'Clase I' ? '✓' : ''}</td>
                <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">LEVE</td>
                <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{record.fluorosis === 'leve' ? '✓' : ''}</td>
                <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.cpod_index?.caries ?? 0}</td>
                <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.cpod_index?.missing ?? 0}</td>
                <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.cpod_index?.filled ?? 0}</td>
                <td colSpan={4} className="font-bold border border-black py-0.5 text-center bg-[#f1f5f9] text-[8px]">{record.cpod_index?.total ?? 0}</td>
              </tr>

              {/* ── Teeth rows: each group has tooth numbers + 1 cell each for placa/cálculo/gingivitis ── */}
              {([
                { teeth: [16,17,55], key: 'r1', extra: (
                  <>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">MODERADA</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{(record as Record<string,unknown>).periodontal_disease === 'moderada' ? '✓' : ''}</td>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">ANGLE II</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{malocclusionText === 'Clase II' ? '✓' : ''}</td>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">MODERADA</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{record.fluorosis === 'moderada' ? '✓' : ''}</td>
                    <td rowSpan={2} colSpan={3} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-1">d</td>
                    <td colSpan={3} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">c</td>
                    <td colSpan={3} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">e</td>
                    <td colSpan={3} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">o</td>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">TOTAL ceo-d</td>
                  </>
                )},
                { teeth: [11,21,51], key: 'r2', extra: (
                  <>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">SEVERA</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{(record as Record<string,unknown>).periodontal_disease === 'severa' ? '✓' : ''}</td>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">ANGLE III</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{malocclusionText === 'Clase III' ? '✓' : ''}</td>
                    <td colSpan={4} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5">SEVERA</td>
                    <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{record.fluorosis === 'severa' ? '✓' : ''}</td>
                    <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.ceod_index?.caries ?? 0}</td>
                    <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.ceod_index?.extraction ?? 0}</td>
                    <td colSpan={3} className="font-bold border border-black py-0.5 text-center text-[8px]">{record.ceod_index?.filled ?? 0}</td>
                    <td colSpan={4} className="font-bold border border-black py-0.5 text-center bg-[#f1f5f9] text-[8px]">{record.ceod_index?.total ?? 0}</td>
                  </>
                )},
                { teeth: [26,27,65], key: 'r3', extra: (
                  <td rowSpan={5} colSpan={40} className="border border-black p-1 align-top bg-white">
                    {/* Título de Simbología */}
                    <div className="bg-[#f1f5f9] text-center font-bold text-[6.5px] py-0.5 border-b border-black uppercase mb-1">
                      K. SIMBOLOGÍA DEL ODONTOGRAMA
                    </div>
                    
                    {/* Grid de 4 columnas */}
                    <div className="grid grid-cols-4 gap-x-1.5 gap-y-0.5 text-[5.8px] font-bold leading-tight">
                      {/* Fila 1 */}
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">Ü rojo</span>
                        <span className="uppercase text-gray-800">SELLANTE NECESARIO</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">U</span>
                        <span className="uppercase text-gray-800">PÉRDIDA (OTRA CAUSA)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">═</span>
                        <span className="uppercase text-gray-800">PRÓTESIS TOTAL IND.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">═</span>
                        <span className="uppercase text-gray-800">PRÓTESIS TOTAL REAL.</span>
                      </div>

                      {/* Fila 2 */}
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">Ü azul</span>
                        <span className="uppercase text-gray-800">SELLANTE REALIZADO</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">r</span>
                        <span className="uppercase text-gray-800">ENDODONCIA POR REAL.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">ª</span>
                        <span className="uppercase text-gray-800">CORONA INDICADA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">ª</span>
                        <span className="uppercase text-gray-800">CORONA REALIZADA</span>
                      </div>

                      {/* Fila 3 */}
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">X rojo</span>
                        <span className="uppercase text-gray-800">EXTRACCIÓN IND.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">r</span>
                        <span className="uppercase text-gray-800">ENDODONCIA REALIZADA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">■ azul</span>
                        <span className="uppercase text-gray-800">OBTURADO</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">¨---¨</span>
                        <span className="uppercase text-gray-800">PRÓTESIS FIJA REAL.</span>
                      </div>

                      {/* Fila 4 */}
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">■ rojo</span>
                        <span className="uppercase text-gray-800">CARIES</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">¨---¨</span>
                        <span className="uppercase text-gray-800">PRÓTESIS FIJA IND.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">X azul</span>
                        <span className="uppercase text-gray-800">PÉRDIDA POR CARIES</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#ef4444'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">(-----)</span>
                        <span className="uppercase text-gray-800">PRÓTESIS REMOV. IND.</span>
                      </div>

                      {/* Fila 5 */}
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">(-----)</span>
                        <span className="uppercase text-gray-800">PRÓTESIS REMOV. REAL.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{color:'#3b82f6'}} className="w-8 text-center font-extrabold text-[7px] shrink-0">A</span>
                        <span className="uppercase text-gray-800">AUSENTE</span>
                      </div>
                      <div className="col-span-2"></div>
                    </div>

                    {/* Nota de superficies */}
                    <div className="text-center text-[5px] text-gray-400 font-bold border-t border-gray-200 mt-0.5 pt-0.5">
                      * Superficie: V=Vestibular D=Distal M=Mesial L=Lingual/Palatino O=Oclusal/Incisal
                    </div>
                  </td>
                )},
                { teeth: [36,37,75], key: 'r4', extra: null },
                { teeth: [31,41,71], key: 'r5', extra: null },
                { teeth: [46,47,85], key: 'r6', extra: null },
              ] as { teeth: number[]; key: string; extra: React.ReactNode }[]).map(({ teeth, key, extra }) => (
                <tr key={key}>
                  <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{teeth[0]}</td>
                  <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{teeth[1]}</td>
                  <td colSpan={4} className="border border-black text-center font-bold text-[8px] py-0.5">{teeth[2]}</td>
                  <td colSpan={4} className="border border-black text-center text-[8px] py-0.5">
                    {(record.oral_hygiene as Record<string,unknown>|null|undefined)?.[`plaque_row_${key}`] as string ?? ''}
                  </td>
                  <td colSpan={4} className="border border-black text-center text-[8px] py-0.5">
                    {(record.oral_hygiene as Record<string,unknown>|null|undefined)?.[`calculus_row_${key}`] as string ?? ''}
                  </td>
                  <td colSpan={4} className="border border-black text-center text-[8px] py-0.5">
                    {(record.oral_hygiene as Record<string,unknown>|null|undefined)?.[`gingivitis_row_${key}`] as string ?? ''}
                  </td>
                  {extra}
                </tr>
              ))}

              {/* ── TOTALES ── */}
              <tr>
                <td colSpan={12} className="bg-[#f1f5f9] border border-black text-center font-bold text-[7px] py-0.5 uppercase">TOTALES</td>
                <td colSpan={4}  className="border border-black text-center font-bold text-[8px] py-0.5">{(record.oral_hygiene as Record<string,unknown>|null|undefined)?.total_plaque as string ?? ''}</td>
                <td colSpan={4}  className="border border-black text-center font-bold text-[8px] py-0.5">{(record.oral_hygiene as Record<string,unknown>|null|undefined)?.total_calculus as string ?? ''}</td>
                <td colSpan={4}  className="border border-black text-center font-bold text-[8px] py-0.5">{(record.oral_hygiene as Record<string,unknown>|null|undefined)?.total_gingivitis as string ?? ''}</td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* ─── PÁGINA 2 OFICIAL DEL FORMULARIO 033 ─── */}
        <div className="page-break-before">
          <div className="form-033-print">
            {/* Cabecera de identificación de la Página 2 */}
            <div className="flex justify-between items-center bg-[#f1f5f9] border border-black p-2 mb-4 font-bold text-[7.5px] uppercase tracking-wide">
              <span>Paciente: {record.patients?.last_name || '—'} {record.patients?.first_name || '—'}</span>
              <span>Cédula / Historia Clínica: {record.patients?.cedula || '—'}</span>
              <span>Formulario 033 — Página 2</span>
            </div>

            {/* SECCIÓN L: EXÁMENES COMPLEMENTARIOS */}
            <table>
              <thead>
                <tr>
                  <th colSpan={4} className="section-title">L. Exámenes Complementarios</th>
                </tr>
                <tr className="bg-[#f1f5f9] font-bold text-[6.8px] text-center">
                  <th className="border border-black py-1 w-1/4">1. Hematología</th>
                  <th className="border border-black py-1 w-1/4">2. Bioquímica Sanguínea</th>
                  <th className="border border-black py-1 w-1/4">3. Radiográfico (Rx)</th>
                  <th className="border border-black py-1 w-1/4">4. Otro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-[7.5px] text-center h-[35px]">
                  <td className="border border-black p-2 align-top">{compExams.hematology || '—'}</td>
                  <td className="border border-black p-2 align-top">{compExams.blood_chemistry || '—'}</td>
                  <td className="border border-black p-2 align-top">{compExams.xray || '—'}</td>
                  <td className="border border-black p-2 align-top">{compExams.other || '—'}</td>
                </tr>
              </tbody>
            </table>

            {/* SECCIÓN M: PLANES DE TRATAMIENTO */}
            <table>
              <thead>
                <tr>
                  <th colSpan={4} className="section-title">M. Planes de Tratamiento</th>
                </tr>
                <tr className="bg-[#f1f5f9] font-bold text-[6.8px] text-center">
                  <th className="border border-black py-1 w-1/4">1. Diagnóstico</th>
                  <th className="border border-black py-1 w-1/4">2. Preventivo</th>
                  <th className="border border-black py-1 w-1/4">3. Terapéutico</th>
                  <th className="border border-black py-1 w-1/4">4. Educativo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold text-[7.5px] text-center h-[45px]">
                  <td className="border border-black p-2 align-top">{record.diagnostic_plan || '—'}</td>
                  <td className="border border-black p-2 align-top">{record.educational_plan || '—'}</td>
                  <td className="border border-black p-2 align-top">{record.therapeutic_plan || '—'}</td>
                  <td className="border border-black p-2 align-top">{record.treatment && (typeof record.treatment === 'object' ? record.treatment.text : String(record.treatment)) || '—'}</td>
                </tr>
              </tbody>
            </table>

            {/* SECCIÓN N: EVOLUCIÓN Y TRATAMIENTO */}
            <table>
              <thead>
                <tr>
                  <th colSpan={5} className="section-title">N. Evolución y Tratamiento</th>
                </tr>
                <tr className="bg-[#f1f5f9] font-bold text-[6.8px] text-center">
                  <th className="border border-black py-1 w-[8%]">Sesión</th>
                  <th className="border border-black py-1 w-[12%]">Fecha</th>
                  <th className="border border-black py-1 w-[40%]">Diagnósticos y Complicaciones</th>
                  <th className="border border-black py-1 w-[30%]">Procedimientos</th>
                  <th className="border border-black py-1 w-[10%]">Firma</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const { cleanDiagnosis } = parseSessionFeedbacks(session.diagnoses_complications)
                  const dateStr = session.session_date ? new Date(session.session_date).toLocaleDateString('es-EC') : '—'
                  return (
                    <tr key={session.id} className="font-bold text-[7.5px]">
                      <td className="border border-black text-center py-1">{session.session_number}</td>
                      <td className="border border-black text-center py-1">{dateStr}</td>
                      <td className="border border-black p-1.5 whitespace-pre-wrap leading-relaxed">{cleanDiagnosis || '—'}</td>
                      <td className="border border-black p-1.5 whitespace-pre-wrap leading-relaxed">{session.procedures || '—'}</td>
                      <td className="border border-black text-center py-1 h-9">
                        {session.signature ? (
                          <span className="text-[5.5px] font-black text-green-700 bg-green-50 px-1 py-0.5 rounded border border-green-200 uppercase tracking-tight">
                            Firmado Digital
                          </span>
                        ) : (
                          <div className="h-5 w-12 border-b border-gray-200 mx-auto" />
                        )}
                      </td>
                    </tr>
                  )
                })}
                {/* Rellenar con filas de evolución en blanco hasta al menos 3 registros si hay menos */}
                {sessions.length < 3 && Array.from({ length: 3 - sessions.length }).map((_, i) => (
                  <tr key={`empty-evol-${i}`} className="text-gray-300 text-[7px] h-9">
                    <td className="border border-black text-center py-2">{sessions.length + i + 1}</td>
                    <td className="border border-black text-center py-2">—</td>
                    <td className="border border-black p-2">—</td>
                    <td className="border border-black p-2">—</td>
                    <td className="border border-black text-center py-2">
                      <div className="h-4 border-b border-dashed border-gray-300 w-12 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SECCIÓN O: PRESCRIPCIÓN Y FARMACOTERAPIA */}
            {prescriptions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th colSpan={4} className="section-title">O. Prescripción (Farmacoterapia)</th>
                  </tr>
                  <tr className="bg-[#f1f5f9] font-bold text-[6.8px] text-center">
                    <th className="border border-black py-1 w-[40%]">Medicamento / Presentación</th>
                    <th className="border border-black py-1 w-[15%]">Cantidad</th>
                    <th className="border border-black py-1 w-[25%]">Dosis / Frecuencia / Duración</th>
                    <th className="border border-black py-1 w-[20%]">Indicaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, idx) => (
                    <tr key={idx} className="font-bold text-[7.5px]">
                      <td className="border border-black p-1.5">{rx.medication_name}</td>
                      <td className="border border-black text-center py-1">{rx.quantity || '—'}</td>
                      <td className="border border-black text-center py-1">
                        {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' — ')}
                      </td>
                      <td className="border border-black p-1.5 italic">{rx.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="section-title">O. Prescripción (Farmacoterapia)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-400 text-center font-bold py-2 text-[7.2px]">
                    <td>No se registraron prescripciones farmacológicas en esta ficha.</td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* ÁREA DE FIRMAS DE LA SEGUNDA HOJA */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center pt-8 border-t border-black font-bold text-[8px] uppercase">
                Firma del Profesional Responsable
              </div>
              <div className="text-center pt-8 border-t border-black font-bold text-[8px] uppercase">
                Firma del Usuario / Paciente
              </div>
            </div>

            {/* PIE DE PÁGINA */}
            <div className="text-center text-[7px] text-gray-400 font-bold uppercase tracking-wider mt-8 border-t border-gray-150 pt-2">
              Generado automáticamente en cumplimiento con el Formulario 033 MSP Ecuador — {new Date().toLocaleDateString('es-EC')}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
