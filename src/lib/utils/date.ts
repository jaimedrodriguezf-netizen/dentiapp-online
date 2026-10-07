/**
 * Retorna la fecha en formato YYYY-MM-DD usando la fecha local,
 * evitando el desplazamiento de día que genera new Date().toISOString() en zonas UTC negativas.
 */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
