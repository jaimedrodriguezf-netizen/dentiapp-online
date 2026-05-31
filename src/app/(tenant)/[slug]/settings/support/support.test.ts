import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createSupportFeedback, 
  resolveSupportFeedback, 
  getFeedbacksForAI, 
  saveAIDiagnosis 
} from './actions'

// Definimos mocks de funciones individuales para poder hacer tracking y aserciones
const mockGetUser = vi.fn()
const mockUpload = vi.fn()
const mockRemove = vi.fn()

// Mocks para la fluent API de supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockIn = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()

// Mock de next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

interface FluentChain {
  select: () => FluentChain
  insert: () => FluentChain
  update: () => FluentChain
  eq: (column: string, value: unknown) => FluentChain
  in: (column: string, values: unknown[]) => FluentChain
  order: (column: string, options?: { ascending?: boolean }) => FluentChain
  single: () => Promise<{ data: unknown; error: unknown }>
  then: (onfulfilled?: (value: { data: unknown[]; error: null }) => unknown) => Promise<unknown>
}

// Mock de @/lib/supabase/server
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => {
    // Creamos la cadena fluida (fluent chain) reactiva
    const fluentChain = {} as FluentChain
    fluentChain.select = mockSelect.mockReturnValue(fluentChain)
    fluentChain.insert = mockInsert.mockReturnValue(fluentChain)
    fluentChain.update = mockUpdate.mockReturnValue(fluentChain)
    fluentChain.eq = mockEq.mockReturnValue(fluentChain)
    fluentChain.in = mockIn.mockReturnValue(fluentChain)
    fluentChain.order = mockOrder.mockReturnValue(fluentChain)
    fluentChain.single = mockSingle
    
    // Implementación de then para hacer la cadena fluent-awaitable
    fluentChain.then = (onfulfilled?: (value: { data: unknown[]; error: null }) => unknown) => 
      Promise.resolve({ data: [], error: null }).then(onfulfilled)

    return {
      auth: {
        getUser: mockGetUser
      },
      storage: {
        from: (bucketName: string) => {
          if (bucketName === 'support_screenshots') {
            return {
              upload: mockUpload,
              remove: mockRemove
            }
          }
          return {}
        }
      },
      from: () => {
        return fluentChain
      }
    }
  }
}))

describe('Support Feedback Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Configuración por defecto de usuario autenticado
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user_abc123',
          email: 'doctor@dentiapp.online'
        }
      }
    })

    // Simular retorno por defecto para consultas single()
    // Por defecto, resolverá la membresía del tenant
    mockSingle.mockResolvedValue({
      data: {
        tenant_id: 'tenant_xyz789',
        role: 'doctor'
      },
      error: null
    })
  })

  describe('createSupportFeedback', () => {
    it('should insert feedback without screenshot successfully', async () => {
      const mockFeedbackResult = {
        id: 'feedback_1',
        tenant_id: 'tenant_xyz789',
        user_id: 'user_abc123',
        user_email: 'doctor@dentiapp.online',
        type: 'bug',
        message: 'El periodontograma no guarda los cambios',
        context: {
          pathname: '/odontology/periodontogram',
          userAgent: 'Mozilla/5.0',
          userRole: 'doctor',
          viewportWidth: 1280,
          viewportHeight: 720,
          timestamp: '2026-05-31T13:00:00Z'
        },
        screenshot_path: null,
        status: 'pending',
        ai_diagnosis: null
      }

      // Primera llamada a single() devuelve la membresía, la segunda el feedback creado
      mockSingle
        .mockResolvedValueOnce({
          data: { tenant_id: 'tenant_xyz789', role: 'doctor' },
          error: null
        })
        .mockResolvedValueOnce({
          data: mockFeedbackResult,
          error: null
        })

      const context = {
        pathname: '/odontology/periodontogram',
        userAgent: 'Mozilla/5.0',
        userRole: 'doctor',
        viewportWidth: 1280,
        viewportHeight: 720,
        timestamp: '2026-05-31T13:00:00Z'
      }

      const result = await createSupportFeedback(
        'clinica-dental',
        'bug',
        'El periodontograma no guarda los cambios',
        context,
        null
      )

      expect(result).toEqual(mockFeedbackResult)
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        tenant_id: 'tenant_xyz789',
        type: 'bug',
        message: 'El periodontograma no guarda los cambios',
        screenshot_path: null,
        status: 'pending'
      }))
      expect(mockUpload).not.toHaveBeenCalled()
    })

    it('should upload screenshot and insert feedback when Base64 is provided', async () => {
      const mockFeedbackResult = {
        id: 'feedback_2',
        tenant_id: 'tenant_xyz789',
        screenshot_path: 'tenant_xyz789/mocked_filename.png',
        status: 'pending'
      }

      mockSingle
        .mockResolvedValueOnce({
          data: { tenant_id: 'tenant_xyz789', role: 'doctor' },
          error: null
        })
        .mockResolvedValueOnce({
          data: mockFeedbackResult,
          error: null
        })

      mockUpload.mockResolvedValue({
        data: { path: 'tenant_xyz789/mocked_filename.png' },
        error: null
      })

      const context = {
        pathname: '/odontology/periodontogram',
        userAgent: 'Mozilla/5.0',
        userRole: 'doctor',
        viewportWidth: 1280,
        viewportHeight: 720,
        timestamp: '2026-05-31T13:00:00Z'
      }

      const result = await createSupportFeedback(
        'clinica-dental',
        'bug',
        'Bug visual en periodontograma',
        context,
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      )

      expect(result.screenshot_path).toContain('tenant_xyz789/')
      expect(mockUpload).toHaveBeenCalled()
    })
  })

  describe('resolveSupportFeedback', () => {
    it('should delete screenshot from storage and mark ticket as resolved', async () => {
      // 1. Mock de membresía
      mockSingle.mockResolvedValueOnce({
        data: { tenant_id: 'tenant_xyz789', role: 'doctor' },
        error: null
      })

      // 2. Mock de obtener feedback actual con screenshot
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'feedback_123',
          screenshot_path: 'tenant_xyz789/123456_screenshot.png'
        },
        error: null
      })

      // 3. Mock de borrado de storage
      mockRemove.mockResolvedValue({
        data: [],
        error: null
      })

      const success = await resolveSupportFeedback('clinica-dental', 'feedback_123')

      expect(success).toBe(true)
      expect(mockRemove).toHaveBeenCalledWith(['tenant_xyz789/123456_screenshot.png'])
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'resolved',
        screenshot_path: null
      }))
    })
  })

  describe('getFeedbacksForAI', () => {
    it('should query pending and diagnosed feedbacks for the tenant', async () => {
      const mockList = [
        { id: '1', status: 'pending', message: 'Error 1' },
        { id: '2', status: 'diagnosed', message: 'Error 2' }
      ]

      mockSingle.mockResolvedValueOnce({
        data: { tenant_id: 'tenant_xyz789', role: 'doctor' },
        error: null
      })

      // mockOrder es asíncrono y devuelve los datos finales
      mockOrder.mockResolvedValueOnce({
        data: mockList,
        error: null
      })

      const result = await getFeedbacksForAI()

      expect(result).toEqual(mockList)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('tenant_id', 'tenant_xyz789')
      expect(mockIn).toHaveBeenCalledWith('status', ['pending', 'diagnosed'])
    })
  })

  describe('saveAIDiagnosis', () => {
    it('should update feedback with AI diagnosis text and status to diagnosed', async () => {
      const success = await saveAIDiagnosis('feedback_123', 'El bug se debe a un error de validación en la línea 45 de X')

      expect(success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        ai_diagnosis: 'El bug se debe a un error de validación en la línea 45 de X',
        status: 'diagnosed'
      }))
      expect(mockEq).toHaveBeenCalledWith('id', 'feedback_123')
    })
  })
})
