import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCachedTenantId } from './getTenantId'

const mockHeaders = vi.fn()

vi.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    single: mockSingle,
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({
    from: () => ({
      select: mockSelect,
    }),
  }),
}))

describe('getCachedTenantId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tenant id directly from headers when slug matches', async () => {
    mockHeaders.mockResolvedValue({
      get: (key: string) => {
        if (key === 'x-tenant-slug') return 'clinica-test'
        if (key === 'x-tenant-id') return 'tenant-header-123'
        return null
      },
    })

    const id = await getCachedTenantId('clinica-test')
    expect(id).toBe('tenant-header-123')
    expect(mockSelect).not.toHaveBeenCalled()
  })

  it('falls back to database query when headers are missing or slug does not match', async () => {
    mockHeaders.mockResolvedValue({
      get: () => null,
    })
    mockSingle.mockResolvedValue({ data: { id: 'tenant-db-456' } })

    const id = await getCachedTenantId('otra-clinica')
    expect(id).toBe('tenant-db-456')
    expect(mockSelect).toHaveBeenCalled()
  })
})
