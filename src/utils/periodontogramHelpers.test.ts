import { describe, it, expect } from 'vitest'
import {
  createEmptyPeriodontogram,
  calculatePointNIC,
  calculatePeriodontalIndices,
  ALL_TEETH_IDS
} from './periodontogramHelpers'

describe('Periodontogram Helpers Tests', () => {
  describe('createEmptyPeriodontogram', () => {
    it('debería inicializar un periodontograma con exactamente 32 dientes permanentes', () => {
      const data = createEmptyPeriodontogram()
      expect(Object.keys(data.teeth)).toHaveLength(32)
      ALL_TEETH_IDS.forEach((id) => {
        expect(data.teeth[id]).toBeDefined()
        expect(data.teeth[id].isMissing).toBe(false)
        expect(data.teeth[id].vestibular.distal.margin).toBeNull()
        expect(data.teeth[id].lingual.middle.bleeding).toBe(false)
      })
    })
  })

  describe('calculatePointNIC', () => {
    it('debería calcular el NIC restando el margen a la profundidad de sondaje', () => {
      // Recesión (margen positivo): NIC = 5 - (+2) = 3
      expect(calculatePointNIC(2, 5)).toBe(3)
      
      // Hiperplasia (margen negativo): NIC = 4 - (-2) = 6
      expect(calculatePointNIC(-2, 4)).toBe(6)
      
      // Margen normal (cero): NIC = 3 - 0 = 3
      expect(calculatePointNIC(0, 3)).toBe(3)
    })

    it('debería retornar null si el margen o la profundidad de sondaje son nulos', () => {
      expect(calculatePointNIC(null, 5)).toBeNull()
      expect(calculatePointNIC(2, null)).toBeNull()
      expect(calculatePointNIC(null, null)).toBeNull()
    })
  })

  describe('calculatePeriodontalIndices', () => {
    it('debería calcular índices de placa y sangrado en 0 para un periodontograma vacío', () => {
      const data = createEmptyPeriodontogram()
      const indices = calculatePeriodontalIndices(data)
      expect(indices.plaqueIndex).toBe(0)
      expect(indices.bleedingIndex).toBe(0)
      expect(indices.totalEvaluatedPoints).toBe(192) // 32 dientes * 6 puntos
    })

    it('debería calcular el porcentaje correcto de placa y sangrado', () => {
      const data = createEmptyPeriodontogram()
      
      // Marcamos 12 puntos con placa y 6 con sangrado
      // Total de puntos evaluados es 192.
      // IP esperado: (12 / 192) * 100 = 6.25% -> 6%
      // IS esperado: (6 / 192) * 100 = 3.125% -> 3%
      
      data.teeth['11'].vestibular.distal.plaque = true
      data.teeth['11'].vestibular.middle.plaque = true
      data.teeth['11'].vestibular.mesial.plaque = true
      data.teeth['12'].vestibular.distal.plaque = true
      data.teeth['12'].vestibular.middle.plaque = true
      data.teeth['12'].vestibular.mesial.plaque = true
      data.teeth['13'].vestibular.distal.plaque = true
      data.teeth['13'].vestibular.middle.plaque = true
      data.teeth['13'].vestibular.mesial.plaque = true
      data.teeth['14'].vestibular.distal.plaque = true
      data.teeth['14'].vestibular.middle.plaque = true
      data.teeth['14'].vestibular.mesial.plaque = true

      data.teeth['11'].vestibular.distal.bleeding = true
      data.teeth['11'].vestibular.middle.bleeding = true
      data.teeth['11'].vestibular.mesial.bleeding = true
      data.teeth['12'].vestibular.distal.bleeding = true
      data.teeth['12'].vestibular.middle.bleeding = true
      data.teeth['12'].vestibular.mesial.bleeding = true

      const indices = calculatePeriodontalIndices(data)
      expect(indices.plaqueIndex).toBe(6)
      expect(indices.bleedingIndex).toBe(3)
      expect(indices.totalEvaluatedPoints).toBe(192)
    })

    it('debería ignorar los dientes marcados como ausentes del total de puntos evaluados', () => {
      const data = createEmptyPeriodontogram()
      
      // Marcamos 2 dientes como ausentes (18 y 28)
      // Dientes restantes: 30. Total de puntos evaluados: 30 * 6 = 180
      data.teeth['18'].isMissing = true
      data.teeth['28'].isMissing = true

      // Ponemos placa en 18 puntos en dientes válidos presentes (no ausentes)
      // IP esperado: (18 / 180) * 100 = 10%
      const targetTeeth = [
        '11', '12', '13', '14', '15', '16', '17',
        '21', '22', '23', '24', '25', '26', '27',
        '31', '32', '33', '34'
      ]
      targetTeeth.forEach((toothId) => {
        data.teeth[toothId].vestibular.distal.plaque = true
      })

      const indices = calculatePeriodontalIndices(data)
      expect(indices.totalEvaluatedPoints).toBe(180)
      expect(indices.plaqueIndex).toBe(10)
    })
  })
})
