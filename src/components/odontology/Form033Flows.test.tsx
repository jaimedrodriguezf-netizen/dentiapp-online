import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Form033Wizard from './Form033Wizard'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        or: () => ({
          limit: () => ({
            order: () => Promise.resolve({
              data: [
                { code: 'K02.1', description: 'Caries de la dentina' },
                { code: 'K05.0', description: 'Gingivitis aguda' },
              ]
            }),
          }),
        }),
      }),
    }),
  }),
}))

describe('Form033Wizard E2E / Flow Integration Tests', () => {
  const mockCreateAction = vi.fn().mockResolvedValue(undefined)

  it('Flujo 1: "Admisión Integral" (Paciente Nuevo / Chequeo Completo)', async () => {
    mockCreateAction.mockClear()
    render(
      <Form033Wizard
        slug="dentiapp"
        patientId="pat-123"
        patientName="Juan Pérez"
        createAction={mockCreateAction}
      />
    )

    // Paso 2: Completar Anamnesis y Enfermedad Actual (están lado a lado)
    const reasonInput = screen.getByPlaceholderText(/Ej: 'Me duele el diente de arriba/i) as HTMLTextAreaElement
    const problemInput = screen.getByPlaceholderText(/Cronología, localización, características/i) as HTMLTextAreaElement

    fireEvent.change(reasonInput, { target: { value: 'Dolor leve y chequeo general' } })
    fireEvent.change(problemInput, { target: { value: 'Molestia al frío en zona superior derecha.' } })

    // Paso 3: En Antecedentes, hacer clic en el botón "No refiere" en ambas secciones
    const noRefiereBtns = screen.getAllByRole('button', { name: /No refiere/i })
    expect(noRefiereBtns).toHaveLength(2)

    fireEvent.click(noRefiereBtns[0])
    fireEvent.click(noRefiereBtns[1])

    // Verificar que los campos ocultos de antecedentes estén serializados como false
    const personalHistoryHidden = document.querySelector('input[name="personal_history"]') as HTMLInputElement
    const familyHistoryHidden = document.querySelector('input[name="family_history"]') as HTMLInputElement

    expect(JSON.parse(personalHistoryHidden.value)).toEqual({
      allergy_antibiotic: false,
      allergy_anesthesia: false,
      hemorrhages: false,
      hiv: false,
      tuberculosis: false,
      asthma: false,
      diabetes: false,
      hypertension: false,
      heart_disease: false,
      other: false,
    })

    expect(JSON.parse(familyHistoryHidden.value)).toEqual({
      cardiopathy: false,
      hypertension: false,
      vascular_disease: false,
      endocrine: false,
      cancer: false,
      tuberculosis: false,
      mental_illness: false,
      infectious_disease: false,
      malformation: false,
      other: false,
    })

    // Paso 4: En el Odontograma, usar el botón "Boca Sana" como base
    const bocaSanaBtn = screen.getByRole('button', { name: /Marcar Boca Sana/i })
    expect(bocaSanaBtn).toBeInTheDocument()
    fireEvent.click(bocaSanaBtn)

    // Paso 5: Dale al botón flotante de "Guardar Todo"
    const saveBtns = screen.getAllByRole('button', { name: /Guardar Todo/i })
    fireEvent.click(saveBtns[0])

    expect(mockCreateAction).toHaveBeenCalled()
    const submittedData = mockCreateAction.mock.calls[0][0] as FormData
    expect(submittedData.get('consultation_reason')).toBe('Dolor leve y chequeo general')
    expect(submittedData.get('current_problem')).toBe('Molestia al frío en zona superior derecha.')
    expect(submittedData.get('odontogram_teeth')).toBe('[]') // Boca sana represents empty modifications
  })

  it('Flujo 2: "Speedrun" (Emergencia / Dolor Agudo)', async () => {
    mockCreateAction.mockClear()
    render(
      <Form033Wizard
        slug="dentiapp"
        patientId="pat-123"
        patientName="Juan Pérez"
        createAction={mockCreateAction}
      />
    )

    // Paso 1 y 2: Registrar el problema actual (ej: "Dolor en pieza 36")
    const problemInput = screen.getByPlaceholderText(/Cronología, localización, características/i) as HTMLTextAreaElement
    fireEvent.change(problemInput, { target: { value: 'Dolor agudo e inflamación en pieza 36.' } })

    // Paso 3: Odontograma - marcar solo la pieza afectada (pieza 36)
    const tooth36Cell = screen.getAllByText('36').find(el => el.tagName.toLowerCase() === 'text')?.closest('g')
    expect(tooth36Cell).toBeInTheDocument()
    fireEvent.click(tooth36Cell!)

    // En el panel de edición, seleccionar la cara Oclusal (O) y luego "Caries"
    const oclusalFace = screen.getByTestId('big-tooth-face-O')
    expect(oclusalFace).toBeInTheDocument()
    fireEvent.click(oclusalFace)

    const cariesBtn = screen.getByRole('button', { name: /^Caries$/i })
    expect(cariesBtn).toBeInTheDocument()
    fireEvent.click(cariesBtn)


    // Guardar
    const saveBtns = screen.getAllByRole('button', { name: /Guardar Todo/i })
    fireEvent.click(saveBtns[0])

    expect(mockCreateAction).toHaveBeenCalled()
    const submittedData = mockCreateAction.mock.calls[0][0] as FormData
    expect(submittedData.get('current_problem')).toBe('Dolor agudo e inflamación en pieza 36.')

    // El sistema marcará los campos del examen estomatognático vacíos como S.P.A. por vos
    const stomatognathicHidden = submittedData.get('stomatognathic_exam') as string
    const parsedExam = JSON.parse(stomatognathicHidden)
    expect(parsedExam.regions).toHaveLength(13)
    parsedExam.regions.forEach((region: { id: string; finding: string }) => {
      expect(region.finding).toBe('S.P.A.')
    })

    // Verificar que la pieza 36 está guardada con caries
    const parsedTeeth = JSON.parse(submittedData.get('odontogram_teeth') as string)
    expect(parsedTeeth).toHaveLength(1)
    expect(parsedTeeth[0]).toMatchObject({
      tooth_number: 36,
      status: 'caries'
    })
  })

  it('Flujo 3: Flujo Colaborativo (Enfermería - Odontólogo)', async () => {
    mockCreateAction.mockClear()

    // Fase A & B: El odontólogo abre la ficha pre-llenada por enfermería
    // Con signos vitales (bp: 120/80, hr: 72, rr: 16, temp: 36.5) y antecedentes sanos
    render(
      <Form033Wizard
        slug="dentiapp"
        patientId="pat-123"
        patientName="Juan Pérez"
        createAction={mockCreateAction}
        defaultVitalSigns={{
          blood_pressure: '120/80',
          heart_rate: 72,
          respiratory_rate: 16,
          temperature: 36.5,
        }}
        defaultPersonalHistory={{
          allergy_antibiotic: false,
          allergy_anesthesia: false,
          hemorrhages: false,
          hiv: false,
          tuberculosis: false,
          asthma: false,
          diabetes: false,
          hypertension: false,
          heart_disease: false,
          other: false,
        }}
      />
    )

    // Aserción: El odontólogo ve que los Signos Vitales ya están llenos
    const bpInput = screen.getByLabelText('TA') as HTMLInputElement
    const hrInput = screen.getByLabelText('FC') as HTMLInputElement
    const rrInput = screen.getByLabelText('FR') as HTMLInputElement
    const tempInput = screen.getByLabelText('Temp') as HTMLInputElement

    expect(bpInput.value).toBe('120/80')
    expect(hrInput.value).toBe('72')
    expect(rrInput.value).toBe('16')
    expect(tempInput.value).toBe('36.5')

    // El odontólogo se concentra en el odontograma: marcar Boca Sana
    const bocaSanaBtn = screen.getByRole('button', { name: /Marcar Boca Sana/i })
    fireEvent.click(bocaSanaBtn)

    // Clic en Guardar Todo
    const saveBtns = screen.getAllByRole('button', { name: /Guardar Todo/i })
    fireEvent.click(saveBtns[0])

    expect(mockCreateAction).toHaveBeenCalled()
    const submittedData = mockCreateAction.mock.calls[0][0] as FormData
    
    // Verificar que los datos pre-llenados de enfermería y la boca sana del odontólogo se fusionan correctamente
    expect(submittedData.get('vital_bp')).toBe('120/80')
    expect(submittedData.get('vital_hr')).toBe('72')
    expect(submittedData.get('odontogram_teeth')).toBe('[]')
  })

  it('Flujo 4: Registro con Recetario Integrado', async () => {
    mockCreateAction.mockClear()
    render(
      <Form033Wizard
        slug="dentiapp"
        patientId="pat-123"
        patientName="Juan Pérez"
        createAction={mockCreateAction}
      />
    )

    // Buscar el botón de plantilla rápida 'Post-Extracción'
    const templateBtn = screen.getByRole('button', { name: /Post-Extracción/i })
    expect(templateBtn).toBeInTheDocument()
    fireEvent.click(templateBtn)

    // Debería agregar los medicamentos de la plantilla: Ibuprofeno y Amoxicilina
    // Verificamos que el input oculto 'prescriptions' tenga estos medicamentos
    const prescriptionsHidden = document.querySelector('input[name="prescriptions"]') as HTMLInputElement
    expect(prescriptionsHidden).toBeInTheDocument()

    const parsedRx = JSON.parse(prescriptionsHidden.value)
    expect(parsedRx).toHaveLength(2)
    expect(parsedRx[0].medication_name).toBe('Ibuprofeno')
    expect(parsedRx[1].medication_name).toBe('Amoxicilina')

    // También verificamos que se puedan editar y agregar más
    const addMedBtn = screen.getByRole('button', { name: /Agregar Medicamento/i })
    expect(addMedBtn).toBeInTheDocument()
    fireEvent.click(addMedBtn)

    // El tercer medicamento inicialmente está vacío, pero se filtra al enviar
    // Presionemos el botón flotante "Guardar Todo"
    const saveBtns = screen.getAllByRole('button', { name: /Guardar Todo/i })
    fireEvent.click(saveBtns[0])

    expect(mockCreateAction).toHaveBeenCalled()
    const submittedData = mockCreateAction.mock.calls[0][0] as FormData
    
    // Al guardar, las recetas vacías se filtran, así que solo deben quedar las 2 de la plantilla
    const submittedRxRaw = submittedData.get('prescriptions') as string
    expect(submittedRxRaw).toBeDefined()
    const submittedRx = JSON.parse(submittedRxRaw)
    expect(submittedRx).toHaveLength(2)
    expect(submittedRx[0].medication_name).toBe('Ibuprofeno')
    expect(submittedRx[1].medication_name).toBe('Amoxicilina')
  })

  it('Flujo 5: Parámetros Obligatorios y Validación de Diagnósticos (Sección 10/11)', async () => {
    mockCreateAction.mockClear()
    render(
      <Form033Wizard
        slug="dentiapp"
        patientId="pat-123"
        patientName="Juan Pérez"
        createAction={mockCreateAction}
      />
    )

    // 2. Forzá el error de validación:
    const addDiagBtn = screen.getByRole('button', { name: /Añadir Diagnóstico a la Lista/i })
    expect(addDiagBtn).toBeInTheDocument()
    fireEvent.click(addDiagBtn)

    // Resultado esperado: los campos muestran que son requeridos.
    const validationAlert = screen.getByText(/Falta el código CIE-10. Buscá y seleccioná un diagnóstico válido/i)
    expect(validationAlert).toBeInTheDocument()

    // 3. Completá el diagnóstico por partes:
    const cieSearchInput = screen.getByPlaceholderText(/Buscá un diagnóstico CIE-10/i) as HTMLInputElement
    fireEvent.change(cieSearchInput, { target: { value: 'caries' } })

    const option = await screen.findByText('K02.1')
    fireEvent.click(option)

    // Seleccionar Tipo
    const typeSelect = screen.getAllByRole('combobox').find(el => el.innerHTML.includes('presuntivo')) as HTMLSelectElement
    expect(typeSelect).toBeInTheDocument()
    fireEvent.change(typeSelect, { target: { value: 'definitivo' } })

    // Seleccionar pieza 46
    const tooth46Cell = screen.getByRole('button', { name: /^46$/i })
    expect(tooth46Cell).toBeInTheDocument()
    fireEvent.click(tooth46Cell)

    // Marcar caras O (Oclusal/Incisal) y M (Mesial).
    // Para la pieza 46 (lado derecho), Mesial es la derecha (rightKey = 'M').
    const surfaceO = screen.getByText(/O\/I \(Oclusal/i)
    const surfaceM = screen.getByText(/M \(Mesial \(M\)/i)
    fireEvent.click(surfaceO)
    fireEvent.click(surfaceM)

    // Dejar comentario clínico vacío y presionar Añadir
    fireEvent.click(addDiagBtn)

    // Resultado esperado: destaca Comentario clínico en rojo indicando que falta
    const notesAlert = screen.getByText(/Falta el Comentario Clínico. Escribí una nota u observación obligatoria/i)
    expect(notesAlert).toBeInTheDocument()

    // Escribir nota
    const notesInput = screen.getByPlaceholderText(/Ej: Afecta profundamente el esmalte/i) as HTMLInputElement
    fireEvent.change(notesInput, { target: { value: 'Afectación moderada, requiere restauración' } })

    // 4. Agregar a la lista
    fireEvent.click(addDiagBtn)

    // Ver si se limpió el panel y se añadió abajo
    expect(screen.getByText('Afectación moderada, requiere restauración')).toBeInTheDocument()

    // 5. Interceptor de olvidos:
    const activeCieSearchInput = screen.getByPlaceholderText(/Buscá un diagnóstico CIE-10/i) as HTMLInputElement
    fireEvent.change(activeCieSearchInput, { target: { value: 'gingivitis' } })
    const optionGingivitis = await screen.findByText('K05.0')
    const optionButton = optionGingivitis.closest('button')
    expect(optionButton).toBeInTheDocument()
    fireEvent.click(optionButton!)

    // Esperar a que el estado se actualice y aparezca el botón Remover del chip
    const removeBtn = await screen.findByText('Remover')
    expect(removeBtn).toBeInTheDocument()

    // Intentar guardar la ficha general
    const saveBtns = screen.getAllByRole('button', { name: /Guardar Todo/i })
    fireEvent.click(saveBtns[0])

    // Cancelado, muestra advertencia de diagnóstico a medio completar
    expect(mockCreateAction).not.toHaveBeenCalled()
    const interceptorAlert = screen.getByText(/¡Tenés un diagnóstico a medio completar en el panel!/i)
    expect(interceptorAlert).toBeInTheDocument()

    // 6. Finalizar guardado:
    fireEvent.click(removeBtn)

    // Guardar con éxito
    fireEvent.click(saveBtns[0])
    expect(mockCreateAction).toHaveBeenCalled()
  })
})


