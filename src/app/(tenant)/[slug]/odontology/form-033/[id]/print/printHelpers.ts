/* ─── Print formatting helpers ─── */

export interface PatientData {
  first_name?: string | null
  last_name?: string | null
  cedula?: string | null
}

export interface VitalSignsData {
  blood_pressure?: string | null
  heart_rate?: number | string | null
  respiratory_rate?: number | string | null
  temperature?: number | string | null
  spo2?: number | string | null
  weight?: number | string | null
  height?: number | string | null
  bmi?: number | string | null
}

export interface OralHygieneData {
  rating?: string | null
  plaque_index?: number | null
}

export interface DiagnosisData {
  code?: string
  description?: string
  text?: string
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
  diagnostic_plan?: string | null
  diagnosis?: DiagnosisData | null
  stomatognathic_exam?: string | { regions?: Array<{ id: string; finding: string }>; free_text?: string } | null
  fluorosis?: string | null
  cpod_index?: { caries?: number; missing?: number; filled?: number; total?: number } | null
  ceod_index?: { caries?: number; extraction?: number; filled?: number; total?: number } | null
  therapeutic_plan?: string | null
  educational_plan?: string | null
  treatment?: { text?: string } | string | null
}

export function formatVitalSigns(vs: VitalSignsData | null | undefined): string[] {
  if (!vs) return []
  const lines: string[] = []
  if (vs.blood_pressure) lines.push(`TA: ${vs.blood_pressure} mmHg`)
  if (vs.heart_rate) lines.push(`FC: ${vs.heart_rate} lpm`)
  if (vs.respiratory_rate) lines.push(`FR: ${vs.respiratory_rate} rpm`)
  if (vs.temperature) lines.push(`Temp: ${vs.temperature} °C`)
  if (vs.spo2) lines.push(`SpO2: ${vs.spo2}%`)
  if (vs.weight) lines.push(`Peso: ${vs.weight} kg`)
  if (vs.height) lines.push(`Talla: ${vs.height} cm`)
  if (vs.bmi) lines.push(`IMC: ${vs.bmi}`)
  return lines
}

export function formatClinicalExam(
  stomatognathic: string | null,
  oralHygiene: OralHygieneData | null | undefined,
  fluorosis: string | null,
  malocclusion: string | null
): string[] {
  const lines: string[] = []

  if (stomatognathic) {
    const labels: Record<string, string> = {
      labios: 'Labios', mejillas: 'Mejillas', atm: 'ATM',
      musculos: 'Músculos masticatorios', piso_boca: 'Piso de boca',
      lengua: 'Lengua', paladar_duro: 'Paladar duro', paladar_blando: 'Paladar blando',
      gingival: 'Encía', periodontal: 'Periodontal',
    }
    const affected = stomatognathic.split(',').filter(Boolean).map(s => labels[s] || s).join(', ')
    lines.push(`Estomatognático: ${affected}`)
  }

  if (oralHygiene?.rating) {
    const labels: Record<string, string> = { buena: 'Buena', regular: 'Regular', mala: 'Mala' }
    let text = `Higiene oral: ${labels[oralHygiene.rating] || oralHygiene.rating}`
    if (oralHygiene.plaque_index != null) text += ` (Índice de placa: ${oralHygiene.plaque_index}%)`
    lines.push(text)
  }

  if (fluorosis) {
    const labels: Record<string, string> = {
      dudosa: 'Dudosa', muy_leve: 'Muy leve', leve: 'Leve',
      moderada: 'Moderada', severa: 'Severa',
    }
    lines.push(`Fluorosis: ${labels[fluorosis] || fluorosis}`)
  }

  if (malocclusion) {
    try {
      const m = JSON.parse(malocclusion)
      const classLabels: Record<string, string> = { clase_i: 'Clase I', clase_ii: 'Clase II', clase_iii: 'Clase III' }
      let text = `Maloclusión: ${classLabels[m.class] || m.class}`
      if (m.overjet != null) text += ` | Overjet: ${m.overjet}mm`
      if (m.overbite != null) text += ` | Overbite: ${m.overbite}mm`
      lines.push(text)
    } catch { lines.push(`Maloclusión: ${malocclusion}`) }
  }

  return lines
}

export interface IndexData {
  caries?: number | null
  missing?: number | null
  extraction?: number | null
  filled?: number | null
  total?: number | null
}

export function formatIndex(name: string, data: IndexData | null | undefined): string | null {
  if (!data) return null
  const labels = name === 'CPO-D'
    ? ['C', 'P', 'O']
    : ['C', 'E', 'O']
  const v1 = data.caries ?? 0
  const v2 = data.missing ?? data.extraction ?? 0
  const v3 = data.filled ?? 0
  return `${name}: ${labels[0]}:${v1} | ${labels[1]}:${v2} | ${labels[2]}:${v3} | Total:${data.total ?? (v1 + v2 + v3)}`
}

export function esc(text: string | number | null | undefined): string {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export interface PrescriptionItem {
  medication_name: string
  quantity?: number | string | null
  dosage?: string | null
  frequency?: string | null
  duration?: string | null
  instructions?: string | null
}

export function generatePrescriptionHTML(record: DentalRecord, prescriptions: PrescriptionItem[]): string {
  const patient = record.patients
  const dateStr = record.opening_date 
    ? new Date(record.opening_date).toLocaleDateString('es-EC') 
    : new Date().toLocaleDateString('es-EC')

  return `
    <style>
      @page { margin: 1.5cm; size: A4; }
      * { box-sizing: border-box; }
      .print-form { max-width: 190mm; margin: 0 auto; padding: 20px; font-family: 'Courier New', 'Courier', monospace; color: #000; }
      .print-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
      .print-header h1 { font-size: 16pt; font-weight: bold; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px; }
      .print-header p { font-size: 10pt; margin: 0; color: #444; }
      .print-section { margin-bottom: 20px; }
      .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; font-size: 10pt; }
      .print-label { color: #555; font-weight: bold; }
      .print-rp { font-size: 24pt; font-weight: bold; font-family: 'Georgia', serif; margin: 20px 0 10px; }
      .print-rx-list { margin-top: 10px; }
      .print-rx-item { border-bottom: 1px dashed #999; padding: 10px 0; }
      .print-rx-item:last-child { border-bottom: none; }
      .print-rx-title { font-size: 12pt; font-weight: bold; }
      .print-rx-details { font-size: 10pt; color: #333; margin-top: 2px; }
      .print-rx-instructions { font-size: 9.5pt; font-style: italic; color: #555; margin-top: 4px; }
      .print-signature { margin-top: 60px; display: flex; justify-content: center; }
      .print-signature div { border-top: 1px solid #000; padding-top: 5px; font-size: 9pt; text-align: center; width: 250px; }
      .print-footer { text-align: center; font-size: 8pt; color: #999; margin-top: 60px; border-top: 1px solid #ddd; padding-top: 8px; }
    </style>

    <div class="print-form">
      <div class="print-header">
        <h1>Receta Médica</h1>
        <p>DentiApp Online</p>
      </div>

      <div class="print-section">
        <div class="print-grid">
          <div><span class="print-label">Paciente:</span> ${esc(patient?.first_name || '')} ${esc(patient?.last_name || '')}</div>
          <div><span class="print-label">Identificación:</span> ${esc(patient?.cedula || '—')}</div>
          <div><span class="print-label">Fecha:</span> ${esc(dateStr)}</div>
        </div>
      </div>

      <div class="print-rp">Rp.</div>

      <div class="print-section print-rx-list">
        ${prescriptions.length > 0 ? prescriptions.map((rx) => `
          <div class="print-rx-item">
            <div class="print-rx-title">${esc(rx.medication_name)} ${rx.quantity ? `(Cant: ${rx.quantity})` : ''}</div>
            <div class="print-rx-details">
              ${[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' — ')}
            </div>
            ${rx.instructions ? `<div class="print-rx-instructions">Indicaciones: ${esc(rx.instructions)}</div>` : ''}
          </div>
        `).join('') : '<p>No hay medicamentos recetados en este formulario.</p>'}
      </div>

      <div class="print-signature">
        <div>Firma del profesional</div>
      </div>

      <div class="print-footer">
        Generado por DentiApp Online — ${new Date().toLocaleDateString('es-EC')}
      </div>
    </div>
  `
}
