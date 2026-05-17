'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

export default function PrintContent({ record, teeth, prescriptions, slug, id }: any) {
  const printRef = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderPrint()
    }, 300)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function renderPrint() {
    const el = printRef.current
    if (!el) return

    const patient = record.patients as any
    const vs = record.vital_signs
    const oh = record.oral_hygiene
    const mal = (() => { try { return record.malocclusion ? JSON.parse(record.malocclusion) : null } catch { return null } })()

    el.innerHTML = `
      <style>
        @page { margin: 1.5cm; size: A4; }
        * { box-sizing: border-box; }
        .print-form { max-width: 190mm; margin: 0 auto; padding: 0; font-family: 'Courier New', 'Courier', monospace; color: #000; }
        .print-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
        .print-header h1 { font-size: 14pt; font-weight: bold; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px; }
        .print-header p { font-size: 9pt; margin: 0; color: #444; }
        .print-section { margin-bottom: 12px; page-break-inside: avoid; }
        .print-section h3 { font-size: 10pt; font-weight: bold; margin: 0 0 3px; border-bottom: 1px solid #999; padding-bottom: 2px; }
        .print-section p, .print-section > div { font-size: 9pt; margin: 0 0 2px; line-height: 1.35; }
        .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; font-size: 9pt; }
        .print-label { color: #555; }
        .print-chip { display: inline-block; border: 1px solid #555; padding: 0 5px; font-size: 8pt; font-weight: bold; margin-right: 3px; background: #eee; }
        .print-rx { border: 1px solid #999; padding: 6px 8px; margin-bottom: 5px; }
        .print-rx h4 { font-size: 9pt; margin: 0 0 2px; }
        .print-rx p { font-size: 8pt; margin: 0; }
        .print-signature { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .print-signature div { border-top: 1px solid #000; padding-top: 3px; font-size: 8pt; text-align: center; margin-top: 30px; }
        .print-footer { text-align: center; font-size: 7pt; color: #999; margin-top: 16px; border-top: 1px solid #ddd; padding-top: 6px; }
      </style>

      <div class="print-header">
        <h1>Historia Clínica Odontológica</h1>
        <p>Formulario 033 — MSP Ecuador</p>
      </div>

      <div class="print-section">
        <div class="print-grid">
          <div><span class="print-label">Paciente:</span> ${esc(patient?.first_name || '')} ${esc(patient?.last_name || '')}</div>
          <div><span class="print-label">Cédula:</span> ${esc(patient?.cedula || '—')}</div>
          <div><span class="print-label">Apertura:</span> ${record.opening_date || '—'}</div>
          <div><span class="print-label">Control:</span> ${record.control_date || '—'}</div>
        </div>
      </div>

      ${sec('1. Motivo de consulta', record.consultation_reason)}
      ${sec('2. Problema actual', record.current_problem?.text || record.current_problem)}
      ${sec('3. Antecedentes personales y familiares', record.personal_family_history)}
      ${sec('4. Plan diagnóstico', record.diagnostic_plan)}

      ${diag(record.diagnosis)}

      <div class="print-section">
        <h3>5. Signos vitales</h3>
        ${vs ? `<div class="print-grid">${[
          vs.blood_pressure && `<div><span class="print-label">TA:</span> ${esc(vs.blood_pressure)} mmHg</div>`,
          vs.heart_rate && `<div><span class="print-label">FC:</span> ${vs.heart_rate} lpm</div>`,
          vs.respiratory_rate && `<div><span class="print-label">FR:</span> ${vs.respiratory_rate} rpm</div>`,
          vs.temperature && `<div><span class="print-label">Temp:</span> ${vs.temperature} °C</div>`,
          vs.spo2 && `<div><span class="print-label">SpO2:</span> ${vs.spo2}%</div>`,
          vs.weight && `<div><span class="print-label">Peso:</span> ${vs.weight} kg</div>`,
          vs.height && `<div><span class="print-label">Talla:</span> ${vs.height} cm</div>`,
          vs.bmi && `<div><span class="print-label">IMC:</span> ${vs.bmi}</div>`,
        ].filter(Boolean).join('')}</div>` : '<p>—</p>'}
      </div>

      <div class="print-section">
        <h3>6. Examen clínico</h3>
        ${[
          record.stomatognathic_exam && `<p><span class="print-label">Estomatognático:</span> ${esc(record.stomatognathic_exam)}</p>`,
          oh?.rating && `<p><span class="print-label">Higiene oral:</span> ${esc(oh.rating)}${oh.plaque_index != null ? ` (Índice: ${oh.plaque_index}%)` : ''}</p>`,
          record.fluorosis && `<p><span class="print-label">Fluorosis:</span> ${esc(record.fluorosis)}</p>`,
          mal && `<p><span class="print-label">Maloclusión:</span> ${mal.class || '—'}${mal.overjet != null ? ` | Overjet: ${mal.overjet}mm` : ''}${mal.overbite != null ? ` | Overbite: ${mal.overbite}mm` : ''}</p>`,
        ].filter(Boolean).join('') || '<p>—</p>'}
      </div>

      <div class="print-section">
        <h3>7. Índices CPO-D / CEO-D</h3>
        <div class="print-grid">
          ${record.cpod_index ? `<div><span class="print-label">CPO-D:</span> C:${record.cpod_index.caries} P:${record.cpod_index.missing} O:${record.cpod_index.filled} Total:${record.cpod_index.total}</div>` : ''}
          ${record.ceod_index ? `<div><span class="print-label">CEO-D:</span> C:${record.ceod_index.caries} E:${record.ceod_index.extraction} O:${record.ceod_index.filled} Total:${record.ceod_index.total}</div>` : ''}
        </div>
      </div>

      ${sec('8. Plan terapéutico', record.therapeutic_plan)}
      ${sec('9. Plan educativo', record.educational_plan)}
      ${sec('10. Tratamiento realizado', record.treatment?.text || record.treatment)}

      ${prescriptions.length > 0 ? `
      <div class="print-section">
        <h3>Receta médica</h3>
        ${prescriptions.map((rx: any) => `
          <div class="print-rx">
            <h4>${esc(rx.medication_name)}</h4>
            <p>${[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' — ')}${rx.quantity ? ` | Cant: ${rx.quantity}` : ''}</p>
            ${rx.instructions ? `<p style="margin-top:2px"><em>${esc(rx.instructions)}</em></p>` : ''}
          </div>
        `).join('')}
      </div>` : ''}

      <div class="print-signature">
        <div>Firma del profesional</div>
        <div>Firma del paciente</div>
      </div>

      <div class="print-footer">
        Generado por DentiApp Online — ${new Date().toLocaleDateString('es-EC')}
      </div>
    `

    // Auto-trigger print
    setTimeout(() => window.print(), 100)
  }

  function sec(title: string, content: any) {
    const text = typeof content === 'object' && content !== null ? content.text : content
    if (!text) return ''
    return `<div class="print-section"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`
  }

  function diag(diag: any) {
    if (!diag) return ''
    if (diag.code) {
      return `<div class="print-section"><h3>6. Diagnóstico (CIE-10)</h3><p><span class="print-chip">${esc(diag.code)}</span> ${esc(diag.description || '')}</p>${diag.text ? `<p>${esc(diag.text)}</p>` : ''}</div>`
    }
    return sec('6. Diagnóstico', diag)
  }

  function esc(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto p-4 no-print">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/${slug}/odontology/form-033/${id}`}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Imprimir Formulario 033</h2>
            <p className="text-gray-500 mt-1">Se abrirá el diálogo de impresión automáticamente</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors ml-auto"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
      <div ref={printRef} className="print-container" />
    </div>
  )
}
