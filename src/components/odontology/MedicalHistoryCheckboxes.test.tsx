import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MedicalHistoryCheckboxes from './MedicalHistoryCheckboxes'

describe('MedicalHistoryCheckboxes', () => {
  it('renderiza los títulos de Antecedentes Personales y Familiares', () => {
    render(<MedicalHistoryCheckboxes />)
    expect(screen.getByText('Antecedentes Personales')).toBeInTheDocument()
    expect(screen.getByText('Antecedentes Familiares')).toBeInTheDocument()
  })

  it('renderiza los 10 checkboxes de antecedentes personales', () => {
    render(<MedicalHistoryCheckboxes />)
    const uniquePersonalLabels = [
      'Alergia a antibiótico',
      'Alergia a anestesia',
      'Hemorragias',
      'VIH / SIDA',
      'Asma',
      'Diabetes',
      'Enfermedad cardíaca',
    ]
    uniquePersonalLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
    const tuberculosisPersonal = screen.getAllByText('Tuberculosis')
    expect(tuberculosisPersonal.length).toBeGreaterThanOrEqual(1)
    const hipertensionPersonal = screen.getAllByText('Hipertensión arterial')
    expect(hipertensionPersonal.length).toBeGreaterThanOrEqual(1)
    const otroPersonal = screen.getAllByText('Otro')
    expect(otroPersonal.length).toBeGreaterThanOrEqual(1)
  })

  it('renderiza los 10 checkboxes de antecedentes familiares', () => {
    render(<MedicalHistoryCheckboxes />)
    const uniqueFamilyLabels = [
      'Cardiopatía',
      'Enf. cardiovascular',
      'Endócrino metabólico',
      'Cáncer',
      'Enf. mental',
      'Enf. infecciosa',
      'Mal formación',
    ]
    uniqueFamilyLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('marca un checkbox con border-blue-500 al hacer click', () => {
    render(<MedicalHistoryCheckboxes />)
    const checkbox = screen.getByText('Alergia a antibiótico').closest('button')
    expect(checkbox).not.toHaveClass('border-blue-500')
    fireEvent.click(checkbox!)
    expect(checkbox).toHaveClass('border-blue-500')
  })

  it('muestra input con placeholder "Especificar..." al marcar "Otro" en personales', () => {
    render(<MedicalHistoryCheckboxes />)
    expect(screen.queryByPlaceholderText('Especificar...')).not.toBeInTheDocument()
    const otroPersonal = screen.getAllByText('Otro')[0]
    fireEvent.click(otroPersonal)
    expect(screen.getByPlaceholderText('Especificar...')).toBeInTheDocument()
  })

  it('tiene inputs ocultos con names personal_history y family_history', () => {
    render(<MedicalHistoryCheckboxes />)
    const personalHidden = document.querySelector('input[name="personal_history"]')
    const familyHidden = document.querySelector('input[name="family_history"]')
    expect(personalHidden).toBeInTheDocument()
    expect(familyHidden).toBeInTheDocument()
  })

  it('pre-checkea los checkboxes indicados en defaultPersonal', () => {
    render(
      <MedicalHistoryCheckboxes
        defaultPersonal={{ diabetes: true, asthma: true }}
      />,
    )
    const diabetesBtn = screen.getByText('Diabetes').closest('button')
    const asthmaBtn = screen.getByText('Asma').closest('button')
    expect(diabetesBtn).toHaveClass('border-blue-500')
    expect(asthmaBtn).toHaveClass('border-blue-500')
  })

  it('renderiza defaultFamily.other_text en el input de especificar', () => {
    render(
      <MedicalHistoryCheckboxes
        defaultFamily={{ other: true, other_text: 'Enfermedad rara' }}
      />,
    )
    const input = screen.getByPlaceholderText('Especificar...') as HTMLInputElement
    expect(input.value).toBe('Enfermedad rara')
  })
})
