import { describe, it, expect } from 'vitest'

/* ─── Print formatting helpers ─── */

function formatVitalSigns(vs: any): string[] {
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

function formatClinicalExam(stomatognathic: string | null, oralHygiene: any, fluorosis: string | null, malocclusion: string | null): string[] {
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

function formatIndex(name: string, data: any): string | null {
  if (!data) return null
  const labels = name === 'CPO-D'
    ? ['C', 'P', 'O']
    : ['C', 'E', 'O']
  const v1 = data.caries ?? 0
  const v2 = data.missing ?? data.extraction ?? 0
  const v3 = data.filled ?? 0
  return `${name}: ${labels[0]}:${v1} | ${labels[1]}:${v2} | ${labels[2]}:${v3} | Total:${data.total ?? (v1 + v2 + v3)}`
}

/* ─── Tests ─── */

describe('formatVitalSigns', () => {
  it('returns empty array for null input', () => {
    expect(formatVitalSigns(null)).toEqual([])
  })

  it('formats all vital signs', () => {
    const vs = { blood_pressure: '120/80', heart_rate: 72, temperature: 36.5, bmi: 24.2 }
    const result = formatVitalSigns(vs)
    expect(result).toContain('TA: 120/80 mmHg')
    expect(result).toContain('FC: 72 lpm')
    expect(result).toContain('Temp: 36.5 °C')
    expect(result).toContain('IMC: 24.2')
  })
})

describe('formatClinicalExam', () => {
  it('formats stomatognathic exam', () => {
    const result = formatClinicalExam('labios,atm,lengua', null, null, null)
    expect(result).toContain('Estomatognático: Labios, ATM, Lengua')
  })

  it('formats oral hygiene with plaque index', () => {
    const result = formatClinicalExam(null, { rating: 'buena', plaque_index: 15 }, null, null)
    expect(result[0]).toContain('Higiene oral: Buena')
    expect(result[0]).toContain('Índice de placa: 15%')
  })

  it('formats malocclusion from JSON', () => {
    const result = formatClinicalExam(null, null, null, JSON.stringify({ class: 'clase_ii', overjet: 4, overbite: 3 }))
    expect(result[0]).toContain('Maloclusión: Clase II')
    expect(result[0]).toContain('Overjet: 4mm')
    expect(result[0]).toContain('Overbite: 3mm')
  })

  it('formats fluorosis', () => {
    const result = formatClinicalExam(null, null, 'moderada', null)
    expect(result).toContain('Fluorosis: Moderada')
  })
})

describe('formatIndex', () => {
  it('formats CPO-D', () => {
    const result = formatIndex('CPO-D', { caries: 3, missing: 1, filled: 4, total: 8 })
    expect(result).toBe('CPO-D: C:3 | P:1 | O:4 | Total:8')
  })

  it('formats CEO-D', () => {
    const result = formatIndex('CEO-D', { caries: 2, extraction: 1, filled: 1, total: 4 })
    expect(result).toBe('CEO-D: C:2 | E:1 | O:1 | Total:4')
  })

  it('returns null for null data', () => {
    expect(formatIndex('CPO-D', null)).toBeNull()
  })
})
