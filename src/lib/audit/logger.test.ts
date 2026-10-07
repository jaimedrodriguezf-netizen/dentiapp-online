import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logAuditEvent } from './logger'

const mockInsert = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    from: (table: string) => {
      if (table === 'audit_logs') {
        return { insert: mockInsert }
      }
      return {}
    },
  }),
}))

describe('Medical Audit Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records audit log with authenticated doctor info and resource details', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-doc-1', email: 'doctor@dentiapp.online' } },
    })

    await logAuditEvent({
      tenantId: 'tenant-123',
      action: 'create',
      resourceType: 'dental_record',
      resourceId: 'record-abc',
      details: { patient_id: 'pat-456', form_version: '033' },
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: 'tenant-123',
        user_id: 'user-doc-1',
        user_email: 'doctor@dentiapp.online',
        action: 'create',
        resource_type: 'dental_record',
        resource_id: 'record-abc',
        details: { patient_id: 'pat-456', form_version: '033' },
      })
    )
  })

  it('fails gracefully without throwing when database insert encounters an error', async () => {
    mockGetUser.mockRejectedValue(new Error('Network error'))

    await expect(
      logAuditEvent({
        tenantId: 'tenant-123',
        action: 'update',
        resourceType: 'patient',
        resourceId: 'pat-1',
      })
    ).resolves.not.toThrow()
  })
})
