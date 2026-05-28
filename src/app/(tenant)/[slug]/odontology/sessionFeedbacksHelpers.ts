export interface SessionFeedback {
  id: string
  author: string
  date: string
  text: string
}

/**
 * Parsea el bloque serializado [FEEDBACKS: ...] incrustado al final de la nota de diagnóstico/evolución.
 * Devuelve un diagnóstico limpio sin el bloque JSON y la lista estructurada de notas de colaboración médica.
 */
export function parseSessionFeedbacks(diagnosesComplications: string | null): {
  cleanDiagnosis: string
  feedbacksList: SessionFeedback[]
} {
  const text = diagnosesComplications || ''
  const match = text.match(/\[FEEDBACKS:\s*(.*?)\]$/)
  
  let feedbacksList: SessionFeedback[] = []
  let cleanDiagnosis = text
  
  if (match) {
    try {
      feedbacksList = JSON.parse(match[1])
      cleanDiagnosis = text.replace(/\[FEEDBACKS:\s*.*?\]$/, '').trim()
    } catch (e) {
      console.error('Error parsing feedbacks JSON:', e)
    }
  }
  
  return { cleanDiagnosis, feedbacksList }
}
