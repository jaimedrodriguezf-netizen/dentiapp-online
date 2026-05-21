import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TreatmentSessionManager from './TreatmentSessionManager'

describe('TreatmentSessionManager', () => {
  it('renderiza el título "Sesiones de Tratamiento"', () => {
    render(<TreatmentSessionManager />)
    expect(screen.getByText('Sesiones de Tratamiento')).toBeInTheDocument()
  })

  it('el botón "Nueva Sesión" agrega una sesión', () => {
    render(<TreatmentSessionManager />)
    const addButton = screen.getByText('Nueva Sesión')
    fireEvent.click(addButton)
    expect(screen.getByText('Sesión 1')).toBeInTheDocument()
  })

  it('tiene un input oculto con name "treatment_sessions"', () => {
    render(<TreatmentSessionManager />)
    const hidden = document.querySelector('input[name="treatment_sessions"]')
    expect(hidden).toBeInTheDocument()
  })

  it('el input oculto contiene un JSON array con datos de sesiones', () => {
    render(<TreatmentSessionManager />)
    const hidden = document.querySelector('input[name="treatment_sessions"]') as HTMLInputElement
    const data = JSON.parse(hidden.value)
    expect(Array.isArray(data)).toBe(true)
  })

  it('renderiza defaultSessions correctamente con múltiples sesiones', () => {
    render(
      <TreatmentSessionManager
        defaultSessions={[
          { session_number: 1, date: '2024-01-01', diagnosis: '', procedure: 'Limpieza', notes: '' },
          { session_number: 2, date: '2024-01-01', diagnosis: '', procedure: 'Extracción', notes: '' },
        ]}
      />,
    )
    expect(screen.getByText('Sesión 1')).toBeInTheDocument()
    expect(screen.getByText('Sesión 2')).toBeInTheDocument()
  })

  it('el botón de trash elimina una sesión', () => {
    render(
      <TreatmentSessionManager
        defaultSessions={[
          { session_number: 1, date: '2024-01-01', diagnosis: '', procedure: 'Limpieza', notes: '' },
          { session_number: 2, date: '2024-01-01', diagnosis: '', procedure: 'Extracción', notes: '' },
        ]}
      />,
    )
    expect(screen.getByText('Sesión 2')).toBeInTheDocument()
    const sessionCards = screen.getAllByText(/Sesión \d+/)
    const session2Card = sessionCards.find((el) => el.textContent === 'Sesión 2')!.closest('.rounded-2xl')
    const trashBtn = session2Card!.querySelector('button[type="button"]')
    fireEvent.click(trashBtn!)
    expect(screen.queryByText('Sesión 2')).not.toBeInTheDocument()
  })
})
