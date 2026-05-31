import { PeriodontogramData, ToothMeasurement, PeriodontalPoint } from '@/types/periodontogram'

// Orden clínico oficial (Universidad de Berna / SEPA)
export const UPPER_TEETH = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28'
]

export const LOWER_TEETH = [
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38'
]

export const ALL_TEETH_IDS = [...UPPER_TEETH, ...LOWER_TEETH]

// Inicializar un punto clínico vacío
export function createEmptyPoint(): PeriodontalPoint {
  return {
    margin: null,
    depth: null,
    nic: null,
    bleeding: false,
    plaque: false,
    suppuration: false
  }
}

// Inicializar un diente clínico vacío
export function createEmptyTooth(id: string): ToothMeasurement {
  return {
    id,
    isMissing: false,
    mobility: null,
    furcation: null,
    vestibular: {
      distal: createEmptyPoint(),
      middle: createEmptyPoint(),
      mesial: createEmptyPoint()
    },
    lingual: {
      distal: createEmptyPoint(),
      middle: createEmptyPoint(),
      mesial: createEmptyPoint()
    }
  }
}

// Inicializar periodontograma completo de 32 dientes
export function createEmptyPeriodontogram(): PeriodontogramData {
  const teeth: Record<string, ToothMeasurement> = {}
  ALL_TEETH_IDS.forEach((id) => {
    teeth[id] = createEmptyTooth(id)
  })
  return {
    teeth,
    generalNotes: ''
  }
}

// Cálculo del Nivel de Inserción Clínica (NIC)
// NIC = Profundidad de Sondaje (PS) - Margen Gingival (MG)
// (Ej: PS = 5, MG = 2 -> NIC = 3. PS = 4, MG = -2 -> NIC = 6)
export function calculatePointNIC(margin: number | null, depth: number | null): number | null {
  if (margin === null || depth === null) return null
  return depth - margin
}

// Cálculo automático de Índices Globales de Placa y Sangrado
export function calculatePeriodontalIndices(data: PeriodontogramData) {
  let totalEvaluatedPoints = 0
  let plaquePointsCount = 0
  let bleedingPointsCount = 0

  Object.values(data.teeth).forEach((tooth) => {
    if (tooth.isMissing) return // Los dientes ausentes no se evalúan

    const faces = [tooth.vestibular, tooth.lingual]
    faces.forEach((face) => {
      const points = [face.distal, face.middle, face.mesial]
      points.forEach((pt) => {
        totalEvaluatedPoints++
        if (pt.plaque) plaquePointsCount++
        if (pt.bleeding) bleedingPointsCount++
      })
    })
  })

  const plaqueIndex = totalEvaluatedPoints > 0 
    ? Math.round((plaquePointsCount / totalEvaluatedPoints) * 100) 
    : 0

  const bleedingIndex = totalEvaluatedPoints > 0 
    ? Math.round((bleedingPointsCount / totalEvaluatedPoints) * 100) 
    : 0

  return {
    plaqueIndex,
    bleedingIndex,
    totalEvaluatedPoints,
    plaquePointsCount,
    bleedingPointsCount
  }
}
