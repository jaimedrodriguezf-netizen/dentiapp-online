import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  resolveSupportFeedback,
  createSupportFeedback,
  getFeedbacksForAI
} from '../app/(tenant)/[slug]/settings/support/actions'

// Mocks individuales de supabase
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockIn = vi.fn()
const mockOrder = vi.fn()
const mockRemove = vi.fn()

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
    const fluentChain = {} as FluentChain
    fluentChain.select = mockSelect.mockReturnValue(fluentChain)
    fluentChain.insert = mockInsert.mockReturnValue(fluentChain)
    fluentChain.update = mockUpdate.mockReturnValue(fluentChain)
    fluentChain.eq = mockEq.mockReturnValue(fluentChain)
    fluentChain.in = mockIn.mockReturnValue(fluentChain)
    fluentChain.order = mockOrder.mockReturnValue(fluentChain)
    fluentChain.single = mockSingle
    
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
              upload: vi.fn().mockResolvedValue({ data: { path: 'mocked.png' }, error: null }),
              remove: mockRemove.mockResolvedValue({ data: [], error: null })
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

describe('Security Pen-Testing — Support Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Check', () => {
    it('should block createSupportFeedback if user is not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })

      const context = {
        pathname: '/odontology',
        userAgent: 'Mozilla/5.5',
        userRole: 'doctor',
        viewportWidth: 1024,
        viewportHeight: 768,
        timestamp: new Date().toISOString()
      }

      await expect(
        createSupportFeedback('demo', 'bug', 'Alerta', context, null)
      ).rejects.toThrow('Usuario no autenticado')
    })
  })

  describe('Multi-tenant Isolation Check', () => {
    it('should block access if user does not belong to the tenant', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user_attacker', email: 'attacker@evil.com' } }
      })

      // Simular que no tiene membresía (retorna null en tenant_members)
      mockSingle.mockResolvedValueOnce({ data: null, error: null })

      const context = {
        pathname: '/odontology',
        userAgent: 'Mozilla/5.5',
        userRole: 'doctor',
        viewportWidth: 1024,
        viewportHeight: 768,
        timestamp: new Date().toISOString()
      }

      await expect(
        createSupportFeedback('demo', 'bug', 'Ataque', context, null)
      ).rejects.toThrow('No tenés membresía para este tenant')
    })
  })

  describe('Broken Function Level Authorization (BFLA) Check', () => {
    it('should block resolveSupportFeedback for unauthorized roles (nurse)', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user_nurse', email: 'nurse@dentiapp.online' } }
      })

      // Simular membresía con rol nurse
      mockSingle.mockResolvedValueOnce({
        data: { tenant_id: 'tenant_xyz', role: 'nurse' },
        error: null
      })

      await expect(
        resolveSupportFeedback('demo', 'feedback_123')
      ).rejects.toThrow('No tenés permisos para realizar esta acción')
    })

    it('should block getFeedbacksForAI for unauthorized roles (receptionist)', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: { id: 'user_receptionist', email: 'receptionist@dentiapp.online' } }
      })

      // Simular membresía con rol receptionist
      mockSingle.mockResolvedValueOnce({
        data: { tenant_id: 'tenant_xyz', role: 'receptionist' },
        error: null
      })

      await expect(
        getFeedbacksForAI()
      ).rejects.toThrow('No tenés permisos para realizar esta acción')
    })
  })
})
