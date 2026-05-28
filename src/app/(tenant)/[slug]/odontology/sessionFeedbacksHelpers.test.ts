import { describe, it, expect } from 'vitest'
import { parseSessionFeedbacks } from './sessionFeedbacksHelpers'

describe('parseSessionFeedbacks', () => {
  it('debería manejar null devolviendo diagnóstico vacío y lista de feedbacks vacía', () => {
    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks(null)
    expect(cleanDiagnosis).toBe('')
    expect(feedbacksList).toEqual([])
  })

  it('debería manejar string vacío devolviendo diagnóstico vacío y lista de feedbacks vacía', () => {
    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks('')
    expect(cleanDiagnosis).toBe('')
    expect(feedbacksList).toEqual([])
  })

  it('debería retornar el diagnóstico original sin modificaciones si no contiene feedbacks', () => {
    const originalText = 'Paciente presenta dolor leve en pieza 46 y sensibilidad al frío.'
    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks(originalText)
    expect(cleanDiagnosis).toBe(originalText)
    expect(feedbacksList).toEqual([])
  })

  it('debería extraer con éxito los feedbacks y limpiar el diagnóstico si el formato es correcto', () => {
    const textWithFeedbacks = 'Caries profunda en cara oclusal. [FEEDBACKS: [{"id":"1","author":"Dr. Pérez","date":"2026-05-27T10:00:00Z","text":"Revisar vitalidad en próxima sesión"},{"id":"2","author":"Dra. Gómez","date":"2026-05-27T12:00:00Z","text":"Paciente refiere disminución de molestia"}]]'
    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks(textWithFeedbacks)
    
    expect(cleanDiagnosis).toBe('Caries profunda en cara oclusal.')
    expect(feedbacksList).toHaveLength(2)
    expect(feedbacksList[0]).toEqual({
      id: '1',
      author: 'Dr. Pérez',
      date: '2026-05-27T10:00:00Z',
      text: 'Revisar vitalidad en próxima sesión',
    })
    expect(feedbacksList[1]).toEqual({
      id: '2',
      author: 'Dra. Gómez',
      date: '2026-05-27T12:00:00Z',
      text: 'Paciente refiere disminución de molestia',
    })
  })

  it('debería ser resiliente a JSON corrupto o mal formado dentro de la etiqueta [FEEDBACKS: ...]', () => {
    const textWithCorruptedFeedbacks = 'Diagnóstico base con json roto [FEEDBACKS: [{"id": "1", "author": "Dr. Roto", "date": "2026-05" ]'
    const { cleanDiagnosis, feedbacksList } = parseSessionFeedbacks(textWithCorruptedFeedbacks)
    
    // Al fallar el parse, debe conservar todo el string original como diagnóstico para no perder información
    expect(cleanDiagnosis).toBe(textWithCorruptedFeedbacks)
    expect(feedbacksList).toEqual([])
  })
})
