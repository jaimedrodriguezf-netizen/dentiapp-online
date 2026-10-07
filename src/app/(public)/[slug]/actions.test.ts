import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookAppointment } from './actions'

const mockRpc = vi.fn()
const mockInsert = vi.fn()
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
      insert: mockInsert,
    }),
    rpc: mockRpc,
  }),
}))

describe('bookAppointment Public Action Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: { id: 'tenant-123' }, error: null })
  })

  it('rejects empty patient name', async () => {
    const fd = new FormData()
    fd.append('name', '')
    fd.append('phone', '0991234567')
    fd.append('date', '2026-05-10')
    fd.append('time', '10:00')

    const res = await bookAppointment('test-clinic', null, fd)
    expect(res).toEqual({ error: 'El nombre es requerido' })
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('rejects invalid date format', async () => {
    const fd = new FormData()
    fd.append('name', 'Juan Perez')
    fd.append('phone', '0991234567')
    fd.append('date', 'invalid-date')
    fd.append('time', '10:00')

    const res = await bookAppointment('test-clinic', null, fd)
    expect(res).toEqual({ error: 'Formato de fecha inválido' })
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('rejects invalid time format', async () => {
    const fd = new FormData()
    fd.append('name', 'Juan Perez')
    fd.append('phone', '0991234567')
    fd.append('date', '2026-05-10')
    fd.append('time', 'invalid-time')

    const res = await bookAppointment('test-clinic', null, fd)
    expect(res).toEqual({ error: 'Formato de hora inválido' })
    expect(mockRpc).not.toHaveBeenCalled()
  })
})
